# Reimbursements manager review (admin-site)

## Summary

Finance and operations managers need an **admin-site** page to review attendee **travel receipt** submissions in a **Ramp-inspired** inbox: scan a queue, open a receipt beside the metadata, and approve or reject with context. The mobile app submits receipts via Adonix; this work is **frontend-only** in **admin-site**, backed by the reimbursement APIs described in `adonix/docs/travel-receipt-reimbursement.md`.

## Product context

- Attendees upload **PDF or images** (PNG, JPG, HEIC, etc.) plus **expense date** and **requested amount** (may be **less** than the total on a shared receipt, e.g. team bus ticket).
- Registration stores `requestTravelReimbursement`; admission stores `reimbursementValue` (approved travel cap in dollars — confirm units in API/types when wiring).
- Statistics already counts how many registrants requested reimbursement (`app/lib/api/statistics.ts`).

## UX direction (Ramp-style)

Think **spend inbox**, not a bare data grid.

### Layout (desktop)

```
┌─────────────────────────────────────────────────────────────────┐
│  Reimbursements          [Refresh]     Summary: 12 pending · $840 │
├──────────────┬──────────────────────────────────────────────────┤
│ Filters      │  Detail header: Jane Doe · $45.00 · Apr 12, 2026 │
│ [Needs review│  ┌─────────────────────┬──────────────────────┐ │
│  Approved    │  │ Receipt preview      │ Context panel        │ │
│  Rejected    │  │ (PDF/image zoom)     │ Email, user id       │ │
│  All]        │  │                      │ Approved cap: $75    │ │
│              │  │                      │ Requested: $45 ✓     │ │
│ Search…      │  └─────────────────────┴──────────────────────┘ │
│              │  [Approve]  [Reject…]  [Open full size]             │
│ ● Jane $45   │  Internal note (optional textarea)                 │
│   Apr 12     │                                                   │
│ ○ Alex $120  │                                                   │
│   …          │                                                   │
└──────────────┴──────────────────────────────────────────────────┘
```

### Interaction patterns

| Pattern | Behavior |
| --- | --- |
| **Queue first** | Default tab: submissions ready for review (`uploadCompletedAt` set, status `pending` if backend supports status). |
| **Master–detail** | Click row in left list → load detail + fetch fresh presigned download URL for preview. |
| **Status chips** | Color-coded: pending (amber), approved (green), rejected (red), incomplete upload (gray). |
| **Amount formatting** | Display `requestedAmountCents` as USD (`$45.00`). Never show raw cents in UI. |
| **Cap hint** | If `reimbursementValue` is available for that user, show approved cap and a **warning** when requested amount exceeds cap (still allow manager judgment). |
| **Receipt preview** | PDF: `<iframe>` or embed with presigned URL. JPEG/PNG/WebP: `<img>` with zoom or fit-width. HEIC/HEIF: browser preview often fails — show friendly message + **Download / open in new tab** using presigned URL. |
| **Reject flow** | Reject opens modal: required short reason (stored via API). Approve is one click with optional confirm if over cap. |
| **Keyboard** | Optional but nice: `↑`/`↓` or `j`/`k` to move selection in list when focus is not in an input. |
| **Empty states** | Clear copy when queue is empty or S3 preview fails (bucket not ready). |
| **Mobile** | Stack list above detail; actions sticky at bottom. Use existing `constants.scss` breakpoints (`@mixin mobile`). |

### Non-goals (v1 UI)

- Payout execution (ACH, Ramp card, etc.).
- OCR or auto-extract line items.
- Bulk approve (stretch).

## Technical constraints (admin-site)

Follow **`admin-site/AGENTS.md`**:

- New route: `app/reimbursements/page.tsx` (+ colocated components if the file grows).
- Register **`/reimbursements`** in `util/routes.ts` (nav label e.g. **Reimbursements**, icon: receipt/money — pick from Font Awesome already used in routes).
- **`"use client"`** page; gate with `useRoles()` — **`ADMIN`** only (show `<Unauthorized />` otherwise).
- API: generated SDK + `handleError` from `util/api-client.ts`. **No raw fetch** to Adonix.
- After Adonix ships reimbursement routes, run **`npm run update-adonix`** and commit `generated/`.
- Data helpers in **`app/lib/api/reimbursements.ts`** (fetch all, fetch one, download URL, approve/reject mutations).
- Styling: **CSS Modules** (`*.module.scss`) + HackIllinois palette from `app/constants.scss`. MUI is OK where other pages use it (`attendances`, `sponsors` DataGrid/toolbars) — prefer **split-pane inbox** over a bare DataGrid for the main experience; a grid can be a secondary “table view” toggle if useful.
- **No local login in agent sessions** — verify with `npm run build`, `npm run lint`, `npm run format:check`; note manual QA in PR test plan.

## Data & API expectations

Assume Adonix endpoints from `adonix/docs/travel-receipt-reimbursement.md`:

| Need | Endpoint |
| --- | --- |
| Manager queue | `GET /reimbursement/receipts/all/` (`ADMIN`) |
| Single submission | `GET /reimbursement/receipts/{id}/` |
| Preview / download | `GET /reimbursement/receipts/{id}/download/` → `{ url }` (short-lived; **refetch when opening detail**) |
| Approve / reject | **Not in backend spec v1** — if missing, either extend Adonix in the same PR (`PATCH` with `status`, `reviewedAt`, `rejectionReason`, `reviewerNotes`) **or** ship read-only review UI first and stub action buttons with TODO. Prefer **implementing backend review endpoints** so the page is fully functional. |

Enrich detail panel (parallel fetches, tolerate failures):

- `UserService.getUserById({ path: { id: userId } })` — name / contact if exposed.
- Registration/admission data for cap — use existing generated services if a bulk or per-user admission read exists; otherwise show user id only and add TODO.

Sort default: **oldest pending first** (FIFO queue).

## Files to reference

| Area | Path |
| --- | --- |
| Admin conventions | `admin-site/AGENTS.md` |
| Role gating + API errors | `util/api-client.ts`, `components/Unauthorized/` |
| MUI table + filters example | `app/attendances/page.tsx` |
| DataGrid + admin refresh | `app/sponsors/page.tsx` |
| API helper pattern | `app/lib/api/attendance.ts`, `app/lib/api/statistics.ts` |
| Backend contract | `adonix/docs/travel-receipt-reimbursement.md` |

## Acceptance criteria

1. Nav entry **Reimbursements** visible to admins; hidden or unauthorized for others.
2. Page loads submission list from Adonix; loading and error states handled.
3. Selecting a submission shows metadata, context, and receipt preview (or download fallback).
4. Managers can **approve** and **reject with reason** when backend supports it; list updates without full page reload.
5. Presigned URLs are not cached beyond detail view session; refetch download URL on selection.
6. `npm run build` and `npm run lint` pass; code matches repo style (4-space, no semicolons in TS).

## Open questions

1. Is `reimbursementValue` in **dollars** or **cents** on admission objects? Normalize in one helper in `app/lib/api/reimbursements.ts`.
2. Should **STAFF** (non-admin) have read-only access?
3. Single global queue vs filter by “upload incomplete”?

---

## Implementation prompt (copy below)

Attach **`admin-site/`** and, if the model can edit backend too, **`adonix/`**. Point it at this file and `adonix/docs/travel-receipt-reimbursement.md`.

```text
You are building the HackIllinois admin-site reimbursements manager review page (Next.js 15 App Router, client components, generated Adonix SDK).

Read first:
- admin-site/AGENTS.md
- admin-site/docs/reimbursements-manager-review.md (UX + acceptance criteria)
- adonix/docs/travel-receipt-reimbursement.md (API contract)

Goal: Ramp-style manager inbox to review travel receipt submissions — queue on the left, receipt preview + attendee context + approve/reject on the right. Backend may already exist or may need review endpoints; make the page fully functional end-to-end.

Admin-site requirements:
1. Add route app/reimbursements/page.tsx (+ small colocated components if needed: ReimbursementQueue, ReimbursementDetail, RejectModal).
2. Add app/reimbursements/styles.module.scss using app/constants.scss variables; responsive master-detail (stack on mobile).
3. Register /reimbursements in util/routes.ts with an appropriate Font Awesome icon.
4. Gate page with useRoles() — ADMIN only; use <Unauthorized /> pattern from app/sponsors/page.tsx.
5. Create app/lib/api/reimbursements.ts:
   - loadAllReceiptSubmissions() via generated SDK (GET /reimbursement/receipts/all/)
   - loadReceiptSubmission(id)
   - getReceiptDownloadUrl(id) — call download endpoint each time user opens detail (URLs expire ~60s)
   - approveReceipt(id, optional note) / rejectReceipt(id, reason) — wire to PATCH endpoints
   - formatMoneyFromCents(cents)
   - optional: loadReviewerContext(userId) combining UserService.getUserById and admission/registration fields for reimbursement cap
6. Use handleError() for all SDK calls; no raw fetch.
7. If generated/ lacks reimbursement types/services, run npm run update-adonix against a spec that includes them; if backend not deployed yet, add minimal adonix review routes first (see below) then regenerate.

UX (Ramp-inspired — mandatory):
- Top: page title, refresh, summary chips (count pending, sum of pending requested amounts).
- Left: filter tabs (Needs review, Approved, Rejected, All) + search by name/userId/fileName; list rows show submitter label, formatted amount, expense date, status chip, relative submitted time.
- Right: detail for selected row — large receipt preview area (iframe for PDF, img for jpeg/png/webp, HEIC fallback with download CTA), context panel (user id, email/name if available, approved reimbursement cap with warning if requested > cap), optional internal notes field.
- Primary actions: Approve (primary), Reject (opens modal, reason required).
- After action, update local state or refetch list; select next pending item automatically.
- Empty, loading, and S3/preview error states with clear copy.

Backend coordination (if review mutations missing):
- In adonix reimbursement service, add PATCH /reimbursement/receipts/{id}/review/ (ADMIN) body: { status: "approved" | "rejected", rejectionReason?: string, reviewerNotes?: string }
- Persist status, reviewedAt, reviewedBy, rejectionReason on submission document; extend GET all to return these fields.
- Follow adonix/AGENTS.md: specification(), Zod schemas, router tests.

Do NOT: deploy, run wrangler, or build mobile app. Do NOT hand-edit generated/ except via update-adonix.

Quality bar:
- npm run lint && npm run format:check && npm run build must pass.
- No `any` types.
- PR test plan: list manual checks (admin login, select receipt, preview PDF/png, reject with reason, approve, over-cap warning).

Deliverables: working admin page + api helper module + nav entry; optional adonix review endpoints if needed; short README note in PR body about update-adonix after backend merge.
```
