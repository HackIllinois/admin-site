"use client"

import { faXmark } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useRef, useState } from "react"
import styles from "./styles.module.scss"

const QUICK_REASONS = [
    "Receipt is unreadable",
    "Amount doesn't match receipt",
    "Not an eligible travel expense",
    "Duplicate submission",
    "Expense date outside travel window",
]

interface RejectModalProps {
    submitterLabel: string
    amountLabel: string
    submitting: boolean
    onCancel: () => void
    onReject: (reason: string) => void
}

export default function RejectModal({
    submitterLabel,
    amountLabel,
    submitting,
    onCancel,
    onReject,
}: RejectModalProps) {
    const [reason, setReason] = useState("")
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        textareaRef.current?.focus()
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel()
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [onCancel])

    const trimmed = reason.trim()

    return (
        <div className={styles.modalBackdrop} onMouseDown={onCancel}>
            <form
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="reject-title"
                onMouseDown={(e) => e.stopPropagation()}
                onSubmit={(e) => {
                    e.preventDefault()
                    if (trimmed && !submitting) onReject(trimmed)
                }}
            >
                <div className={styles.modalHeader}>
                    <div>
                        <h2 id="reject-title">Reject reimbursement</h2>
                        <p>
                            {submitterLabel} · {amountLabel}
                        </p>
                    </div>
                    <button
                        type="button"
                        className={styles.iconButton}
                        onClick={onCancel}
                        title="Close"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>

                <label className={styles.fieldLabel} htmlFor="reject-reason">
                    Reason <span className={styles.required}>required</span>
                </label>
                <div className={styles.quickReasons}>
                    {QUICK_REASONS.map((quick) => (
                        <button
                            key={quick}
                            type="button"
                            className={`${styles.quickReason} ${
                                reason === quick ? styles.quickReasonActive : ""
                            }`}
                            onClick={() => setReason(quick)}
                        >
                            {quick}
                        </button>
                    ))}
                </div>
                <textarea
                    id="reject-reason"
                    ref={textareaRef}
                    className={styles.textarea}
                    rows={3}
                    maxLength={500}
                    placeholder="Explain why this receipt can't be reimbursed"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />

                <div className={styles.modalActions}>
                    <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={styles.dangerButton}
                        disabled={!trimmed || submitting}
                    >
                        {submitting ? "Rejecting…" : "Reject"}
                    </button>
                </div>
            </form>
        </div>
    )
}
