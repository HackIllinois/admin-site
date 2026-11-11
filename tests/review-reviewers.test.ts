import assert from "node:assert/strict"
import { test } from "node:test"
import { reviewerRows } from "../util/review-reviewers"

const names = new Map([
    ["a", "Ada"],
    ["b", "Bo"],
])

test("reviewerRows shows pending reviewers as null score", () => {
    const rows = reviewerRows(
        [
            { reviewerId: "a", name: null, score: 4 },
            { reviewerId: "b", name: null, score: null },
        ],
        names,
        "b",
    )
    assert.deepEqual(rows, [
        { reviewerId: "a", name: "Ada", score: 4, isMe: false },
        { reviewerId: "b", name: "Bo", score: null, isMe: true },
    ])
})

test("reviewerRows falls back to the id for unknown staff", () => {
    const rows = reviewerRows(
        [{ reviewerId: "z", name: null, score: null }],
        names,
        "a",
    )
    assert.equal(rows[0].name, "z")
})

test("reviewerRows is empty for a missing list", () => {
    assert.deepEqual(reviewerRows(undefined, names, "a"), [])
})

test("reviewerRows prefers the name from the applicant list", () => {
    const rows = reviewerRows(
        [{ reviewerId: "a", name: "Ada Lovelace", score: null }],
        names,
        "b",
    )
    assert.equal(rows[0].name, "Ada Lovelace")
})
