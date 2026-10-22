import {
    AdmissionService,
    RegistrationService,
    UserService,
    type UserInfo,
} from "@/generated"
import { client } from "@/generated/client.gen"
import { handleError } from "@/util/api-client"
import {
    capDollarsToCents,
    type ReceiptSubmission,
} from "@/util/reimbursements"

export { formatMoneyFromCents } from "@/util/reimbursements"

// TODO: The reimbursement routes (HackIllinois/adonix#384) aren't in the live Adonix spec until
// that deploys, so generated/ has no ReimbursementService yet. These calls go through the same
// hey-api client (and interceptors) the generated services use. Once it's live, run
// `npm run update-adonix` and swap these for the generated ReimbursementService methods and types.

interface ReceiptSubmissions {
    submissions: ReceiptSubmission[]
}

interface ReceiptDownloadURL {
    url: string
}

// Mirrors adonix ReceiptReviewRequestSchema. "pending" clears a previous decision.
export type ReviewRequest =
    | { status: "approved"; reviewerNotes?: string }
    | { status: "rejected"; rejectionReason: string; reviewerNotes?: string }
    | { status: "pending" }

export async function loadAllReceiptSubmissions(): Promise<
    ReceiptSubmission[]
> {
    const result = await client
        .get<ReceiptSubmissions, unknown, false>({
            url: "/reimbursement/receipts/all/",
        })
        .then(handleError)
    return result.submissions
}

export async function loadReceiptSubmission(
    id: string,
): Promise<ReceiptSubmission> {
    return client
        .get<ReceiptSubmission, unknown, false>({
            url: "/reimbursement/receipts/{id}/",
            path: { id },
        })
        .then(handleError)
}

// Presigned URLs expire after about a minute, so call this every time a receipt is opened and
// never cache the result. Doesn't alert on failure: the preview pane shows its own error state.
export async function getReceiptDownloadUrl(id: string): Promise<string> {
    const result = await client.get<ReceiptDownloadURL, unknown, false>({
        url: "/reimbursement/receipts/{id}/download/",
        path: { id },
    })
    if (result.error || !result.data?.url) {
        throw new Error("Receipt file is unavailable")
    }
    return result.data.url
}

async function reviewReceipt(
    id: string,
    body: ReviewRequest,
): Promise<ReceiptSubmission> {
    return client
        .patch<ReceiptSubmission, unknown, false>({
            url: "/reimbursement/receipts/{id}/review/",
            path: { id },
            body,
        })
        .then(handleError)
}

export function approveReceipt(id: string, reviewerNotes?: string) {
    return reviewReceipt(id, {
        status: "approved",
        reviewerNotes: reviewerNotes || undefined,
    })
}

export function rejectReceipt(
    id: string,
    rejectionReason: string,
    reviewerNotes?: string,
) {
    return reviewReceipt(id, {
        status: "rejected",
        rejectionReason,
        reviewerNotes: reviewerNotes || undefined,
    })
}

export function resetReceipt(id: string) {
    return reviewReceipt(id, { status: "pending" })
}

export interface AttendeeContext {
    name?: string
    email?: string
    // Approved travel cap from the admission decision, normalized to cents
    capCents?: number
    requestedTravelReimbursement?: boolean
}

// Names, emails and caps for every attendee, in two bulk calls. Failures are tolerated
// (the page falls back to user ids) and don't raise alerts.
export async function loadAttendeeDirectory(): Promise<
    Map<string, AttendeeContext>
> {
    const directory = new Map<string, AttendeeContext>()
    const entry = (userId: string) => {
        const existing = directory.get(userId) ?? {}
        directory.set(userId, existing)
        return existing
    }

    const [registrations, admissions] = await Promise.allSettled([
        RegistrationService.getRegistrationAllByType({
            path: { type: "submitted" },
        }),
        AdmissionService.getAdmissionRsvpStaff(),
    ])

    if (registrations.status === "fulfilled" && registrations.value.data) {
        for (const registration of registrations.value.data) {
            const context = entry(registration.userId)
            const first = registration.preferredName || registration.firstName
            const name = [first, registration.lastName]
                .filter(Boolean)
                .join(" ")
            context.name = name || undefined
            context.email = registration.email
            context.requestedTravelReimbursement =
                registration.requestTravelReimbursement
        }
    }

    if (admissions.status === "fulfilled" && admissions.value.data) {
        for (const decision of admissions.value.data) {
            entry(decision.userId).capCents = capDollarsToCents(
                decision.reimbursementValue,
            )
        }
    }

    return directory
}

// Per-user fallback for submitters missing from the bulk directory
export async function loadUserInfo(
    userId: string,
): Promise<UserInfo | undefined> {
    const result = await UserService.getUserById({ path: { id: userId } })
    return result.data
}
