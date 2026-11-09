import {
    AdmissionService,
    AuthService,
    RegistrationService,
    ResumeService,
    type ApplicantTag,
    type ApplicationReviewDetails,
    type RegistrationApplicationDraft,
    type UserInfo,
} from "@/generated"
import { tagToDecision } from "@/util/review-decision"

export type ReviewData = {
    id: string
    registration: RegistrationApplicationDraft
    details: ApplicationReviewDetails
    tag: ApplicantTag
    resumeUrl: string | null
    staff: UserInfo[]
    myId: string
}

type Result<T> = { data?: T; error?: unknown }

// Turns an api-client result into its data, or throws with a readable message.
function unwrap<T>(result: Result<T>): T {
    if (result.error !== undefined && result.error !== null) {
        throw new Error(errorMessage(result.error))
    }
    return result.data as T
}

export function errorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    if (typeof error === "string") return error
    if (error && typeof error === "object") {
        const e = error as { message?: unknown; error?: unknown }
        if (typeof e.message === "string") return e.message
        if (typeof e.error === "string") return e.error
    }
    return "Something went wrong"
}

export async function fetchNextId(): Promise<string> {
    const next = unwrap(await AdmissionService.getAdmissionReviewNext())
    return next.userId
}

export async function loadReview(id: string): Promise<ReviewData> {
    const [registration, details, applicants, staff, me, resume] =
        await Promise.all([
            RegistrationService.getRegistrationUseridById({ path: { id } }),
            AdmissionService.getAdmissionReviewById({ path: { id } }),
            AdmissionService.getAdmissionApplicants(),
            AuthService.getAuthRolesListInfoByRole({ path: { role: "STAFF" } }),
            AuthService.getAuthRoles(),
            ResumeService.getResumeDownloadById({ path: { id } }),
        ])

    const applicantRows = unwrap(applicants)
    return {
        id,
        registration: unwrap(registration),
        details: unwrap(details),
        tag: applicantRows.find((a) => a.userId === id)?.tag ?? "IN_REVIEW",
        // A missing resume is not fatal; the page shows a note instead.
        resumeUrl: resume.error ? null : (resume.data?.url ?? null),
        staff: unwrap(staff).userInfo,
        myId: unwrap(me).id,
    }
}

export async function addReviewer(id: string, reviewerId: string) {
    unwrap(
        await AdmissionService.putAdmissionReviewByIdReviewers({
            path: { id },
            body: { reviewerId },
        }),
    )
}

export async function removeReviewer(id: string, reviewerId: string) {
    unwrap(
        await AdmissionService.deleteAdmissionReviewByIdReviewersByReviewerId({
            path: { id, reviewerId },
        }),
    )
}

export async function submitScore(
    id: string,
    score: number,
    comment: string | undefined,
) {
    unwrap(
        await AdmissionService.putAdmissionReviewById({
            path: { id },
            body: comment ? { score, comment } : { score },
        }),
    )
}

export async function submitTag(
    id: string,
    tag: ApplicantTag,
    reimbursement: number,
) {
    unwrap(
        await AdmissionService.putAdmissionUpdate({
            body: [{ userId: id, ...tagToDecision(tag, reimbursement) }],
        }),
    )
}
