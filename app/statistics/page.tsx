"use client"

import Loading from "@/components/Loading"
import {
    EventService,
    ShopService,
    StatisticLog,
    StatisticService,
} from "@/generated"
import {
    buildEventNameMap,
    buildShopItemNameMap,
    formatStatisticTimestamp,
    sortLogsNewestFirst,
} from "@/app/lib/statistics/statistic-labels"
import { handleError, useRoles } from "@/util/api-client"
import { faSync } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useCallback, useEffect, useMemo, useState } from "react"
import MetricBreakdownBar from "./MetricBreakdownBar"
import styles from "./styles.module.scss"

const DECISION_COLORS = {
    accepted: "#5e997a",
    rejected: "#cc0000",
    waitlisted: "#505f85",
    tbd: "#9aa3b5",
} as const

const RSVP_COLORS = {
    accepted: "#5e997a",
    declined: "#cc0000",
    pending: "#e6a700",
} as const

const LOG_LIMIT_OPTIONS = [5, 10, 15, 25] as const

export default function StatisticsPage() {
    const roles = useRoles()
    const isAdmin = roles.includes("ADMIN")

    const [loading, setLoading] = useState(true)
    const [loggingEnabled, setLoggingEnabled] = useState<boolean | null>(null)
    const [logs, setLogs] = useState<StatisticLog[]>([])
    const [eventNames, setEventNames] = useState<Map<string, string>>(
        new Map(),
    )
    const [shopNames, setShopNames] = useState<Map<string, string>>(new Map())
    const [limit, setLimit] = useState<number>(25)
    const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null)
    const [togglingLogging, setTogglingLogging] = useState(false)

    const refresh = useCallback(async () => {
        setLoading(true)
        try {
            const [loggingStatus, statisticLogs, eventsResponse, shopItems] =
                await Promise.all([
                    StatisticService.getStatisticLogging().then(handleError),
                    StatisticService.getStatistic({
                        query: { limit },
                    }).then(handleError),
                    EventService.getEvent().then(handleError),
                    ShopService.getShop().then(handleError),
                ])

            setLoggingEnabled(loggingStatus.enabled)
            setLogs(sortLogsNewestFirst(statisticLogs))
            setEventNames(buildEventNameMap(eventsResponse.events))
            setShopNames(buildShopItemNameMap(shopItems))
            setLastFetchedAt(new Date())
        } finally {
            setLoading(false)
        }
    }, [limit])

    useEffect(() => {
        refresh()
    }, [refresh])

    const latest = logs[0] ?? null

    const topEvents = useMemo(() => {
        if (!latest) return []
        return [...latest.events]
            .sort((a, b) => b.attendees - a.attendees)
            .slice(0, 8)
    }, [latest])

    const topShopItems = useMemo(() => {
        if (!latest) return []
        return [...latest.shopItems]
            .sort((a, b) => b.purchased - a.purchased)
            .slice(0, 8)
    }, [latest])

    async function setLogging(status: "enable" | "disable") {
        if (!isAdmin) return

        const verb = status === "enable" ? "enable" : "disable"
        if (
            !confirm(
                `${verb.charAt(0).toUpperCase() + verb.slice(1)} periodic statistic logging on Adonix?`,
            )
        ) {
            return
        }

        setTogglingLogging(true)
        try {
            await StatisticService.postStatisticLoggingByStatus({
                path: { status },
            }).then(handleError)
            await refresh()
        } finally {
            setTogglingLogging(false)
        }
    }

    if (loading && loggingEnabled === null && logs.length === 0) {
        return <Loading />
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>Statistics</div>
                <FontAwesomeIcon
                    className={styles.refresh}
                    icon={faSync}
                    onClick={() => refresh()}
                />
            </div>
            {lastFetchedAt ? (
                <div className={styles.subtitle}>
                    Last refreshed {lastFetchedAt.toLocaleTimeString()}
                </div>
            ) : null}

            <div className={styles.statusRow}>
                <span
                    className={
                        styles.badge +
                        " " +
                        (loggingEnabled ? styles.enabled : styles.disabled)
                    }
                >
                    Logging: {loggingEnabled ? "Enabled" : "Disabled"}
                </span>
                {isAdmin ? (
                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.toggleButton}
                            disabled={togglingLogging || loggingEnabled === true}
                            onClick={() => setLogging("enable")}
                        >
                            Enable logging
                        </button>
                        <button
                            type="button"
                            className={styles.toggleButtonDanger}
                            disabled={
                                togglingLogging || loggingEnabled === false
                            }
                            onClick={() => setLogging("disable")}
                        >
                            Disable logging
                        </button>
                    </div>
                ) : null}
            </div>

            <div className={styles.panel}>
                <div className={styles.controls}>
                    <label htmlFor="stat-limit">Snapshots to load</label>
                    <select
                        id="stat-limit"
                        value={limit}
                        onChange={(event) =>
                            setLimit(Number(event.target.value))
                        }
                    >
                        {LOG_LIMIT_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {!latest ? (
                <div className={styles.panel}>
                    <div className={styles.empty}>
                        No statistic snapshots yet.
                        {!loggingEnabled ? (
                            <>
                                {" "}
                                Logging is off — an admin can enable it from
                                this page; new snapshots appear on Adonix&apos;s
                                logging interval.
                            </>
                        ) : (
                            <> Wait for the next logging interval.</>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    <div className={styles.panel}>
                        <h2>
                            Latest snapshot (
                            {formatStatisticTimestamp(latest.timestamp)})
                        </h2>

                        <h3>Admission decisions</h3>
                        <MetricBreakdownBar
                            segments={[
                                {
                                    label: "Accepted",
                                    value: latest.decision.accepted,
                                    color: DECISION_COLORS.accepted,
                                },
                                {
                                    label: "Rejected",
                                    value: latest.decision.rejected,
                                    color: DECISION_COLORS.rejected,
                                },
                                {
                                    label: "Waitlisted",
                                    value: latest.decision.waitlisted,
                                    color: DECISION_COLORS.waitlisted,
                                },
                                {
                                    label: "TBD",
                                    value: latest.decision.tbd,
                                    color: DECISION_COLORS.tbd,
                                },
                            ]}
                        />
                        <div className={styles.legend}>
                            {(
                                [
                                    ["Accepted", latest.decision.accepted, DECISION_COLORS.accepted],
                                    ["Rejected", latest.decision.rejected, DECISION_COLORS.rejected],
                                    ["Waitlisted", latest.decision.waitlisted, DECISION_COLORS.waitlisted],
                                    ["TBD", latest.decision.tbd, DECISION_COLORS.tbd],
                                ] as const
                            ).map(([label, value, color]) => (
                                <div className={styles.item} key={label}>
                                    <span
                                        className={styles.swatch}
                                        style={{ background: color }}
                                    />
                                    {label}: {value}
                                </div>
                            ))}
                        </div>

                        <h3>RSVP (accepted applicants)</h3>
                        <MetricBreakdownBar
                            segments={[
                                {
                                    label: "Accepted",
                                    value: latest.rsvp.accepted,
                                    color: RSVP_COLORS.accepted,
                                },
                                {
                                    label: "Declined",
                                    value: latest.rsvp.declined,
                                    color: RSVP_COLORS.declined,
                                },
                                {
                                    label: "Pending",
                                    value: latest.rsvp.pending,
                                    color: RSVP_COLORS.pending,
                                },
                            ]}
                        />
                        <div className={styles.metricGrid}>
                            <div className={styles.metricCard}>
                                <div className={styles.label}>RSVP yes</div>
                                <div className={styles.value}>
                                    {latest.rsvp.accepted}
                                </div>
                            </div>
                            <div className={styles.metricCard}>
                                <div className={styles.label}>RSVP no</div>
                                <div className={styles.value}>
                                    {latest.rsvp.declined}
                                </div>
                            </div>
                            <div className={styles.metricCard}>
                                <div className={styles.label}>RSVP pending</div>
                                <div className={styles.value}>
                                    {latest.rsvp.pending}
                                </div>
                            </div>
                        </div>

                        <h3>Event check-ins</h3>
                        {topEvents.length === 0 ? (
                            <p className={styles.empty}>No event data in snapshot.</p>
                        ) : (
                            <ul className={styles.list}>
                                {topEvents.map((event) => (
                                    <li key={event.eventId}>
                                        <span className={styles.name}>
                                            {eventNames.get(event.eventId) ??
                                                event.eventId}
                                        </span>
                                        <span className={styles.count}>
                                            {event.attendees}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <h3>Shop redemptions</h3>
                        {topShopItems.length === 0 ? (
                            <p className={styles.empty}>No shop data in snapshot.</p>
                        ) : (
                            <ul className={styles.list}>
                                {topShopItems.map((item) => (
                                    <li key={item.itemId}>
                                        <span className={styles.name}>
                                            {shopNames.get(item.itemId) ??
                                                item.itemId}
                                        </span>
                                        <span className={styles.count}>
                                            {item.purchased}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className={styles.panel}>
                        <h2>Snapshot history</h2>
                        <table className={styles.historyTable}>
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Accepted</th>
                                    <th>Rejected</th>
                                    <th>Waitlisted</th>
                                    <th>TBD</th>
                                    <th>RSVP yes</th>
                                    <th>RSVP no</th>
                                    <th>RSVP pending</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.timestamp}>
                                        <td>
                                            {formatStatisticTimestamp(
                                                log.timestamp,
                                            )}
                                        </td>
                                        <td>{log.decision.accepted}</td>
                                        <td>{log.decision.rejected}</td>
                                        <td>{log.decision.waitlisted}</td>
                                        <td>{log.decision.tbd}</td>
                                        <td>{log.rsvp.accepted}</td>
                                        <td>{log.rsvp.declined}</td>
                                        <td>{log.rsvp.pending}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    )
}
