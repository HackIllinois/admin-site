// Pure logic for the reimbursements review page. Kept free of React and the DOM so it can be
// unit tested. The API calls live in app/lib/api/reimbursements.ts.

// Mirrors adonix ReceiptContentTypeSchema
export type ReceiptContentType =
    | "application/pdf"
    | "image/jpeg"
    | "image/png"
    | "image/webp"
    | "image/heic"
    | "image/heif"

export type ReviewStatus = "pending" | "approved" | "rejected"

// What the page shows: a review status, or "incomplete" when the file never finished uploading
export type DisplayStatus = ReviewStatus | "incomplete"

// Mirrors adonix ReceiptSubmissionSchema
export interface ReceiptSubmission {
    id: string
    userId: string
    expenseDate: string
    requestedAmountCents: number
    currency: string
    contentType: ReceiptContentType
    originalFileName?: string
    s3Key: string
    uploadCompletedAt: string | null
    createdAt: string
    updatedAt: string
    status: ReviewStatus
    reviewedAt: string | null
    reviewedBy: string | null
    rejectionReason: string | null
    // Internal to staff; Adonix only returns it to admins
    reviewerNotes: string | null
}

export type ReviewFilter =
    | "review"
    | "approved"
    | "rejected"
    | "incomplete"
    | "all"

export const REVIEW_FILTERS: { value: ReviewFilter; label: string }[] = [
    { value: "review", label: "Needs review" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "incomplete", label: "Incomplete" },
    { value: "all", label: "All" },
]

export const STATUS_LABELS: Record<DisplayStatus, string> = {
    pending: "Needs review",
    approved: "Approved",
    rejected: "Rejected",
    incomplete: "Upload incomplete",
}

export function displayStatus(submission: ReceiptSubmission): DisplayStatus {
    if (!submission.uploadCompletedAt) {
        return "incomplete"
    }
    return submission.status
}

export function matchesFilter(
    submission: ReceiptSubmission,
    filter: ReviewFilter,
): boolean {
    const status = displayStatus(submission)
    switch (filter) {
        case "review":
            return status === "pending"
        case "all":
            return true
        default:
            return status === filter
    }
}

export function formatMoneyFromCents(cents: number, currency = "USD"): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
    }).format(cents / 100)
}

// Admission reimbursementValue is stored in whole dollars (e.g. 12 means $12.00)
export function capDollarsToCents(reimbursementValue: number): number {
    return Math.round(reimbursementValue * 100)
}

export function isOverCap(
    submission: ReceiptSubmission,
    capCents: number | undefined,
): boolean {
    return capCents !== undefined && submission.requestedAmountCents > capCents
}

// expenseDate is a calendar date ("2026-04-12"), so format it without a timezone shift
export function formatExpenseDate(expenseDate: string): string {
    const [year, month, day] = expenseDate.split("-").map(Number)
    if (!year || !month || !day) {
        return expenseDate
    }
    return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" },
    )
}

export function formatRelativeTime(iso: string, now = Date.now()): string {
    const then = new Date(iso).getTime()
    if (Number.isNaN(then)) {
        return ""
    }

    const minutes = Math.round((now - then) / 60_000)
    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes}m ago`

    const hours = Math.round(minutes / 60)
    if (hours < 24) return `${hours}h ago`

    const days = Math.round(hours / 24)
    if (days < 30) return `${days}d ago`

    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    })
}

// When the submission became reviewable, falling back to when it was created
function submittedAt(submission: ReceiptSubmission): number {
    return new Date(
        submission.uploadCompletedAt ?? submission.createdAt,
    ).getTime()
}

// FIFO queue: oldest pending first, then reviewed items newest first, incomplete uploads last
export function sortSubmissions(
    submissions: ReceiptSubmission[],
): ReceiptSubmission[] {
    const rank: Record<DisplayStatus, number> = {
        pending: 0,
        approved: 1,
        rejected: 1,
        incomplete: 2,
    }

    return [...submissions].sort((a, b) => {
        const statusA = displayStatus(a)
        const statusB = displayStatus(b)
        if (rank[statusA] !== rank[statusB]) {
            return rank[statusA] - rank[statusB]
        }
        if (statusA === "pending") {
            return submittedAt(a) - submittedAt(b)
        }
        return submittedAt(b) - submittedAt(a)
    })
}

export interface ReimbursementSummary {
    pendingCount: number
    pendingCents: number
    approvedCount: number
    approvedCents: number
}

export function summarize(
    submissions: ReceiptSubmission[],
): ReimbursementSummary {
    const summary: ReimbursementSummary = {
        pendingCount: 0,
        pendingCents: 0,
        approvedCount: 0,
        approvedCents: 0,
    }

    for (const submission of submissions) {
        const status = displayStatus(submission)
        if (status === "pending") {
            summary.pendingCount++
            summary.pendingCents += submission.requestedAmountCents
        } else if (status === "approved") {
            summary.approvedCount++
            summary.approvedCents += submission.requestedAmountCents
        }
    }

    return summary
}

export function matchesSearch(
    submission: ReceiptSubmission,
    search: string,
    name?: string,
    email?: string,
): boolean {
    const query = search.trim().toLowerCase()
    if (!query) {
        return true
    }

    return [
        name,
        email,
        submission.userId,
        submission.originalFileName,
        submission.id,
    ].some((field) => field?.toLowerCase().includes(query))
}

// After acting on an item, pick the next pending item in list order (wrapping around)
export function nextPendingId(
    ordered: ReceiptSubmission[],
    currentId: string,
): string | null {
    const index = ordered.findIndex((s) => s.id === currentId)
    const rotated = [...ordered.slice(index + 1), ...ordered.slice(0, index)]
    const next = rotated.find(
        (s) => s.id !== currentId && displayStatus(s) === "pending",
    )
    return next?.id ?? null
}

export type PreviewKind = "pdf" | "image" | "unsupported"

// Browsers (other than Safari) can't render HEIC/HEIF, so those get a download fallback
export function previewKind(contentType: ReceiptContentType): PreviewKind {
    switch (contentType) {
        case "application/pdf":
            return "pdf"
        case "image/jpeg":
        case "image/png":
        case "image/webp":
            return "image"
        default:
            return "unsupported"
    }
}
