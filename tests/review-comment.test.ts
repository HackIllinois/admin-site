import assert from "node:assert/strict"
import { test } from "node:test"
import { mergeReviewComment, parseReviewComment } from "../util/review-comment"

test("parseReviewComment splits reason, notes and other text", () => {
    assert.deepEqual(
        parseReviewComment("Score changed: too harsh\n\nNotes: good essay"),
        { preamble: "", reason: "too harsh", notes: "good essay" },
    )
    assert.deepEqual(parseReviewComment("old free text"), {
        preamble: "old free text",
        reason: "",
        notes: "",
    })
    assert.deepEqual(parseReviewComment(undefined), {
        preamble: "",
        reason: "",
        notes: "",
    })
})

test("parseReviewComment keeps blank lines inside notes", () => {
    const p = parseReviewComment("Notes: line one\n\nline two")
    assert.equal(p.notes, "line one\n\nline two")
})

test("merge keeps the earlier reason when the score is not edited", () => {
    const out = mergeReviewComment("Score changed: first\n\nNotes: a", {
        edited: false,
        reason: "",
        notes: "a b",
    })
    assert.equal(out, "Score changed: first\n\nNotes: a b")
})

test("merge keeps the earlier reason when the new reason is empty", () => {
    const out = mergeReviewComment("Score changed: first", {
        edited: true,
        reason: "  ",
        notes: "",
    })
    assert.equal(out, "Score changed: first")
})

test("merge replaces the reason only when a new reason is given", () => {
    const out = mergeReviewComment("Score changed: first\n\nNotes: a", {
        edited: true,
        reason: "second",
        notes: "a",
    })
    assert.equal(out, "Score changed: second\n\nNotes: a")
})

test("merge keeps unknown earlier text", () => {
    const out = mergeReviewComment("legacy remark", {
        edited: false,
        reason: "",
        notes: "new",
    })
    assert.equal(out, "legacy remark\n\nNotes: new")
})

test("merge changes only the note text", () => {
    const out = mergeReviewComment("Notes: old", {
        edited: false,
        reason: "",
        notes: "new",
    })
    assert.equal(out, "Notes: new")
})

test("merge returns undefined when nothing remains", () => {
    assert.equal(
        mergeReviewComment(undefined, { edited: false, reason: "", notes: "" }),
        undefined,
    )
})

test("merge with no earlier comment builds both parts", () => {
    assert.equal(
        mergeReviewComment(undefined, {
            edited: true,
            reason: "r",
            notes: "n",
        }),
        "Score changed: r\n\nNotes: n",
    )
})
