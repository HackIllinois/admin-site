import type { ApplicantTag, ApplicantTagUpdateRequest } from "@/generated"

export type ScoreMode = "keep" | "change"

// Body for PUT /admission/applicants/{id}/tag/. Only ADMITTED_REIMBURSED
// takes an amount.
export function tagRequest(
    tag: ApplicantTag,
    reimbursement: number,
): ApplicantTagUpdateRequest {
    return tag === "ADMITTED_REIMBURSED"
        ? { tag, reimbursementValue: reimbursement }
        : { tag }
}

function isValidScore(n: number | null): n is number {
    return n !== null && Number.isInteger(n) && n >= 1 && n <= 5
}

// The score this reviewer submits: the AI score when kept, else the pick.
export function scoreToSubmit(
    mode: ScoreMode,
    aiScore: number | null,
    picked: number | null,
): number | null {
    const score = mode === "keep" ? aiScore : picked
    return isValidScore(score) ? score : null
}

export function isEdited(
    mode: ScoreMode,
    aiScore: number | null,
    picked: number | null,
): boolean {
    return mode === "change" && isValidScore(aiScore) && isValidScore(picked)
        ? picked !== aiScore
        : false
}

// Positive dollar amount, or null when the text is not one.
export function parseReimbursement(text: string): number | null {
    const trimmed = text.trim()
    if (trimmed === "") return null
    const value = Number(trimmed)
    return Number.isFinite(value) && value > 0 ? value : null
}

export function reviewerStatus(score: number | null): string {
    return score === null ? "not yet" : `scored ${score}`
}

export function canRemoveReviewer(score: number | null): boolean {
    return score === null
}

export function initials(name: string): string {
    const letters = name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("")
    return letters || "?"
}

// The loaded decision is only overwritten when the staff member changed it.
// An amount typed for "Admitted + reimb." also counts as a change.
export function shouldSendDecision(
    initial: ApplicantTag,
    selected: ApplicantTag,
    reimbursementText: string,
): boolean {
    if (selected !== initial) return true
    return selected === "ADMITTED_REIMBURSED" && reimbursementText.trim() !== ""
}
