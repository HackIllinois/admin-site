import assert from "node:assert/strict"
import { test } from "node:test"
import {
    capDollarsToCents,
    displayStatus,
    formatExpenseDate,
    formatMoneyFromCents,
    formatRelativeTime,
    isOverCap,
    matchesFilter,
    matchesSearch,
    nextPendingId,
    previewKind,
    ReceiptSubmission,
    sortSubmissions,
    summarize,
} from "../util/reimbursements"

function submission(
    overrides: Partial<ReceiptSubmission> = {},
): ReceiptSubmission {
    return {
        id: "a",
        userId: "github1",
        expenseDate: "2026-04-12",
        requestedAmountCents: 4500,
        currency: "USD",
        contentType: "application/pdf",
        s3Key: "github1/a.pdf",
        uploadCompletedAt: "2026-04-12T18:00:00.000Z",
        createdAt: "2026-04-12T17:59:00.000Z",
        updatedAt: "2026-04-12T18:00:00.000Z",
        status: "pending",
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: null,
        reviewerNotes: null,
        ...overrides,
    }
}

test("formats cents as USD", () => {
    assert.equal(formatMoneyFromCents(4500), "$45.00")
    assert.equal(formatMoneyFromCents(123456), "$1,234.56")
    assert.equal(formatMoneyFromCents(5), "$0.05")
})

test("treats admission caps as dollars", () => {
    assert.equal(capDollarsToCents(75), 7500)
    assert.equal(capDollarsToCents(12.5), 1250)
})

test("flags requests over the cap", () => {
    assert.equal(
        isOverCap(submission({ requestedAmountCents: 7501 }), 7500),
        true,
    )
    assert.equal(
        isOverCap(submission({ requestedAmountCents: 7500 }), 7500),
        false,
    )
    assert.equal(isOverCap(submission(), undefined), false)
})

test("derives display status", () => {
    assert.equal(
        displayStatus(submission({ uploadCompletedAt: null })),
        "incomplete",
    )
    assert.equal(displayStatus(submission()), "pending")
    assert.equal(displayStatus(submission({ status: "approved" })), "approved")
    assert.equal(
        displayStatus(
            submission({ status: "approved", uploadCompletedAt: null }),
        ),
        "incomplete",
    )
})

test("filters by tab", () => {
    const pending = submission()
    const rejected = submission({ status: "rejected" })
    const incomplete = submission({ uploadCompletedAt: null })

    assert.equal(matchesFilter(pending, "review"), true)
    assert.equal(matchesFilter(rejected, "review"), false)
    assert.equal(matchesFilter(incomplete, "review"), false)
    assert.equal(matchesFilter(incomplete, "incomplete"), true)
    assert.equal(matchesFilter(rejected, "all"), true)
})

test("sorts oldest pending first", () => {
    const newer = submission({
        id: "newer",
        uploadCompletedAt: "2026-04-14T00:00:00Z",
    })
    const older = submission({
        id: "older",
        uploadCompletedAt: "2026-04-10T00:00:00Z",
    })
    const approved = submission({ id: "approved", status: "approved" })
    const incomplete = submission({ id: "incomplete", uploadCompletedAt: null })

    assert.deepEqual(
        sortSubmissions([incomplete, approved, newer, older]).map((s) => s.id),
        ["older", "newer", "approved", "incomplete"],
    )
})

test("summarizes pending and approved totals", () => {
    assert.deepEqual(
        summarize([
            submission({ requestedAmountCents: 1000 }),
            submission({ requestedAmountCents: 2500 }),
            submission({ requestedAmountCents: 9999, status: "approved" }),
            submission({ requestedAmountCents: 500, status: "rejected" }),
            submission({ requestedAmountCents: 700, uploadCompletedAt: null }),
        ]),
        {
            pendingCount: 2,
            pendingCents: 3500,
            approvedCount: 1,
            approvedCents: 9999,
        },
    )
})

test("searches name, email, user id and file name", () => {
    const s = submission({ originalFileName: "Bus-Ticket.pdf" })
    assert.equal(matchesSearch(s, ""), true)
    assert.equal(matchesSearch(s, "jane", "Jane Doe"), true)
    assert.equal(
        matchesSearch(s, "@illinois", undefined, "jd@illinois.edu"),
        true,
    )
    assert.equal(matchesSearch(s, "GITHUB1"), true)
    assert.equal(matchesSearch(s, "bus-ticket"), true)
    assert.equal(matchesSearch(s, "nope", "Jane Doe"), false)
})

test("picks the next pending item, wrapping around", () => {
    const list = [
        submission({ id: "1" }),
        submission({ id: "2", status: "approved" }),
        submission({ id: "3" }),
    ]
    assert.equal(nextPendingId(list, "1"), "3")
    assert.equal(nextPendingId(list, "3"), "1")
    assert.equal(nextPendingId([submission({ id: "1" })], "1"), null)
})

test("formats expense dates without timezone shift", () => {
    assert.equal(formatExpenseDate("2026-04-12"), "Apr 12, 2026")
    assert.equal(formatExpenseDate("garbage"), "garbage")
})

test("formats relative time", () => {
    const now = Date.parse("2026-04-12T12:00:00Z")
    assert.equal(formatRelativeTime("2026-04-12T11:59:40Z", now), "just now")
    assert.equal(formatRelativeTime("2026-04-12T11:15:00Z", now), "45m ago")
    assert.equal(formatRelativeTime("2026-04-12T07:00:00Z", now), "5h ago")
    assert.equal(formatRelativeTime("2026-04-09T12:00:00Z", now), "3d ago")
})

test("chooses a preview kind", () => {
    assert.equal(previewKind("application/pdf"), "pdf")
    assert.equal(previewKind("image/png"), "image")
    assert.equal(previewKind("image/heic"), "unsupported")
})
