import type { ApplicantTag } from "@/generated"

export const APPLICANT_TAGS: ApplicantTag[] = [
    "IN_REVIEW",
    "ADMITTED",
    "ADMITTED_REIMBURSED",
    "WAITLISTED",
    "REJECTED",
]

const LABELS: Record<ApplicantTag, string> = {
    IN_REVIEW: "In review",
    ADMITTED: "Admitted",
    ADMITTED_REIMBURSED: "Admitted + reimb.",
    WAITLISTED: "Waitlisted",
    REJECTED: "Rejected",
}

export type TagStyle = {
    background: string
    color: string
    border: string
    dot: string
}

const STYLES: Record<ApplicantTag, TagStyle> = {
    IN_REVIEW: {
        background: "#FFF6DB",
        color: "#8A5A00",
        border: "#F3DC9A",
        dot: "#D99A00",
    },
    ADMITTED: {
        background: "#E6F6EC",
        color: "#16733F",
        border: "#B8E3C8",
        dot: "#1E9E5A",
    },
    ADMITTED_REIMBURSED: {
        background: "#E8F0FD",
        color: "#1D4FB0",
        border: "#BFD3F7",
        dot: "#2F6FE0",
    },
    WAITLISTED: {
        background: "#F1EEEA",
        color: "#5E5852",
        border: "#DDD6CD",
        dot: "#9A9189",
    },
    REJECTED: {
        background: "#FCE9E7",
        color: "#A3271B",
        border: "#F2C3BD",
        dot: "#C8372A",
    },
}

export function tagLabel(tag: ApplicantTag): string {
    return LABELS[tag]
}

export function tagStyle(tag: ApplicantTag): TagStyle {
    return STYLES[tag]
}
