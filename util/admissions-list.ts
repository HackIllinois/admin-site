import type { Applicant, ApplicantTag } from "@/generated"
import { APPLICANT_TAGS } from "./applicant-tags"

export type TagFilter = "all" | ApplicantTag
export type ReviewerFilter = string // "all", "none", or a reviewer id

export type ListFilters = {
    query: string
    reviewer: ReviewerFilter
    tag: TagFilter
}

export type ListStats = {
    total: number
    aiGraded: number
    checked: number
    edited: number
}

export type TagCounts = Record<TagFilter, number>

export function computeStats(rows: Applicant[]): ListStats {
    return {
        total: rows.length,
        aiGraded: rows.filter((r) => r.aiScore !== null).length,
        checked: rows.filter((r) => r.reviewers.some((v) => v.score !== null))
            .length,
        edited: rows.filter((r) => r.edited).length,
    }
}

function matchesReviewer(row: Applicant, reviewer: ReviewerFilter): boolean {
    if (reviewer === "all") return true
    if (reviewer === "none") return row.reviewers.length === 0
    return row.reviewers.some((v) => v.reviewerId === reviewer)
}

function matchesQuery(row: Applicant, query: string): boolean {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return [row.name, row.email, row.school].some((field) =>
        field.toLowerCase().includes(q),
    )
}

export function filterApplicants(
    rows: Applicant[],
    filters: ListFilters,
): Applicant[] {
    return rows.filter(
        (r) =>
            matchesReviewer(r, filters.reviewer) &&
            matchesQuery(r, filters.query) &&
            (filters.tag === "all" || r.tag === filters.tag),
    )
}

// Counts per tag for the rows that pass the reviewer filter
export function tagCounts(
    rows: Applicant[],
    reviewer: ReviewerFilter,
): TagCounts {
    const byReviewer = rows.filter((r) => matchesReviewer(r, reviewer))
    const counts = { all: byReviewer.length } as TagCounts
    for (const tag of APPLICANT_TAGS) {
        counts[tag] = byReviewer.filter((r) => r.tag === tag).length
    }
    return counts
}

export function reviewerOptions(
    rows: Applicant[],
): { value: string; label: string }[] {
    const labels = new Map<string, string>()
    for (const r of rows)
        for (const v of r.reviewers)
            if (!labels.has(v.reviewerId) || v.name)
                labels.set(v.reviewerId, v.name ?? v.reviewerId)
    return [
        { value: "all", label: "All reviewers" },
        { value: "none", label: "Unassigned" },
        ...[...labels.keys()]
            .sort()
            .map((id) => ({ value: id, label: labels.get(id)! })),
    ]
}

export function reviewerNames(row: Applicant): string {
    return row.reviewers.map((v) => v.name ?? v.reviewerId).join(", ")
}

export function aiScoreText(row: Applicant): string {
    if (row.aiScore !== null) return String(row.aiScore)
    return row.aiGradeFailed ? "AI failed" : "—"
}
