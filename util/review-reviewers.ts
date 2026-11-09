import type { Applicant } from "@/generated"

export type ReviewerRow = {
    reviewerId: string
    name: string
    score: number | null
    isMe: boolean
}

// Chips come from the applicant list row, which also holds pending reviewers.
export function reviewerRows(
    reviewers: Applicant["reviewers"] | undefined,
    names: Map<string, string>,
    myId: string,
): ReviewerRow[] {
    return (reviewers ?? []).map((r) => ({
        reviewerId: r.reviewerId,
        name: names.get(r.reviewerId) ?? r.reviewerId,
        score: r.score,
        isMe: r.reviewerId === myId,
    }))
}
