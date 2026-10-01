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
import { Tab, Tabs } from "@mui/material"
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

const SNAPSHOT_LIMIT = 25

type TabId = "overview" | "events" | "shop" | "history"

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
    const [tab, setTab] = useState<TabId>("overview")
    const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(
        null,
    )
    const [query, setQuery] = useState("")
    const [minCount, setMinCount] = useState(0)
    const [togglingLogging, setTogglingLogging] = useState(false)

    const refresh = useCallback(async () => {
        setLoading(true)
        try {
            const [loggingStatus, statisticLogs, eventsResponse, shopItems] =
                await Promise.all([
                    StatisticService.getStatisticLogging().then(handleError),
                    StatisticService.getStatistic({
                        query: { limit: SNAPSHOT_LIMIT },
                    }).then(handleError),
                    EventService.getEvent().then(handleError),
                    ShopService.getShop().then(handleError),
                ])

            const sorted = sortLogsNewestFirst(statisticLogs)
            setLoggingEnabled(loggingStatus.enabled)
            setLogs(sorted)
            setEventNames(buildEventNameMap(eventsResponse.events))
            setShopNames(buildShopItemNameMap(shopItems))
            setSelectedTimestamp((current) =>
                current && sorted.some((log) => log.timestamp === current)
                    ? current
                    : (sorted[0]?.timestamp ?? null),
            )
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    const snapshot =
        logs.find((log) => log.timestamp === selectedTimestamp) ??
        logs[0] ??
        null

    const events = useMemo(() => {
        if (!snapshot) return []
        const needle = query.trim().toLowerCase()
        return [...snapshot.events]
            .map((event) => ({
                ...event,
                name: eventNames.get(event.eventId) ?? event.eventId,
            }))
            .filter((event) =>
                needle ? event.name.toLowerCase().includes(needle) : true,
            )
            .filter((event) => event.attendees >= minCount)
            .sort((a, b) => b.attendees - a.attendees)
    }, [snapshot, eventNames, query, minCount])

    const shopItems = useMemo(() => {
        if (!snapshot) return []
        const needle = query.trim().toLowerCase()
        return [...snapshot.shopItems]
            .map((item) => ({
                ...item,
                name: shopNames.get(item.itemId) ?? item.itemId,
            }))
            .filter((item) =>
                needle ? item.name.toLowerCase().includes(needle) : true,
            )
            .filter((item) => item.purchased >= minCount)
            .sort((a, b) => b.purchased - a.purchased)
    }, [snapshot, shopNames, query, minCount])

    async function setLogging(status: "enable" | "disable") {
        if (!isAdmin) return
        const verb = status === "enable" ? "Enable" : "Disable"
        if (!confirm(`${verb} periodic statistic logging on Adonix?`)) return

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
        <div className={styles.page}>
            <div className={styles.headingContainer}>
                <div className={styles.heading}>
                    Statistics
                    <div className={styles.underline} />
                </div>
                <FontAwesomeIcon
                    className={styles.refresh}
                    icon={faSync}
                    onClick={() => refresh()}
                />
            </div>

            <div className={styles.toolbar}>
                {isAdmin ? (
                    <label className={styles.field}>
                        Logging
                        <select
                            value={loggingEnabled ? "enable" : "disable"}
                            disabled={togglingLogging || loggingEnabled === null}
                            onChange={(event) =>
                                setLogging(
                                    event.target.value as "enable" | "disable",
                                )
                            }
                        >
                            <option value="enable">On</option>
                            <option value="disable">Off</option>
                        </select>
                    </label>
                ) : (
                    <span
                        className={
                            styles.badge +
                            " " +
                            (loggingEnabled ? styles.enabled : styles.disabled)
                        }
                    >
                        Logging {loggingEnabled ? "on" : "off"}
                    </span>
                )}
                <label className={styles.field}>
                    Snapshot
                    <select
                        value={snapshot?.timestamp ?? ""}
                        disabled={!snapshot}
                        onChange={(event) =>
                            setSelectedTimestamp(Number(event.target.value))
                        }
                    >
                        {logs.map((log) => (
                            <option key={log.timestamp} value={log.timestamp}>
                                {formatStatisticTimestamp(log.timestamp)}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <Tabs
                className={styles.tabs}
                value={tab}
                onChange={(_, value: TabId) => {
                    setTab(value)
                    setQuery("")
                    setMinCount(0)
                }}
            >
                <Tab value="overview" label="Overview" />
                <Tab value="events" label="Events" />
                <Tab value="shop" label="Shop" />
                <Tab value="history" label="History" />
            </Tabs>

            <div className={styles.panel}>
                {!snapshot ? (
                    <div className={styles.empty}>
                        No snapshots yet.
                        {loggingEnabled
                            ? " The next log writes on Adonix's interval."
                            : " An admin can turn logging on from this page."}
                    </div>
                ) : tab === "overview" ? (
                    <>
                        <div className={styles.grid}>
                            {(
                                [
                                    ["Accepted", snapshot.decision.accepted],
                                    ["Rejected", snapshot.decision.rejected],
                                    ["Waitlisted", snapshot.decision.waitlisted],
                                    ["TBD", snapshot.decision.tbd],
                                    ["RSVP yes", snapshot.rsvp.accepted],
                                    ["RSVP no", snapshot.rsvp.declined],
                                    ["RSVP pending", snapshot.rsvp.pending],
                                ] as const
                            ).map(([label, value]) => (
                                <div className={styles.card} key={label}>
                                    <div className={styles.label}>{label}</div>
                                    <div className={styles.value}>{value}</div>
                                    <div className={styles.accent} />
                                </div>
                            ))}
                        </div>
                        <div className={styles.split}>
                            <div className={styles.section}>
                                <h3>Decisions</h3>
                                <MetricBreakdownBar
                                    segments={[
                                        {
                                            label: "Accepted",
                                            value: snapshot.decision.accepted,
                                            color: DECISION_COLORS.accepted,
                                        },
                                        {
                                            label: "Rejected",
                                            value: snapshot.decision.rejected,
                                            color: DECISION_COLORS.rejected,
                                        },
                                        {
                                            label: "Waitlisted",
                                            value: snapshot.decision.waitlisted,
                                            color: DECISION_COLORS.waitlisted,
                                        },
                                        {
                                            label: "TBD",
                                            value: snapshot.decision.tbd,
                                            color: DECISION_COLORS.tbd,
                                        },
                                    ]}
                                />
                                <div className={styles.legend}>
                                    {(
                                        [
                                            ["Accepted", DECISION_COLORS.accepted],
                                            ["Rejected", DECISION_COLORS.rejected],
                                            ["Waitlisted", DECISION_COLORS.waitlisted],
                                            ["TBD", DECISION_COLORS.tbd],
                                        ] as const
                                    ).map(([label, color]) => (
                                        <span className={styles.item} key={label}>
                                            <span
                                                className={styles.swatch}
                                                style={{ background: color }}
                                            />
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className={styles.section}>
                                <h3>RSVP</h3>
                                <MetricBreakdownBar
                                    segments={[
                                        {
                                            label: "Accepted",
                                            value: snapshot.rsvp.accepted,
                                            color: RSVP_COLORS.accepted,
                                        },
                                        {
                                            label: "Declined",
                                            value: snapshot.rsvp.declined,
                                            color: RSVP_COLORS.declined,
                                        },
                                        {
                                            label: "Pending",
                                            value: snapshot.rsvp.pending,
                                            color: RSVP_COLORS.pending,
                                        },
                                    ]}
                                />
                                <div className={styles.legend}>
                                    {(
                                        [
                                            ["Yes", RSVP_COLORS.accepted],
                                            ["No", RSVP_COLORS.declined],
                                            ["Pending", RSVP_COLORS.pending],
                                        ] as const
                                    ).map(([label, color]) => (
                                        <span className={styles.item} key={label}>
                                            <span
                                                className={styles.swatch}
                                                style={{ background: color }}
                                            />
                                            {label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                ) : tab === "events" ? (
                    <>
                        <div className={styles.filters}>
                            <input
                                placeholder="Filter by event name"
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                            />
                            <label>
                                Min check-ins
                                <input
                                    type="number"
                                    min={0}
                                    value={minCount}
                                    onChange={(event) =>
                                        setMinCount(
                                            Number(event.target.value) || 0,
                                        )
                                    }
                                />
                            </label>
                        </div>
                        {events.length === 0 ? (
                            <div className={styles.empty}>
                                No events match this filter.
                            </div>
                        ) : (
                            <table className={styles.historyTable}>
                                <thead>
                                    <tr>
                                        <th>Event</th>
                                        <th>Checked in</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.map((event) => (
                                        <tr key={event.eventId}>
                                            <td>{event.name}</td>
                                            <td>{event.attendees}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                ) : tab === "shop" ? (
                    <>
                        <div className={styles.filters}>
                            <input
                                placeholder="Filter by item name"
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                            />
                            <label>
                                Min redeemed
                                <input
                                    type="number"
                                    min={0}
                                    value={minCount}
                                    onChange={(event) =>
                                        setMinCount(
                                            Number(event.target.value) || 0,
                                        )
                                    }
                                />
                            </label>
                        </div>
                        {shopItems.length === 0 ? (
                            <div className={styles.empty}>
                                No shop items match this filter.
                            </div>
                        ) : (
                            <table className={styles.historyTable}>
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Redeemed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shopItems.map((item) => (
                                        <tr key={item.itemId}>
                                            <td>{item.name}</td>
                                            <td>{item.purchased}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                ) : (
                    <table
                        className={styles.historyTable + " " + styles.clickable}
                    >
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Accepted</th>
                                <th>Rejected</th>
                                <th>Waitlisted</th>
                                <th>TBD</th>
                                <th>RSVP yes</th>
                                <th>RSVP no</th>
                                <th>Pending</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr
                                    key={log.timestamp}
                                    className={
                                        log.timestamp === snapshot.timestamp
                                            ? styles.active
                                            : ""
                                    }
                                    onClick={() => {
                                        setSelectedTimestamp(log.timestamp)
                                        setTab("overview")
                                    }}
                                >
                                    <td>
                                        {formatStatisticTimestamp(log.timestamp)}
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
                )}
            </div>
        </div>
    )
}
