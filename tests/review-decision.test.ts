import assert from "node:assert/strict"
import { test } from "node:test"
import {
    initials,
    isEdited,
    parseReimbursement,
    scoreToSubmit,
    tagToDecision,
    decisionToTag,
    reviewerStatus,
    canRemoveReviewer,
    shouldSendDecision,
} from "../util/review-decision"

test("tagToDecision maps each tag to the update body", () => {
    assert.deepEqual(tagToDecision("IN_REVIEW", 0), {
        status: "TBD",
        admittedPro: false,
        reimbursementValue: 0,
    })
    assert.deepEqual(tagToDecision("ADMITTED", 99), {
        status: "ACCEPTED",
        admittedPro: false,
        reimbursementValue: 0,
    })
    assert.deepEqual(tagToDecision("ADMITTED_REIMBURSED", 150), {
        status: "ACCEPTED",
        admittedPro: false,
        reimbursementValue: 150,
    })
    assert.equal(tagToDecision("WAITLISTED", 5).status, "WAITLISTED")
    assert.equal(tagToDecision("WAITLISTED", 5).reimbursementValue, 0)
    assert.equal(tagToDecision("REJECTED", 5).status, "REJECTED")
})

test("decisionToTag is the reverse mapping", () => {
    assert.equal(decisionToTag("TBD", 0), "IN_REVIEW")
    assert.equal(decisionToTag("ACCEPTED", 0), "ADMITTED")
    assert.equal(decisionToTag("ACCEPTED", 40), "ADMITTED_REIMBURSED")
    assert.equal(decisionToTag("WAITLISTED", 0), "WAITLISTED")
    assert.equal(decisionToTag("REJECTED", 0), "REJECTED")
})

test("scoreToSubmit: keep sends the AI score", () => {
    assert.equal(scoreToSubmit("keep", 3, null), 3)
    assert.equal(scoreToSubmit("keep", 3, 5), 3)
})

test("scoreToSubmit: change sends the picked score", () => {
    assert.equal(scoreToSubmit("change", 3, 5), 5)
    assert.equal(scoreToSubmit("change", null, 2), 2)
})

test("scoreToSubmit returns null when nothing valid is chosen", () => {
    assert.equal(scoreToSubmit("change", 3, null), null)
    assert.equal(scoreToSubmit("keep", null, null), null)
    assert.equal(scoreToSubmit("change", 3, 6), null)
    assert.equal(scoreToSubmit("change", 3, 2.5), null)
    assert.equal(scoreToSubmit("change", 3, 0), null)
})

test("isEdited is true only when a picked score differs from the AI score", () => {
    assert.equal(isEdited("keep", 3, 5), false)
    assert.equal(isEdited("change", 3, 3), false)
    assert.equal(isEdited("change", 3, 4), true)
    assert.equal(isEdited("change", 3, null), false)
    assert.equal(isEdited("change", null, 4), false)
})

test("parseReimbursement accepts positive whole dollar amounts", () => {
    assert.equal(parseReimbursement("150"), 150)
    assert.equal(parseReimbursement(" 75 "), 75)
    assert.equal(parseReimbursement("12.5"), 12.5)
})

test("parseReimbursement rejects empty, zero, negative and non-numbers", () => {
    assert.equal(parseReimbursement(""), null)
    assert.equal(parseReimbursement("0"), null)
    assert.equal(parseReimbursement("-5"), null)
    assert.equal(parseReimbursement("abc"), null)
})

test("reviewerStatus and canRemoveReviewer follow the score", () => {
    assert.equal(reviewerStatus(null), "not yet")
    assert.equal(reviewerStatus(4), "scored 4")
    assert.equal(canRemoveReviewer(null), true)
    assert.equal(canRemoveReviewer(4), false)
})

test("initials uses first letters of the first two words", () => {
    assert.equal(initials("Marcus Johnson"), "MJ")
    assert.equal(initials("  ada  lovelace king "), "AL")
    assert.equal(initials("Prince"), "P")
    assert.equal(initials(""), "?")
})

test("shouldSendDecision sends only when the tag changed or an amount was typed", () => {
    assert.equal(shouldSendDecision("IN_REVIEW", "IN_REVIEW", ""), false)
    assert.equal(shouldSendDecision("IN_REVIEW", "REJECTED", ""), true)
    assert.equal(
        shouldSendDecision("ADMITTED_REIMBURSED", "ADMITTED_REIMBURSED", ""),
        false,
    )
    assert.equal(
        shouldSendDecision("ADMITTED_REIMBURSED", "ADMITTED_REIMBURSED", "80"),
        true,
    )
    assert.equal(shouldSendDecision("ADMITTED", "ADMITTED", "80"), false)
})
