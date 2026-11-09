"use client"

import type { ApplicantTag } from "@/generated"
import {
    initials,
    parseReimbursement,
    scoreToSubmit,
    shouldSendDecision,
    isEdited,
    type ScoreMode,
} from "@/util/review-decision"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import {
    addReviewer,
    errorMessage,
    fetchNextId,
    loadReview,
    removeReviewer,
    submitScore,
    submitTag,
    type ReviewData,
} from "./api"
import { DecisionCard, type ReviewerRow } from "./DecisionCard"
import { ScoreCard } from "./ScoreCard"
import { TagPill } from "./TagPill"
import styles from "./style.module.scss"

const ANSWERS: {
    key:
        | "application1"
        | "application2"
        | "application3"
        | "applicationOptional"
    title: string
}[] = [
    { key: "application1", title: "Application question 1" },
    { key: "application2", title: "Application question 2" },
    { key: "application3", title: "Application question 3" },
    { key: "applicationOptional", title: "Optional question" },
]

export function ReviewPage() {
    const router = useRouter()
    const id = useSearchParams().get("id")

    const [data, setData] = useState<ReviewData | null>(null)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    // Form state
    const [mode, setMode] = useState<ScoreMode>("keep")
    const [picked, setPicked] = useState<number | null>(null)
    const [reason, setReason] = useState("")
    const [tag, setTag] = useState<ApplicantTag>("IN_REVIEW")
    const [reimbursement, setReimbursement] = useState("")
    const [notes, setNotes] = useState("")
    const [saving, setSaving] = useState(false)
    const [busy, setBusy] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)

    const applyData = useCallback((d: ReviewData) => {
        const mine = d.details.reviews.find((r) => r.reviewerId === d.myId)
        const myScore = typeof mine?.score === "number" ? mine.score : null
        const ai = d.details.aiScore
        setData(d)
        setTag(d.tag)
        setReimbursement("")
        setNotes("")
        setReason("")
        setSaveError(null)
        if (ai !== null && (myScore === null || myScore === ai)) {
            setMode("keep")
            setPicked(null)
        } else {
            setMode("change")
            setPicked(myScore)
        }
    }, [])

    // No id: find the next application, then put its id in the url.
    useEffect(() => {
        if (id) return
        let cancelled = false
        setLoading(true)
        setLoadError(null)
        fetchNextId()
            .then((next) => {
                if (!cancelled) {
                    router.replace(
                        `/admissions/review?id=${encodeURIComponent(next)}`,
                    )
                }
            })
            .catch((e) => {
                if (!cancelled) {
                    setLoadError(errorMessage(e))
                    setLoading(false)
                }
            })
        return () => {
            cancelled = true
        }
    }, [id, router])

    useEffect(() => {
        if (!id) return
        let cancelled = false
        setLoading(true)
        setLoadError(null)
        loadReview(id)
            .then((d) => {
                if (!cancelled) {
                    applyData(d)
                    setLoading(false)
                }
            })
            .catch((e) => {
                if (!cancelled) {
                    setData(null)
                    setLoadError(errorMessage(e))
                    setLoading(false)
                }
            })
        return () => {
            cancelled = true
        }
    }, [id, applyData])

    const refreshReviewers = useCallback(async () => {
        if (!data) return
        const fresh = await loadReview(data.id)
        setData((prev) => (prev ? { ...prev, details: fresh.details } : prev))
    }, [data])

    const changeReviewer = async (action: () => Promise<void>) => {
        setBusy(true)
        setSaveError(null)
        try {
            await action()
            await refreshReviewers()
        } catch (e) {
            setSaveError(errorMessage(e))
        } finally {
            setBusy(false)
        }
    }

    const onSave = async () => {
        if (!data) return
        const { details } = data
        const score = scoreToSubmit(mode, details.aiScore, picked)
        if (score === null) {
            setSaveError("Pick a score from 1 to 5 before saving.")
            return
        }
        let amount = 0
        if (
            tag === "ADMITTED_REIMBURSED" &&
            shouldSendDecision(data.tag, tag, reimbursement)
        ) {
            const parsed = parseReimbursement(reimbursement)
            if (parsed === null) {
                setSaveError(
                    "Enter a travel reimbursement amount above $0, or choose Admitted.",
                )
                return
            }
            amount = parsed
        }

        const edited = isEdited(mode, details.aiScore, picked)
        const comment =
            [
                edited && reason.trim()
                    ? `Score changed: ${reason.trim()}`
                    : "",
                notes.trim() ? `Notes: ${notes.trim()}` : "",
            ]
                .filter(Boolean)
                .join("\n\n") || undefined

        setSaving(true)
        setSaveError(null)
        try {
            await submitScore(data.id, score, comment)
            if (shouldSendDecision(data.tag, tag, reimbursement)) {
                await submitTag(data.id, tag, amount)
            }
            router.push("/admissions/review")
        } catch (e) {
            setSaveError(errorMessage(e))
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className={styles.page}>
                <p className={styles.muted}>Loading applicant…</p>
            </div>
        )
    }

    if (!data) {
        return (
            <div className={styles.page}>
                <Link href="/admissions" className={styles.back}>
                    ← All applicants
                </Link>
                <p className={styles.error} role="alert">
                    {loadError ?? "No applicant to review."}
                </p>
            </div>
        )
    }

    const reg = data.registration
    const fullName = [reg.firstName, reg.lastName].filter(Boolean).join(" ")
    const names = new Map(data.staff.map((u) => [u.userId, u.name]))
    const reviewers: ReviewerRow[] = data.details.reviews.map((r) => ({
        reviewerId: r.reviewerId,
        name: names.get(r.reviewerId) ?? r.reviewerId,
        score: typeof r.score === "number" ? r.score : null,
        isMe: r.reviewerId === data.myId,
    }))
    const assigned = new Set(reviewers.map((r) => r.reviewerId))
    const addable = data.staff.filter((u) => !assigned.has(u.userId))

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <Link href="/admissions" className={styles.back}>
                    ← All applicants
                </Link>
            </div>

            <div className={styles.columns}>
                <section className={styles.main}>
                    <div className={styles.card}>
                        <div className={styles.identity}>
                            <span className={styles.avatar} aria-hidden="true">
                                {initials(fullName)}
                            </span>
                            <div className={styles.name}>
                                <h1>{fullName || "Unnamed applicant"}</h1>
                                <div>{reg.email}</div>
                            </div>
                            <TagPill tag={data.tag} dot />
                        </div>
                        <dl className={styles.facts}>
                            <div>
                                <dt>School</dt>
                                <dd>{reg.school || "—"}</dd>
                            </div>
                            <div>
                                <dt>Major · graduates</dt>
                                <dd>
                                    {reg.major || "—"} · {reg.graduate || "—"}
                                </dd>
                            </div>
                            <div>
                                <dt>Hackathons before</dt>
                                <dd>{reg.hackathonsParticipated || "—"}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.row}>
                            <h2 className={styles.cardTitle}>RESUME</h2>
                            {data.resumeUrl ? (
                                <div className={styles.buttonGroup}>
                                    <a
                                        className={styles.button}
                                        href={data.resumeUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Open full size
                                    </a>
                                    <a
                                        className={styles.button}
                                        href={data.resumeUrl}
                                        download
                                    >
                                        Download PDF
                                    </a>
                                </div>
                            ) : null}
                        </div>
                        {data.resumeUrl ? (
                            <div className={styles.resumeFrame}>
                                <iframe
                                    src={data.resumeUrl}
                                    title={`Resume of ${fullName}`}
                                />
                            </div>
                        ) : (
                            <p className={styles.placeholder}>
                                No resume found for this applicant.
                            </p>
                        )}
                    </div>

                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>WRITTEN ANSWERS</h2>
                        {ANSWERS.map(({ key, title }) => {
                            const text = reg[key]
                            return (
                                <div key={key} className={styles.answer}>
                                    <h3>{title}</h3>
                                    <p
                                        className={
                                            text ? undefined : styles.muted
                                        }
                                    >
                                        {text || "No answer."}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </section>

                <aside className={styles.side}>
                    <ScoreCard
                        aiScore={data.details.aiScore}
                        aiReasons={data.details.aiReasons}
                        aiGradedAt={data.details.aiGradedAt}
                        mode={mode}
                        picked={picked}
                        reason={reason}
                        disabled={saving}
                        onMode={setMode}
                        onPick={setPicked}
                        onReason={setReason}
                    />
                    <DecisionCard
                        tag={tag}
                        reimbursement={reimbursement}
                        reviewers={reviewers}
                        addable={addable}
                        notes={notes}
                        saving={saving}
                        busy={busy}
                        onTag={setTag}
                        onReimbursement={setReimbursement}
                        onAddReviewer={(rid) =>
                            changeReviewer(() => addReviewer(data.id, rid))
                        }
                        onRemoveReviewer={(rid) =>
                            changeReviewer(() => removeReviewer(data.id, rid))
                        }
                        onNotes={setNotes}
                        onSave={onSave}
                    />
                    {saveError ? (
                        <p className={styles.error} role="alert">
                            {saveError}
                        </p>
                    ) : null}
                </aside>
            </div>
        </div>
    )
}
