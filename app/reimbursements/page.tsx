"use client"

import {
    approveReceipt,
    loadAllReceiptSubmissions,
    loadAttendeeDirectory,
    loadUserInfo,
    rejectReceipt,
    type AttendeeContext,
} from "@/app/lib/api/reimbursements"
import Loading from "@/components/Loading"
import Unauthorized from "@/components/Unauthorized/Unauthorized"
import { useRoles } from "@/util/api-client"
import {
    displayStatus,
    formatExpenseDate,
    formatMoneyFromCents,
    formatRelativeTime,
    isOverCap,
    matchesFilter,
    matchesSearch,
    nextPendingId,
    REVIEW_FILTERS,
    sortSubmissions,
    STATUS_LABELS,
    summarize,
    type DisplayStatus,
    type ReceiptSubmission,
    type ReviewFilter,
} from "@/util/reimbursements"
import {
    faCheck,
    faCopy,
    faInbox,
    faMagnifyingGlass,
    faSync,
    faTriangleExclamation,
    faXmark,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import ReceiptPreview from "./ReceiptPreview"
import RejectModal from "./RejectModal"
import styles from "./styles.module.scss"

const EMPTY_COPY: Record<ReviewFilter, { title: string; body: string }> = {
    review: {
        title: "You're all caught up",
        body: "No receipts are waiting for review.",
    },
    approved: {
        title: "Nothing approved yet",
        body: "Approved receipts show up here.",
    },
    rejected: {
        title: "Nothing rejected",
        body: "Rejected receipts show up here with their reason.",
    },
    incomplete: {
        title: "No incomplete uploads",
        body: "Submissions whose file never finished uploading show up here.",
    },
    all: {
        title: "No submissions yet",
        body: "Receipts attendees submit from the app show up here.",
    },
}

function StatusChip({ status }: { status: DisplayStatus }) {
    return (
        <span className={`${styles.chip} ${styles[`chip_${status}`]}`}>
            {STATUS_LABELS[status]}
        </span>
    )
}

function initials(label: string) {
    const parts = label.split(/[\s@._-]+/).filter(Boolean)
    return (parts[0]?.[0] ?? "?").concat(parts[1]?.[0] ?? "").toUpperCase()
}

function isTyping(target: EventTarget | null) {
    return (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.tagName === "SELECT" ||
            target.isContentEditable)
    )
}

export default function Reimbursements() {
    const roles = useRoles()
    const isAdmin = roles.includes("ADMIN")

    const [submissions, setSubmissions] = useState<ReceiptSubmission[]>([])
    const [directory, setDirectory] = useState<Map<string, AttendeeContext>>(
        new Map(),
    )
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [loadError, setLoadError] = useState<string | null>(null)

    const [filter, setFilter] = useState<ReviewFilter>("review")
    const [search, setSearch] = useState("")
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const [notes, setNotes] = useState("")
    const [rejecting, setRejecting] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const listRef = useRef<HTMLDivElement>(null)

    const refresh = useCallback(async () => {
        setRefreshing(true)
        setLoadError(null)
        try {
            const [loaded, people] = await Promise.all([
                loadAllReceiptSubmissions(),
                loadAttendeeDirectory(),
            ])
            setSubmissions(loaded)
            setDirectory(people)
        } catch (error) {
            setLoadError(
                error instanceof Error
                    ? error.message
                    : "Couldn't load submissions",
            )
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [])

    useEffect(() => {
        if (isAdmin) refresh()
    }, [isAdmin, refresh])

    const contextFor = useCallback(
        (userId: string): AttendeeContext => directory.get(userId) ?? {},
        [directory],
    )

    const labelFor = useCallback(
        (s: ReceiptSubmission) => contextFor(s.userId).name ?? s.userId,
        [contextFor],
    )

    const sorted = useMemo(() => sortSubmissions(submissions), [submissions])
    const summary = useMemo(() => summarize(submissions), [submissions])

    const counts = useMemo(() => {
        const result = {} as Record<ReviewFilter, number>
        for (const { value } of REVIEW_FILTERS) {
            result[value] = submissions.filter((s) =>
                matchesFilter(s, value),
            ).length
        }
        return result
    }, [submissions])

    const visible = useMemo(
        () =>
            sorted.filter((s) => {
                const context = contextFor(s.userId)
                return (
                    matchesFilter(s, filter) &&
                    matchesSearch(s, search, context.name, context.email)
                )
            }),
        [sorted, filter, search, contextFor],
    )

    // Keep a valid selection: default to the top of the queue on desktop
    useEffect(() => {
        if (!visible.some((s) => s.id === selectedId)) {
            const isDesktop = window.matchMedia("(min-width: 1024px)").matches
            setSelectedId(isDesktop ? (visible[0]?.id ?? null) : null)
        }
    }, [visible, selectedId])

    const selected = submissions.find((s) => s.id === selectedId) ?? null
    const selectedContext = selected ? contextFor(selected.userId) : {}

    // Reset per-item state and fill in name/email for submitters not in the bulk directory
    useEffect(() => {
        setNotes(selected?.reviewerNotes ?? "")
        setRejecting(false)

        const userId = selected?.userId
        if (!userId || directory.get(userId)?.email) return

        let cancelled = false
        loadUserInfo(userId).then((info) => {
            if (cancelled || !info) return
            setDirectory((prev) => {
                const next = new Map(prev)
                next.set(userId, {
                    ...prev.get(userId),
                    name: prev.get(userId)?.name ?? info.name,
                    email: info.email,
                })
                return next
            })
        })
        return () => {
            cancelled = true
        }
        // Only re-run when the selected submission changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected?.id])

    const select = useCallback((id: string) => {
        setSelectedId(id)
        listRef.current
            ?.querySelector(`[data-id="${CSS.escape(id)}"]`)
            ?.scrollIntoView({ block: "nearest" })
    }, [])

    // j/k and arrow keys move through the queue
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (rejecting || isTyping(e.target) || e.metaKey || e.ctrlKey) {
                return
            }
            const delta =
                e.key === "ArrowDown" || e.key === "j"
                    ? 1
                    : e.key === "ArrowUp" || e.key === "k"
                      ? -1
                      : 0
            if (!delta || visible.length === 0) return

            e.preventDefault()
            const index = visible.findIndex((s) => s.id === selectedId)
            const nextIndex =
                index === -1
                    ? 0
                    : Math.min(visible.length - 1, Math.max(0, index + delta))
            select(visible[nextIndex].id)
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [visible, selectedId, rejecting, select])

    const applyReview = (updated: ReceiptSubmission) => {
        const nextId = nextPendingId(visible, updated.id)
        setSubmissions((prev) =>
            prev.map((s) => (s.id === updated.id ? updated : s)),
        )
        setSelectedId(nextId ?? updated.id)
    }

    const approve = async () => {
        if (!selected) return
        const cap = selectedContext.capCents
        if (
            isOverCap(selected, cap) &&
            !window.confirm(
                `${formatMoneyFromCents(selected.requestedAmountCents)} is over this attendee's ${formatMoneyFromCents(cap!)} cap. Approve anyway?`,
            )
        ) {
            return
        }

        setSubmitting(true)
        try {
            applyReview(await approveReceipt(selected.id, notes.trim()))
        } catch {
            // handleError already alerted
        } finally {
            setSubmitting(false)
        }
    }

    const reject = async (reason: string) => {
        if (!selected) return
        setSubmitting(true)
        try {
            applyReview(await rejectReceipt(selected.id, reason, notes.trim()))
            setRejecting(false)
        } catch {
            // handleError already alerted
        } finally {
            setSubmitting(false)
        }
    }

    const closeReject = useCallback(() => setRejecting(false), [])

    if (roles.length === 0) {
        return <Loading />
    }

    if (!isAdmin) {
        return <Unauthorized />
    }

    if (loading) {
        return <Loading />
    }

    return (
        <div className={styles.page}>
            <header className={styles.topBar}>
                <div className={styles.titleBlock}>
                    <h1>Reimbursements</h1>
                    <p>Review travel receipts submitted by attendees</p>
                </div>
                <div className={styles.summary}>
                    <div className={styles.summaryCard}>
                        <span className={styles.summaryLabel}>To review</span>
                        <span className={styles.summaryValue}>
                            {formatMoneyFromCents(summary.pendingCents)}
                        </span>
                        <span className={styles.summaryMeta}>
                            {summary.pendingCount} pending
                        </span>
                    </div>
                    <div className={styles.summaryCard}>
                        <span className={styles.summaryLabel}>Approved</span>
                        <span className={styles.summaryValue}>
                            {formatMoneyFromCents(summary.approvedCents)}
                        </span>
                        <span className={styles.summaryMeta}>
                            {summary.approvedCount} receipts
                        </span>
                    </div>
                    <button
                        className={styles.refreshButton}
                        onClick={refresh}
                        disabled={refreshing}
                        title="Refresh"
                    >
                        <FontAwesomeIcon icon={faSync} spin={refreshing} />
                        <span>Refresh</span>
                    </button>
                </div>
            </header>

            {loadError ? (
                <div className={styles.errorState}>
                    <FontAwesomeIcon
                        icon={faTriangleExclamation}
                        className={styles.emptyIcon}
                    />
                    <h3>Couldn&apos;t load reimbursements</h3>
                    <p>{loadError}</p>
                    <button className={styles.secondaryButton} onClick={refresh}>
                        Try again
                    </button>
                </div>
            ) : (
                <div
                    className={`${styles.split} ${
                        selected ? styles.hasSelection : ""
                    }`}
                >
                    <section className={styles.queue}>
                        <div className={styles.tabs} role="tablist">
                            {REVIEW_FILTERS.map(({ value, label }) => (
                                <button
                                    key={value}
                                    role="tab"
                                    aria-selected={filter === value}
                                    className={`${styles.tab} ${
                                        filter === value ? styles.tabActive : ""
                                    }`}
                                    onClick={() => setFilter(value)}
                                >
                                    {label}
                                    <span className={styles.tabCount}>
                                        {counts[value]}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <label className={styles.search}>
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                            <input
                                type="search"
                                placeholder="Search name, email, user id, file"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </label>

                        <div className={styles.list} ref={listRef}>
                            {visible.length === 0 ? (
                                <div className={styles.listEmpty}>
                                    <FontAwesomeIcon
                                        icon={faInbox}
                                        className={styles.emptyIcon}
                                    />
                                    <h3>
                                        {search
                                            ? "No matches"
                                            : EMPTY_COPY[filter].title}
                                    </h3>
                                    <p>
                                        {search
                                            ? "Try a different name, email or user id."
                                            : EMPTY_COPY[filter].body}
                                    </p>
                                </div>
                            ) : (
                                visible.map((s) => {
                                    const context = contextFor(s.userId)
                                    const status = displayStatus(s)
                                    const overCap = isOverCap(
                                        s,
                                        context.capCents,
                                    )
                                    return (
                                        <button
                                            key={s.id}
                                            data-id={s.id}
                                            className={`${styles.row} ${
                                                s.id === selectedId
                                                    ? styles.rowSelected
                                                    : ""
                                            }`}
                                            onClick={() => select(s.id)}
                                        >
                                            <span className={styles.avatar}>
                                                {initials(labelFor(s))}
                                            </span>
                                            <span className={styles.rowMain}>
                                                <span className={styles.rowName}>
                                                    {labelFor(s)}
                                                </span>
                                                <span className={styles.rowMeta}>
                                                    {formatExpenseDate(
                                                        s.expenseDate,
                                                    )}
                                                    {" · "}
                                                    {formatRelativeTime(
                                                        s.uploadCompletedAt ??
                                                            s.createdAt,
                                                    )}
                                                </span>
                                            </span>
                                            <span className={styles.rowSide}>
                                                <span
                                                    className={styles.rowAmount}
                                                >
                                                    {overCap && (
                                                        <FontAwesomeIcon
                                                            icon={
                                                                faTriangleExclamation
                                                            }
                                                            className={
                                                                styles.overCapIcon
                                                            }
                                                            title="Over approved cap"
                                                        />
                                                    )}
                                                    {formatMoneyFromCents(
                                                        s.requestedAmountCents,
                                                        s.currency,
                                                    )}
                                                </span>
                                                <StatusChip status={status} />
                                            </span>
                                        </button>
                                    )
                                })
                            )}
                        </div>
                        <div className={styles.keyHint}>
                            <kbd>j</kbd>
                            <kbd>k</kbd> or <kbd>↑</kbd>
                            <kbd>↓</kbd> to move
                        </div>
                    </section>

                    <section className={styles.detail}>
                        {selected ? (
                            <Detail
                                key={selected.id}
                                submission={selected}
                                context={selectedContext}
                                label={labelFor(selected)}
                                notes={notes}
                                onNotesChange={setNotes}
                                submitting={submitting}
                                onApprove={approve}
                                onReject={() => setRejecting(true)}
                                onBack={() => setSelectedId(null)}
                            />
                        ) : (
                            <div className={styles.detailEmpty}>
                                <FontAwesomeIcon
                                    icon={faInbox}
                                    className={styles.emptyIcon}
                                />
                                <h3>Select a receipt</h3>
                                <p>Pick a submission from the queue to review it.</p>
                            </div>
                        )}
                    </section>
                </div>
            )}

            {rejecting && selected && (
                <RejectModal
                    submitterLabel={labelFor(selected)}
                    amountLabel={formatMoneyFromCents(
                        selected.requestedAmountCents,
                        selected.currency,
                    )}
                    submitting={submitting}
                    onCancel={closeReject}
                    onReject={reject}
                />
            )}
        </div>
    )
}

interface DetailProps {
    submission: ReceiptSubmission
    context: AttendeeContext
    label: string
    notes: string
    onNotesChange: (notes: string) => void
    submitting: boolean
    onApprove: () => void
    onReject: () => void
    onBack: () => void
}

function Detail({
    submission,
    context,
    label,
    notes,
    onNotesChange,
    submitting,
    onApprove,
    onReject,
    onBack,
}: DetailProps) {
    const status = displayStatus(submission)
    const amount = formatMoneyFromCents(
        submission.requestedAmountCents,
        submission.currency,
    )
    const overCap = isOverCap(submission, context.capCents)
    const canReview = status !== "incomplete"
    const [copied, setCopied] = useState(false)

    const copyUserId = async () => {
        try {
            await navigator.clipboard.writeText(submission.userId)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch {
            // Clipboard can be blocked; the id is still selectable
        }
    }

    return (
        <div className={styles.detailInner}>
            <div className={styles.detailHeader}>
                <button className={styles.backButton} onClick={onBack}>
                    ← Queue
                </button>
                <div className={styles.detailWho}>
                    <span className={`${styles.avatar} ${styles.avatarLarge}`}>
                        {initials(label)}
                    </span>
                    <div>
                        <h2>{label}</h2>
                        <p>
                            {context.email ?? submission.userId} · Spent{" "}
                            {formatExpenseDate(submission.expenseDate)}
                        </p>
                    </div>
                </div>
                <div className={styles.detailAmount}>
                    <span className={styles.bigAmount}>{amount}</span>
                    <StatusChip status={status} />
                </div>
            </div>

            <div className={styles.detailBody}>
                <ReceiptPreview submission={submission} />

                <aside className={styles.context}>
                    {overCap && (
                        <div className={styles.warning}>
                            <FontAwesomeIcon icon={faTriangleExclamation} />
                            <div>
                                <strong>Over approved cap</strong>
                                <p>
                                    Requested {amount}, cap is{" "}
                                    {formatMoneyFromCents(context.capCents!)} (
                                    {formatMoneyFromCents(
                                        submission.requestedAmountCents -
                                            context.capCents!,
                                    )}{" "}
                                    over).
                                </p>
                            </div>
                        </div>
                    )}

                    {status === "rejected" && submission.rejectionReason && (
                        <div className={styles.rejectedNote}>
                            <strong>Rejection reason</strong>
                            <p>{submission.rejectionReason}</p>
                        </div>
                    )}

                    <div className={styles.contextSection}>
                        <h4>Request</h4>
                        <dl>
                            <dt>Requested</dt>
                            <dd className={styles.mono}>{amount}</dd>
                            <dt>Approved cap</dt>
                            <dd className={styles.mono}>
                                {context.capCents !== undefined
                                    ? formatMoneyFromCents(context.capCents)
                                    : "Unknown"}
                            </dd>
                            <dt>Expense date</dt>
                            <dd>{formatExpenseDate(submission.expenseDate)}</dd>
                            <dt>Submitted</dt>
                            <dd>
                                {formatRelativeTime(
                                    submission.uploadCompletedAt ??
                                        submission.createdAt,
                                )}
                            </dd>
                        </dl>
                    </div>

                    <div className={styles.contextSection}>
                        <h4>Attendee</h4>
                        <dl>
                            <dt>Name</dt>
                            <dd>{context.name ?? "—"}</dd>
                            <dt>Email</dt>
                            <dd className={styles.breakAll}>
                                {context.email ?? "—"}
                            </dd>
                            <dt>User id</dt>
                            <dd>
                                <button
                                    className={styles.copyButton}
                                    onClick={copyUserId}
                                    title="Copy user id"
                                >
                                    <span className={styles.mono}>
                                        {submission.userId}
                                    </span>
                                    <FontAwesomeIcon
                                        icon={copied ? faCheck : faCopy}
                                    />
                                </button>
                            </dd>
                            <dt>Asked for travel</dt>
                            <dd>
                                {context.requestedTravelReimbursement ===
                                undefined
                                    ? "—"
                                    : context.requestedTravelReimbursement
                                      ? "Yes, at registration"
                                      : "No, not at registration"}
                            </dd>
                        </dl>
                    </div>

                    {submission.reviewedAt && (
                        <div className={styles.contextSection}>
                            <h4>Review</h4>
                            <dl>
                                <dt>Reviewed</dt>
                                <dd>
                                    {formatRelativeTime(submission.reviewedAt)}
                                </dd>
                                {submission.reviewedBy && (
                                    <>
                                        <dt>By</dt>
                                        <dd className={styles.breakAll}>
                                            {submission.reviewedBy}
                                        </dd>
                                    </>
                                )}
                            </dl>
                        </div>
                    )}

                    <div className={styles.contextSection}>
                        <label className={styles.fieldLabel} htmlFor="notes">
                            Internal notes
                        </label>
                        <textarea
                            id="notes"
                            className={styles.textarea}
                            rows={3}
                            maxLength={1000}
                            placeholder="Only visible to staff"
                            value={notes}
                            onChange={(e) => onNotesChange(e.target.value)}
                            disabled={!canReview}
                        />
                    </div>
                </aside>
            </div>

            <div className={styles.actionBar}>
                <span className={styles.actionHint}>
                    {!canReview
                        ? "Can't review until the upload finishes"
                        : status === "pending"
                          ? "Approving moves to the next receipt"
                          : `Already ${status}. You can change the decision.`}
                </span>
                <div className={styles.actions}>
                    <button
                        className={styles.dangerButton}
                        onClick={onReject}
                        disabled={!canReview || submitting}
                    >
                        <FontAwesomeIcon icon={faXmark} /> Reject
                    </button>
                    <button
                        className={styles.primaryButton}
                        onClick={onApprove}
                        disabled={!canReview || submitting}
                    >
                        <FontAwesomeIcon icon={faCheck} />{" "}
                        {submitting ? "Saving…" : `Approve ${amount}`}
                    </button>
                </div>
            </div>
        </div>
    )
}
