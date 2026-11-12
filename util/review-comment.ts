// A review comment holds up to two labelled parts. Anything else a reviewer
// wrote earlier (the preamble) is kept as it is.
const REASON = "Score changed: "
const NOTES = "Notes: "
const BOUNDARY = /(?:^|\n\n)(?=(?:Score changed|Notes): )/

export type ParsedComment = {
    preamble: string
    reason: string
    notes: string
}

export function parseReviewComment(comment: string | undefined): ParsedComment {
    const parsed: ParsedComment = { preamble: "", reason: "", notes: "" }
    for (const part of (comment ?? "").split(BOUNDARY)) {
        if (part.startsWith(REASON)) {
            parsed.reason = part.slice(REASON.length).trim()
        } else if (part.startsWith(NOTES)) {
            parsed.notes = part.slice(NOTES.length).trim()
        } else if (part.trim()) {
            parsed.preamble = part.trim()
        }
    }
    return parsed
}

type Edit = { edited: boolean; reason: string; notes: string }

// Builds the comment to save. The earlier reason and any other earlier text
// stay. A new reason replaces the reason only when the score was edited and
// the reason is not empty. The notes text is the edited note text.
export function mergeReviewComment(
    existing: string | undefined,
    edit: Edit,
): string | undefined {
    const old = parseReviewComment(existing)
    const newReason = edit.edited ? edit.reason.trim() : ""
    const reason = newReason || old.reason
    const notes = edit.notes.trim()
    const parts = [
        old.preamble,
        reason ? `${REASON}${reason}` : "",
        notes ? `${NOTES}${notes}` : "",
    ].filter(Boolean)
    return parts.length > 0 ? parts.join("\n\n") : undefined
}
