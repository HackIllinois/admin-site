"use client"

import { Skeleton } from "@mui/material"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { AdmissionService, Applicant } from "@/generated"
import { tagLabel, tagStyle, APPLICANT_TAGS } from "@/util/applicant-tags"
import {
    computeStats,
    filterApplicants,
    reviewerOptions,
    tagCounts,
    TagFilter,
} from "@/util/admissions-list"
import styles from "./style.module.scss"

type LoadState =
    | { status: "loading" }
    | { status: "error"; message: string }
    | { status: "ready"; rows: Applicant[] }

const TAG_FILTERS: TagFilter[] = ["all", ...APPLICANT_TAGS]

function scoreText(score: number | null): string {
    return score === null ? "—" : String(score)
}

function StatCard(props: { label: string; value: number; total?: number }) {
    const percent =
        props.total && props.total > 0
            ? Math.round((props.value / props.total) * 100)
            : 0
    return (
        <div className={styles.statCard}>
            <div className={styles.statLabel}>{props.label}</div>
            <div className={styles.statValue}>
                {props.value}
                {props.total !== undefined && (
                    <span className={styles.statTotal}> / {props.total}</span>
                )}
            </div>
            {props.total !== undefined && (
                <div className={styles.bar}>
                    <div
                        className={styles.barFill}
                        style={{ width: `${percent}%` }}
                    />
                </div>
            )}
        </div>
    )
}

export default function Admissions() {
    const [state, setState] = useState<LoadState>({ status: "loading" })
    const [attempt, setAttempt] = useState(0)
    const [query, setQuery] = useState("")
    const [reviewer, setReviewer] = useState("all")
    const [tag, setTag] = useState<TagFilter>("all")

    useEffect(() => {
        let cancelled = false
        setState({ status: "loading" })
        AdmissionService.getAdmissionApplicants()
            .then((result) => {
                if (cancelled) return
                if (result.error || !result.data) {
                    console.error("[admissions-list] load failed", result.error)
                    setState({
                        status: "error",
                        message: "Could not load applicants.",
                    })
                    return
                }
                setState({ status: "ready", rows: result.data })
            })
            .catch((error) => {
                if (cancelled) return
                console.error("[admissions-list] load threw", error)
                setState({
                    status: "error",
                    message: "Could not load applicants.",
                })
            })
        return () => {
            cancelled = true
        }
    }, [attempt])

    const allRows = useMemo(
        () => (state.status === "ready" ? state.rows : []),
        [state],
    )
    const stats = useMemo(() => computeStats(allRows), [allRows])
    const options = useMemo(() => reviewerOptions(allRows), [allRows])
    const counts = useMemo(
        () => tagCounts(allRows, reviewer),
        [allRows, reviewer],
    )
    const visible = useMemo(
        () => filterApplicants(allRows, { query, reviewer, tag }),
        [allRows, query, reviewer, tag],
    )

    return (
        <div className={styles.admissions}>
            <div className={styles.header}>
                <h1 className={styles.title}>Admissions</h1>
                <div className={styles.actions}>
                    <Link href="/email" className={styles.secondaryButton}>
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                        >
                            <rect x="3" y="5" width="18" height="14" rx="2" />
                            <path d="M3 7l9 6 9-6" />
                        </svg>
                        Send email
                    </Link>
                    <Link
                        href="/admissions/review"
                        className={styles.primaryButton}
                    >
                        Grade next applicant
                    </Link>
                </div>
            </div>

            <div className={styles.stats}>
                <StatCard label="Applications" value={stats.total} />
                <StatCard
                    label="AI graded"
                    value={stats.aiGraded}
                    total={stats.total}
                />
                <StatCard
                    label="Checked by a person"
                    value={stats.checked}
                    total={stats.total}
                />
                <StatCard label="Score changed from AI" value={stats.edited} />
            </div>

            <div className={styles.controls}>
                <label className={styles.search}>
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                    >
                        <circle cx="11" cy="11" r="7" />
                        <path d="M20 20l-3.5-3.5" />
                    </svg>
                    <span className={styles.srOnly}>Search applicants</span>
                    <input
                        type="search"
                        placeholder="Search applicants…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </label>
                <label className={styles.reviewerSelect}>
                    Reviewer
                    <select
                        value={reviewer}
                        onChange={(e) => setReviewer(e.target.value)}
                    >
                        {options.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div
                role="group"
                aria-label="Filter by tag"
                className={styles.pills}
            >
                {TAG_FILTERS.map((t) => (
                    <button
                        key={t}
                        type="button"
                        aria-pressed={tag === t}
                        className={styles.pill}
                        onClick={() => setTag(t)}
                    >
                        {t !== "all" && (
                            <span
                                className={styles.pillDot}
                                style={{ background: tagStyle(t).dot }}
                            />
                        )}
                        {t === "all" ? "All" : tagLabel(t)}
                        <span className={styles.pillCount}>{counts[t]}</span>
                    </button>
                ))}
            </div>

            <div className={styles.card}>
                <div className={styles.tableScroll}>
                    <div className={styles.table} role="table">
                        <div
                            className={`${styles.gridRow} ${styles.headRow}`}
                            role="row"
                        >
                            <span role="columnheader">Applicant</span>
                            <span role="columnheader">School</span>
                            <span role="columnheader">Reviewers</span>
                            <span role="columnheader">AI score</span>
                            <span role="columnheader">Final score</span>
                            <span role="columnheader">Tag</span>
                        </div>
                        {state.status === "loading" && (
                            <div className={styles.skeletons} aria-busy="true">
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <Skeleton
                                        key={i}
                                        variant="rectangular"
                                        height={44}
                                        sx={{ borderRadius: "8px" }}
                                    />
                                ))}
                            </div>
                        )}
                        {state.status === "error" && (
                            <div className={styles.message} role="alert">
                                <p>{state.message}</p>
                                <button
                                    type="button"
                                    className={styles.secondaryButton}
                                    onClick={() => setAttempt((n) => n + 1)}
                                >
                                    Try again
                                </button>
                            </div>
                        )}
                        {state.status === "ready" && visible.length === 0 && (
                            <div className={styles.message}>
                                <p>
                                    {allRows.length === 0
                                        ? "No applications yet."
                                        : "No applicants match these filters."}
                                </p>
                            </div>
                        )}
                        {state.status === "ready" &&
                            visible.map((r) => {
                                const style = tagStyle(r.tag)
                                return (
                                    <Link
                                        key={r.userId}
                                        href={`/admissions/review?id=${encodeURIComponent(r.userId)}`}
                                        className={`${styles.gridRow} ${styles.row}`}
                                        role="row"
                                    >
                                        <span
                                            className={styles.applicant}
                                            role="cell"
                                        >
                                            <span className={styles.name}>
                                                {r.name}
                                            </span>
                                            <span className={styles.email}>
                                                {r.email}
                                            </span>
                                        </span>
                                        <span
                                            className={styles.school}
                                            role="cell"
                                        >
                                            {r.school}
                                        </span>
                                        <span
                                            className={
                                                r.reviewers.length
                                                    ? styles.reviewers
                                                    : styles.unassigned
                                            }
                                            role="cell"
                                        >
                                            {r.reviewers.length
                                                ? r.reviewers
                                                      .map((v) => v.reviewerId)
                                                      .join(", ")
                                                : "Unassigned"}
                                        </span>
                                        <span
                                            className={styles.score}
                                            role="cell"
                                        >
                                            {scoreText(r.aiScore)}
                                        </span>
                                        <span
                                            className={styles.finalCell}
                                            role="cell"
                                        >
                                            <span className={styles.finalScore}>
                                                {scoreText(r.finalScore)}
                                            </span>
                                            {r.edited && (
                                                <span className={styles.edited}>
                                                    edited
                                                </span>
                                            )}
                                        </span>
                                        <span role="cell">
                                            <span
                                                className={styles.tag}
                                                style={{
                                                    background:
                                                        style.background,
                                                    color: style.color,
                                                    borderColor: style.border,
                                                }}
                                            >
                                                <span
                                                    className={styles.tagDot}
                                                />
                                                {tagLabel(r.tag)}
                                            </span>
                                        </span>
                                    </Link>
                                )
                            })}
                    </div>
                </div>
            </div>
        </div>
    )
}
