import assert from "node:assert/strict"
import { test } from "node:test"
import { APPLICANT_TAGS, tagLabel, tagStyle } from "../util/applicant-tags"

test("APPLICANT_TAGS lists every tag in design order", () => {
    assert.deepEqual(APPLICANT_TAGS, [
        "IN_REVIEW",
        "ADMITTED",
        "ADMITTED_REIMBURSED",
        "WAITLISTED",
        "REJECTED",
    ])
})

test("tagLabel gives the label shown in the design", () => {
    assert.equal(tagLabel("IN_REVIEW"), "In review")
    assert.equal(tagLabel("ADMITTED_REIMBURSED"), "Admitted + reimb.")
    assert.equal(tagLabel("REJECTED"), "Rejected")
})

test("tagStyle gives distinct background, text and border colors per tag", () => {
    const backgrounds = new Set(
        APPLICANT_TAGS.map((t) => tagStyle(t).background),
    )
    assert.equal(backgrounds.size, APPLICANT_TAGS.length)
    assert.deepEqual(tagStyle("ADMITTED"), {
        background: "#E6F6EC",
        color: "#16733F",
        border: "#B8E3C8",
        dot: "#1E9E5A",
    })
})
