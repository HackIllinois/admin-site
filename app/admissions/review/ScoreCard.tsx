import { isEdited, type ScoreMode } from "@/util/review-decision"
import styles from "./style.module.scss"

type Props = {
    aiScore: number | null
    aiReasons: string[]
    aiGradedAt: number | null
    mode: ScoreMode
    picked: number | null
    reason: string
    disabled: boolean
    onMode: (mode: ScoreMode) => void
    onPick: (score: number) => void
    onReason: (reason: string) => void
}

const SCORES = [1, 2, 3, 4, 5]

export function ScoreCard(props: Props) {
    const { aiScore, mode, picked, disabled } = props
    const hasAi = aiScore !== null
    const changing = !hasAi || mode === "change"
    const edited = isEdited(mode, aiScore, picked)

    return (
        <div className={styles.card}>
            <div className={styles.row}>
                <h2 className={styles.cardTitle}>AI SCORE</h2>
                {hasAi && props.aiGradedAt !== null ? (
                    <span className={styles.small}>
                        graded{" "}
                        {new Date(props.aiGradedAt).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" },
                        )}
                    </span>
                ) : null}
            </div>

            {hasAi ? (
                <>
                    <div className={styles.bigScore}>
                        <span>{aiScore}</span>
                        <span>/ 5</span>
                    </div>
                    {props.aiReasons.length > 0 ? (
                        <ul className={styles.reasons}>
                            {props.aiReasons.map((r, i) => (
                                <li key={i}>{r}</li>
                            ))}
                        </ul>
                    ) : null}
                    <div
                        role="radiogroup"
                        aria-label="Final score"
                        className={styles.choiceGrid}
                    >
                        <button
                            type="button"
                            role="radio"
                            aria-checked={mode === "keep"}
                            disabled={disabled}
                            className={styles.choice}
                            onClick={() => props.onMode("keep")}
                        >
                            Keep AI score
                        </button>
                        <button
                            type="button"
                            role="radio"
                            aria-checked={mode === "change"}
                            disabled={disabled}
                            className={styles.choice}
                            onClick={() => props.onMode("change")}
                        >
                            Change score
                        </button>
                    </div>
                </>
            ) : (
                <p className={styles.muted} style={{ margin: 0, fontSize: 14 }}>
                    No AI score yet. Pick your own score from 1 to 5.
                </p>
            )}

            {changing ? (
                <div className={styles.stack}>
                    <div
                        role="radiogroup"
                        aria-label="Your score from 1 to 5"
                        className={`${styles.choiceGrid} ${styles.five}`}
                    >
                        {SCORES.map((n) => (
                            <button
                                key={n}
                                type="button"
                                role="radio"
                                aria-checked={picked === n}
                                disabled={disabled}
                                className={`${styles.choice} ${styles.number}`}
                                onClick={() => props.onPick(n)}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                    <div className={styles.scale}>
                        <span>1 · weak</span>
                        <span>5 · strong</span>
                    </div>
                    {hasAi && picked !== null ? (
                        <div className={styles.scoreSummary}>
                            <span>
                                Final score <strong>{picked}</strong>{" "}
                                <span className={styles.muted}>
                                    · AI said {aiScore}
                                </span>
                            </span>
                            {edited ? (
                                <span className={styles.edited}>edited</span>
                            ) : null}
                        </div>
                    ) : null}
                    {edited ? (
                        <label className={styles.field}>
                            Why you changed it
                            <textarea
                                rows={2}
                                value={props.reason}
                                disabled={disabled}
                                placeholder="Short reason, kept with the score"
                                onChange={(e) => props.onReason(e.target.value)}
                            />
                        </label>
                    ) : null}
                </div>
            ) : null}
        </div>
    )
}
