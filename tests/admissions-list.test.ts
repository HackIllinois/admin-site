import assert from "node:assert/strict"
import { test } from "node:test"
import type { Applicant } from "../generated"
import {
    aiScoreText,
    computeStats,
    filterApplicants,
    reviewerNames,
    reviewerOptions,
    tagCounts,
} from "../util/admissions-list"

function row(over: Partial<Applicant>): Applicant {
    return {
        userId: "u1",
        name: "Priya Sharma",
        email: "priya@example.com",
        school: "UIUC",
        reviewers: [],
        aiScore: null,
        aiGradeFailed: false,
        finalScore: null,
        edited: false,
        tag: "IN_REVIEW",
        ...over,
    }
}

const rows: Applicant[] = [
    row({
        userId: "a",
        reviewers: [{ reviewerId: "r1", name: "Rae Reviewer", score: 4 }],
        aiScore: 4,
        edited: true,
        tag: "ADMITTED",
    }),
    row({
        userId: "b",
        name: "Marcus Johnson",
        email: "marcusj@example.com",
        school: "Purdue University",
        reviewers: [
            { reviewerId: "r2", name: null, score: null },
            { reviewerId: "r1", name: "Rae Reviewer", score: null },
        ],
        aiScore: 3,
    }),
    row({
        userId: "c",
        name: "Sofia Reyes",
        email: "sofia@example.com",
        school: "Northwestern",
        tag: "REJECTED",
    }),
]

test("computeStats counts total, AI graded, person-checked and edited", () => {
    assert.deepEqual(computeStats(rows), {
        total: 3,
        aiGraded: 2,
        checked: 1,
        edited: 1,
    })
})

test("computeStats handles an empty list", () => {
    assert.deepEqual(computeStats([]), {
        total: 0,
        aiGraded: 0,
        checked: 0,
        edited: 0,
    })
})

test("filterApplicants searches name, email and school, ignoring case", () => {
    const f = (query: string) =>
        filterApplicants(rows, { query, reviewer: "all", tag: "all" }).map(
            (r) => r.userId,
        )
    assert.deepEqual(f("MARCUS"), ["b"])
    assert.deepEqual(f("sofia@"), ["c"])
    assert.deepEqual(f("purdue"), ["b"])
    assert.deepEqual(f("  "), ["a", "b", "c"])
    assert.deepEqual(f("zzz"), [])
})

test("filterApplicants filters by reviewer, unassigned and tag", () => {
    const f = (reviewer: string, tag: "all" | Applicant["tag"] = "all") =>
        filterApplicants(rows, { query: "", reviewer, tag }).map(
            (r) => r.userId,
        )
    assert.deepEqual(f("r1"), ["a", "b"])
    assert.deepEqual(f("none"), ["c"])
    assert.deepEqual(f("r1", "ADMITTED"), ["a"])
    assert.deepEqual(f("all", "REJECTED"), ["c"])
})

test("filterApplicants does not change its input", () => {
    const copy = JSON.stringify(rows)
    filterApplicants(rows, { query: "a", reviewer: "r1", tag: "all" })
    assert.equal(JSON.stringify(rows), copy)
})

test("tagCounts reflect the reviewer filter", () => {
    assert.deepEqual(tagCounts(rows, "all"), {
        all: 3,
        IN_REVIEW: 1,
        ADMITTED: 1,
        ADMITTED_REIMBURSED: 0,
        WAITLISTED: 0,
        REJECTED: 1,
    })
    assert.deepEqual(tagCounts(rows, "r1"), {
        all: 2,
        IN_REVIEW: 1,
        ADMITTED: 1,
        ADMITTED_REIMBURSED: 0,
        WAITLISTED: 0,
        REJECTED: 0,
    })
    assert.equal(tagCounts(rows, "none").all, 1)
})

test("reviewerOptions lists All, Unassigned, then unique reviewers sorted by id, labeled by name or id", () => {
    assert.deepEqual(reviewerOptions(rows), [
        { value: "all", label: "All reviewers" },
        { value: "none", label: "Unassigned" },
        { value: "r1", label: "Rae Reviewer" },
        { value: "r2", label: "r2" },
    ])
})

test("aiScoreText shows the AI score, a dash when ungraded, and AI failed after a failed grade", () => {
    assert.equal(aiScoreText(row({ aiScore: 4 })), "4")
    assert.equal(aiScoreText(row({ aiScore: null })), "—")
    assert.equal(
        aiScoreText(row({ aiScore: null, aiGradeFailed: true })),
        "AI failed",
    )
})

test("reviewerNames shows names, with the id when the name is unknown", () => {
    assert.equal(
        reviewerNames(
            row({
                reviewers: [
                    { reviewerId: "r1", name: "Rae Reviewer", score: 4 },
                    { reviewerId: "r9", name: null, score: null },
                ],
            }),
        ),
        "Rae Reviewer, r9",
    )
})
