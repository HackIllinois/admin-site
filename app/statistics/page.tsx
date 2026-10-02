"use client"

import Loading from "@/components/Loading"
import { Event, EventService, ShopService, StatisticLog, StatisticService } from "@/generated"
import {
    buildEventLookup,
    buildShopItemNameMap,
    formatMissingLabel,
    formatStatisticTimestamp,
    formatTrendAxisLabel,
} from "@/app/lib/statistics/statistic-labels"
import {
    buildTrendSeries,
    totalApplicants,
    totalCheckIns,
    totalRedeemed,
} from "@/app/lib/statistics/statistic-metrics"
import { loadStatisticTimeline } from "@/app/lib/statistics/statistic-timeline"
import { handleError, useRoles } from "@/util/api-client"
import { faSync } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Tab, Tabs } from "@mui/material"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
    ActivityTrendChart,
    DonutChart,
    FunnelChart,
    TopItemsBarChart,
} from "./AttendeeStatsCharts"
import styles from "./styles.module.scss"

const COLORS = {
    green: "#5e997a",
    red: "#cc0000",
    blue: "#505f85",
    gray: "#9aa3b5",
    amber: "#e6a700",
} as const

type TabId = "overview" | "events" | "shop" | "history"

export default function AttendeeStatsPage() {
    const roles = useRoles()
    const isAdmin = roles.includes("ADMIN")

    const [loading, setLoading] = useState(true)
    const [loggingEnabled, setLoggingEnabled] = useState<boolean | null>(null)
    const [latest, setLatest] = useState<StatisticLog | null>(null)
    const [timeline, setTimeline] = useState<StatisticLog[]>([])
    const [eventLookup, setEventLookup] = useState<Map<string, Event>>(new Map())
    const [shopNames, setShopNames] = useState<Map<string, string>>(new Map())
    const [tab, setTab] = useState<TabId>("overview")
    const [query, setQuery] = useState("")
    const [minCount, setMinCount] = useState(0)
    const [currentOnly, setCurrentOnly] = useState(false)
    const [togglingLogging, setTogglingLogging] = useState(false)

    const refresh = useCallback(async () => {
        setLoading(true)
        try {
            const [loggingStatus, statTimeline, events, staffEvents, shopItems] =
                await Promise.all([
                    StatisticService.getStatisticLogging().then(handleError),
                    loadStatisticTimeline(),
                    EventService.getEvent().then(handleError),
                    EventService.getEventStaff().then(handleError),
                    ShopService.getShop().then(handleError),
                ])

            setLoggingEnabled(loggingStatus.enabled)
            setLatest(statTimeline.latest)
            setTimeline(statTimeline.points)
            setEventLookup(
                buildEventLookup([...events.events, ...staffEvents.events]),
            )
            setShopNames(buildShopItemNameMap(shopItems))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    const trendSeries = useMemo(
        () => buildTrendSeries(timeline, formatTrendAxisLabel),
        [timeline],
    )

    const eventRows = useMemo(() => {
        if (!latest) return []
        return latest.events.map((stat) => {
            const event = eventLookup.get(stat.eventId)
            return {
                eventId: stat.eventId,
                attendees: stat.attendees,
                known: Boolean(event),
                name: event?.name ?? formatMissingLabel("Past event", stat.eventId),
                eventType: event?.eventType,
                startTime: event?.startTime,
            }
        })
    }, [latest, eventLookup])

    const missingEventCount = eventRows.filter((row) => !row.known).length

    const filteredEvents = useMemo(() => {
        const needle = query.trim().toLowerCase()
        return eventRows
            .filter((row) => !currentOnly || row.known)
            .filter((row) => !needle || row.name.toLowerCase().includes(needle))
            .filter((row) => row.attendees >= minCount)
            .sort((a, b) => b.attendees - a.attendees)
    }, [eventRows, currentOnly, query, minCount])

    const filteredShopItems = useMemo(() => {
        if (!latest) return []
        const needle = query.trim().toLowerCase()
        return latest.shopItems
            .map((item) => ({
                ...item,
                name:
                    shopNames.get(item.itemId) ??
                    formatMissingLabel("Past item", item.itemId),
            }))
            .filter((item) => !needle || item.name.toLowerCase().includes(needle))
            .filter((item) => item.purchased >= minCount)
            .sort((a, b) => b.purchased - a.purchased)
    }, [latest, shopNames, query, minCount])

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

    if (loading && loggingEnabled === null) {
        return <Loading />
    }

    const windowStart = timeline[0]?.timestamp

    return (
        <div className={styles.page}>
            <div className={styles.headingContainer}>
                <div className={styles.heading}>
                    Attendee Stats
                    <div className={styles.underline} />
                </div>
                <FontAwesomeIcon
                    className={styles.refresh + (loading ? " " + styles.spinning : "")}
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
                                setLogging(event.target.value as "enable" | "disable")
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
                {latest ? (
                    <span className={styles.dataAsOf}>
                        Data as of {formatStatisticTimestamp(latest.timestamp)}
                    </span>
                ) : null}
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
                {!latest ? (
                    <div className={styles.empty}>
                        No statistic logs yet.
                        {loggingEnabled
                            ? " The next log is written within 5 minutes."
                            : " An admin can turn logging on from this page."}
                    </div>
                ) : tab === "overview" ? (
                    <>
                        <div className={styles.grid}>
                            {(
                                [
                                    ["Applied", totalApplicants(latest.decision), COLORS.blue],
                                    ["Accepted", latest.decision.accepted, COLORS.green],
                                    ["RSVP yes", latest.rsvp.accepted, COLORS.amber],
                                    ["Event check-ins", totalCheckIns(latest), COLORS.green],
                                    ["Shop redemptions", totalRedeemed(latest), COLORS.blue],
                                ] as const
                            ).map(([label, value, color]) => (
                                <div className={styles.card} key={label}>
                                    <div className={styles.label}>{label}</div>
                                    <div className={styles.value}>
                                        {value.toLocaleString()}
                                    </div>
                                    <div
                                        className={styles.accent}
                                        style={{ background: color }}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className={styles.chartRow}>
                            <div className={styles.chartSection}>
                                <h3>Admissions funnel</h3>
                                <FunnelChart
                                    steps={[
                                        { name: "Applied", value: totalApplicants(latest.decision), color: COLORS.blue },
                                        { name: "Accepted", value: latest.decision.accepted, color: COLORS.green },
                                        { name: "RSVP yes", value: latest.rsvp.accepted, color: COLORS.amber },
                                    ]}
                                />
                            </div>
                            <div className={styles.chartSection}>
                                <h3>Decisions</h3>
                                <DonutChart
                                    emptyLabel="No decision data"
                                    slices={[
                                        { name: "Accepted", value: latest.decision.accepted, color: COLORS.green },
                                        { name: "Rejected", value: latest.decision.rejected, color: COLORS.red },
                                        { name: "Waitlisted", value: latest.decision.waitlisted, color: COLORS.blue },
                                        { name: "TBD", value: latest.decision.tbd, color: COLORS.gray },
                                    ]}
                                />
                            </div>
                            <div className={styles.chartSection}>
                                <h3>RSVP (accepted applicants)</h3>
                                <DonutChart
                                    emptyLabel="No RSVP data"
                                    slices={[
                                        { name: "Yes", value: latest.rsvp.accepted, color: COLORS.green },
                                        { name: "No", value: latest.rsvp.declined, color: COLORS.red },
                                        { name: "Pending", value: latest.rsvp.pending, color: COLORS.amber },
                                    ]}
                                />
                            </div>
                        </div>

                        <div className={styles.chartSection}>
                            <h3>
                                Activity
                                {windowStart ? (
                                    <span className={styles.subtle}>
                                        {" "}
                                        {formatStatisticTimestamp(windowStart)} –{" "}
                                        {formatStatisticTimestamp(latest.timestamp)}
                                    </span>
                                ) : null}
                            </h3>
                            <ActivityTrendChart series={trendSeries} />
                        </div>
                    </>
                ) : tab === "events" ? (
                    <>
                        <div className={styles.filters}>
                            <input
                                placeholder="Filter by event name"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                            />
                            <label>
                                Min check-ins
                                <input
                                    type="number"
                                    min={0}
                                    value={minCount}
                                    onChange={(event) =>
                                        setMinCount(Number(event.target.value) || 0)
                                    }
                                />
                            </label>
                            {missingEventCount > 0 ? (
                                <label className={styles.checkbox}>
                                    <input
                                        type="checkbox"
                                        checked={currentOnly}
                                        onChange={(event) =>
                                            setCurrentOnly(event.target.checked)
                                        }
                                    />
                                    Current schedule only
                                </label>
                            ) : null}
                        </div>
                        {missingEventCount > 0 ? (
                            <p className={styles.note}>
                                {missingEventCount} of {eventRows.length} events in
                                this log are no longer in Adonix (likely a past
                                year&apos;s schedule), so only their IDs are
                                available.
                            </p>
                        ) : null}
                        {filteredEvents.length === 0 ? (
                            <div className={styles.empty}>
                                No events match this filter.
                            </div>
                        ) : (
                            <>
                                <div className={styles.chartSection}>
                                    <h3>Top events by check-ins</h3>
                                    <TopItemsBarChart
                                        rows={filteredEvents.map((row) => ({
                                            name: row.name,
                                            value: row.attendees,
                                        }))}
                                        valueLabel="Check-ins"
                                        color={COLORS.green}
                                    />
                                </div>
                                <table className={styles.historyTable}>
                                    <thead>
                                        <tr>
                                            <th>Event</th>
                                            <th>Type</th>
                                            <th>Starts</th>
                                            <th>Checked in</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredEvents.map((row) => (
                                            <tr key={row.eventId}>
                                                <td className={row.known ? "" : styles.muted} title={row.eventId}>
                                                    {row.name}
                                                </td>
                                                <td>{row.eventType ?? "—"}</td>
                                                <td>
                                                    {row.startTime
                                                        ? formatStatisticTimestamp(row.startTime)
                                                        : "—"}
                                                </td>
                                                <td>{row.attendees}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}
                    </>
                ) : tab === "shop" ? (
                    <>
                        <div className={styles.filters}>
                            <input
                                placeholder="Filter by item name"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                            />
                            <label>
                                Min redeemed
                                <input
                                    type="number"
                                    min={0}
                                    value={minCount}
                                    onChange={(event) =>
                                        setMinCount(Number(event.target.value) || 0)
                                    }
                                />
                            </label>
                        </div>
                        {filteredShopItems.length === 0 ? (
                            <div className={styles.empty}>
                                No shop items match this filter.
                            </div>
                        ) : (
                            <>
                                <div className={styles.chartSection}>
                                    <h3>Top items by redemptions</h3>
                                    <TopItemsBarChart
                                        rows={filteredShopItems.map((item) => ({
                                            name: item.name,
                                            value: item.purchased,
                                        }))}
                                        valueLabel="Redeemed"
                                        color={COLORS.blue}
                                    />
                                </div>
                                <table className={styles.historyTable}>
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Redeemed</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredShopItems.map((item) => (
                                            <tr key={item.itemId}>
                                                <td title={item.itemId}>{item.name}</td>
                                                <td>{item.purchased}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <div className={styles.chartSection}>
                            <h3>Activity over time</h3>
                            <ActivityTrendChart series={trendSeries} />
                        </div>
                        <table className={styles.historyTable}>
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Applied</th>
                                    <th>Accepted</th>
                                    <th>RSVP yes</th>
                                    <th>RSVP pending</th>
                                    <th>Check-ins</th>
                                    <th>Redeemed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...timeline].reverse().map((log) => (
                                    <tr key={log.timestamp}>
                                        <td>{formatStatisticTimestamp(log.timestamp)}</td>
                                        <td>{totalApplicants(log.decision)}</td>
                                        <td>{log.decision.accepted}</td>
                                        <td>{log.rsvp.accepted}</td>
                                        <td>{log.rsvp.pending}</td>
                                        <td>{totalCheckIns(log)}</td>
                                        <td>{totalRedeemed(log)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
            </div>
        </div>
    )
}
