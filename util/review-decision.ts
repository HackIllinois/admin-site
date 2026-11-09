import type { AdmissionDecisionUpdate, ApplicantTag } from "@/generated"

export type ScoreMode = "keep" | "change"
export type DecisionBody = Omit<AdmissionDecisionUpdate, "userId">

export function tagToDecision(
    tag: ApplicantTag,
    reimbursement: number,
): DecisionBody {
    switch (tag) {
        case "IN_REVIEW":
            return { status: "TBD", admittedPro: false, reimbursementValue: 0 }
        case "ADMITTED":
            return {
                status: "ACCEPTED",
                admittedPro: false,
                reimbursementValue: 0,
            }
        case "ADMITTED_REIMBURSED":
            return {
                status: "ACCEPTED",
                admittedPro: false,
                reimbursementValue: reimbursement,
            }
        case "WAITLISTED":
            return {
                status: "WAITLISTED",
                admittedPro: false,
                reimbursementValue: 0,
            }
        case "REJECTED":
            return {
                status: "REJECTED",
                admittedPro: false,
                reimbursementValue: 0,
            }
    }
}

export function decisionToTag(
    status: AdmissionDecisionUpdate["status"],
    reimbursementValue: number,
): ApplicantTag {
    switch (status) {
        case "TBD":
            return "IN_REVIEW"
        case "ACCEPTED":
            return reimbursementValue > 0 ? "ADMITTED_REIMBURSED" : "ADMITTED"
        case "WAITLISTED":
            return "WAITLISTED"
        case "REJECTED":
            return "REJECTED"
    }
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
