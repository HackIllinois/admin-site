import type { ApplicantTag, UserInfo } from "@/generated"
import { APPLICANT_TAGS } from "@/util/applicant-tags"
import { canRemoveReviewer, reviewerStatus } from "@/util/review-decision"
import type { ReviewerRow } from "@/util/review-reviewers"
import { TagPill } from "./TagPill"
import styles from "./style.module.scss"

type Props = {
    tag: ApplicantTag
    reimbursement: string
    reviewers: ReviewerRow[]
    addable: UserInfo[]
    notes: string
    saving: boolean
    busy: boolean
    onTag: (tag: ApplicantTag) => void
    onReimbursement: (value: string) => void
    onAddReviewer: (reviewerId: string) => void
    onRemoveReviewer: (reviewerId: string) => void
    onNotes: (value: string) => void
    onSave: () => void
}

export function DecisionCard(props: Props) {
    const disabled = props.saving || props.busy

    return (
        <div className={styles.card}>
            <h2 className={styles.cardTitle}>DECISION</h2>
            <div role="radiogroup" aria-label="Tag" className={styles.stack}>
                {APPLICANT_TAGS.map((t) => (
                    <button
                        key={t}
                        type="button"
                        role="radio"
                        aria-checked={props.tag === t}
                        disabled={props.saving}
                        className={styles.tagRow}
                        onClick={() => props.onTag(t)}
                    >
                        <span className={styles.radioDot} />
                        <TagPill tag={t} />
                    </button>
                ))}
            </div>

            {props.tag === "ADMITTED_REIMBURSED" ? (
                <label className={styles.field}>
                    Travel reimbursement
                    <span className={styles.money}>
                        <span>$</span>
                        <input
                            type="number"
                            min={0}
                            value={props.reimbursement}
                            disabled={props.saving}
                            onChange={(e) =>
                                props.onReimbursement(e.target.value)
                            }
                        />
                    </span>
                </label>
            ) : null}

            <div className={styles.field}>
                <span>Reviewers</span>
                <div className={styles.chips}>
                    {props.reviewers.map((r) => (
                        <span key={r.reviewerId} className={styles.chip}>
                            {r.name}
                            {r.isMe ? " (you)" : ""}
                            <span
                                className={`${styles.chipStatus} ${r.score !== null ? styles.done : ""}`}
                            >
                                {reviewerStatus(r.score)}
                            </span>
                            {canRemoveReviewer(r.score) ? (
                                <button
                                    type="button"
                                    className={styles.chipRemove}
                                    aria-label={`Remove ${r.name}`}
                                    disabled={disabled}
                                    onClick={() =>
                                        props.onRemoveReviewer(r.reviewerId)
                                    }
                                >
                                    ×
                                </button>
                            ) : (
                                <span style={{ width: 8 }} />
                            )}
                        </span>
                    ))}
                    <select
                        aria-label="Add reviewer"
                        className={styles.addReviewer}
                        disabled={disabled}
                        value=""
                        onChange={(e) => {
                            if (e.target.value) {
                                props.onAddReviewer(e.target.value)
                            }
                        }}
                    >
                        <option value="">+ Add reviewer</option>
                        {props.addable.map((u) => (
                            <option key={u.userId} value={u.userId}>
                                {u.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <label className={styles.field}>
                Internal notes
                <textarea
                    rows={3}
                    value={props.notes}
                    disabled={props.saving}
                    placeholder="Only staff see this"
                    onChange={(e) => props.onNotes(e.target.value)}
                />
            </label>

            <button
                type="button"
                className={styles.save}
                disabled={disabled}
                onClick={props.onSave}
            >
                {props.saving ? "Saving…" : "Save & next applicant"}
            </button>
        </div>
    )
}
