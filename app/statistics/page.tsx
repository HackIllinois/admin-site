"use client"

import Loading from "@/components/Loading"
import { Event, EventService, StatisticLog } from "@/generated"
import {
    buildEventLookup,
    formatStatisticTimestamp,
} from "@/app/lib/statistics/statistic-labels"
import { formatPercent } from "@/app/lib/statistics/statistic-metrics"
import { findLatestLog } from "@/app/lib/statistics/statistic-latest"
import { handleError } from "@/util/api-client"
import { faSync } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Tab, Tabs } from "@mui/material"
import { useCallback, useEffect, useMemo, useState } from "react"
import { ChartSlice, DonutChart, TopItemsBarChart } from "./AttendeeStatsCharts"
import CollapsibleSection from "./CollapsibleSection"
import FilterPopover, { DEFAULT_FILTERS, ListFilters } from "./FilterPopover"
import styles from "./styles.module.scss"

const COLORS = {
    green: "#5e997a",
    red: "#cc0000",
    blue: "#505f85",
    gray: "#9aa3b5",
    amber: "#e6a700",
} as const

type TabId = "overview" | "events"

const sumSlices = (slices: ChartSlice[]) =>
    slices.reduce((sum, slice) => sum + slice.value, 0)

export default function AttendeeStatsPage() {
    const [loading, setLoading] = useState(true)
    const [loaded, setLoaded] = useState(false)
    const [latest, setLatest] = useState<StatisticLog | null>(null)
    const [eventLookup, setEventLookup] = useState<Map<string, Event>>(
        new Map(),
    )
    const [tab, setTab] = useState<TabId>("overview")
    const [filters, setFilters] = useState<ListFilters>(DEFAULT_FILTERS)

    const refresh = useCallback(async () => {
        setLoading(true)
        try {
            const [latestLog, events, staffEvents] = await Promise.all([
                findLatestLog(),
                EventService.getEvent().then(handleError),
                EventService.getEventStaff().then(handleError),
            ])

            setLatest(latestLog)
            setEventLookup(
                buildEventLookup([...events.events, ...staffEvents.events]),
            )
        } finally {
            setLoading(false)
            setLoaded(true)
        }
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    const eventRows = useMemo(() => {
        if (!latest) return []
        return latest.events.flatMap((stat) => {
            const event = eventLookup.get(stat.eventId)
            if (!event) return []
            return [
                {
                    eventId: stat.eventId,
                    attendees: stat.attendees,
                    name: event.name,
                    eventType: event.eventType,
                    startTime: event.startTime,
                },
            ]
        })
    }, [latest, eventLookup])

    const busiestEvent = useMemo(
        () =>
            eventRows.reduce<(typeof eventRows)[number] | null>(
                (best, row) =>
                    !best || row.attendees > best.attendees ? row : best,
                null,
            ),
        [eventRows],
    )

    const filteredEvents = useMemo(() => {
        const needle = filters.query.trim().toLowerCase()
        return eventRows
            .filter((row) => !needle || row.name.toLowerCase().includes(needle))
            .filter((row) => row.attendees >= filters.minCount)
            .sort((a, b) => b.attendees - a.attendees)
    }, [eventRows, filters])

    const chartLimit = filters.limit === "all" ? Infinity : filters.limit

    const decisionSlices = useMemo<ChartSlice[]>(
        () =>
            latest
                ? [
                      {
                          name: "Accepted",
                          value: latest.decision.accepted,
                          color: COLORS.green,
                      },
                      {
                          name: "Rejected",
                          value: latest.decision.rejected,
                          color: COLORS.red,
                      },
                      {
                          name: "Waitlisted",
                          value: latest.decision.waitlisted,
                          color: COLORS.blue,
                      },
                      {
                          name: "TBD",
                          value: latest.decision.tbd,
                          color: COLORS.gray,
                      },
                  ]
                : [],
        [latest],
    )

    const rsvpSlices = useMemo<ChartSlice[]>(
        () =>
            latest
                ? [
                      {
                          name: "Yes",
                          value: latest.rsvp.accepted,
                          color: COLORS.green,
                      },
                      {
                          name: "No",
                          value: latest.rsvp.declined,
                          color: COLORS.red,
                      },
                      {
                          name: "Pending",
                          value: latest.rsvp.pending,
                          color: COLORS.amber,
                      },
                  ]
                : [],
        [latest],
    )

    const applicantTotal = sumSlices(decisionSlices)
    const rsvpTotal = sumSlices(rsvpSlices)

    if (!loaded) {
        return <Loading />
    }

    return (
        <div className={styles.page}>
            <div className={styles.headingContainer}>
                <div className={styles.heading}>
                    Attendee Stats
                    <div className={styles.underline} />
                </div>
                <FontAwesomeIcon
                    className={
                        styles.refresh + (loading ? " " + styles.spinning : "")
                    }
                    icon={faSync}
                    onClick={() => refresh()}
                />
            </div>

            {latest ? (
                <div className={styles.toolbar}>
                    <span className={styles.dataAsOf}>
                        Data as of {formatStatisticTimestamp(latest.timestamp)}
                    </span>
                </div>
            ) : null}

            <Tabs
                className={styles.tabs}
                value={tab}
                onChange={(_, value: TabId) => {
                    setTab(value)
                    setFilters(DEFAULT_FILTERS)
                }}
            >
                <Tab value="overview" label="Overview" />
                <Tab value="events" label="Events" />
            </Tabs>

            <div className={styles.panel}>
                {!latest ? (
                    <div className={styles.empty}>No statistic logs yet.</div>
                ) : tab === "overview" ? (
                    <>
                        <div className={styles.grid}>
                            {[
                                {
                                    label: "Applied",
                                    value: applicantTotal,
                                    color: COLORS.blue,
                                },
                                {
                                    label: "Accepted",
                                    value: latest.decision.accepted,
                                    color: COLORS.green,
                                },
                                {
                                    label: "RSVP yes",
                                    value: latest.rsvp.accepted,
                                    color: COLORS.amber,
                                },
                                {
                                    label: "Busiest event",
                                    value: busiestEvent?.attendees ?? 0,
                                    color: COLORS.green,
                                    hint: busiestEvent?.name,
                                },
                            ].map(({ label, value, color, hint }) => (
                                <div className={styles.card} key={label}>
                                    <div className={styles.label}>{label}</div>
                                    <div className={styles.value}>
                                        {value.toLocaleString()}
                                    </div>
                                    {hint ? (
                                        <div
                                            className={styles.hint}
                                            title={hint}
                                        >
                                            {hint}
                                        </div>
                                    ) : null}
                                    <div
                                        className={styles.accent}
                                        style={{ background: color }}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className={styles.chartRow}>
                            <div className={styles.chartSection}>
                                <h3>Decisions</h3>
                                <DonutChart
                                    emptyLabel="No decision data"
                                    centerValue={formatPercent(
                                        latest.decision.accepted,
                                        applicantTotal,
                                    )}
                                    centerCaption="accepted"
                                    slices={decisionSlices}
                                />
                            </div>
                            <div className={styles.chartSection}>
                                <h3>RSVP (accepted applicants)</h3>
                                <DonutChart
                                    emptyLabel="No RSVP data"
                                    centerValue={formatPercent(
                                        latest.rsvp.accepted,
                                        rsvpTotal,
                                    )}
                                    centerCaption="said yes"
                                    slices={rsvpSlices}
                                />
                            </div>
                        </div>

                        <CollapsibleSection
                            title="Data table · decisions & RSVP"
                            defaultOpen
                        >
                            <div className={styles.tableScroll}>
                                <table className={styles.dataTable}>
                                    <thead>
                                        <tr>
                                            <th>Group</th>
                                            <th>Status</th>
                                            <th>Count</th>
                                            <th>Share</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            {
                                                group: "Decision",
                                                slices: decisionSlices,
                                                total: applicantTotal,
                                            },
                                            {
                                                group: "RSVP",
                                                slices: rsvpSlices,
                                                total: rsvpTotal,
                                            },
                                        ].flatMap(({ group, slices, total }) =>
                                            slices.map((slice) => (
                                                <tr key={group + slice.name}>
                                                    <td>{group}</td>
                                                    <td>
                                                        <span
                                                            className={
                                                                styles.swatch
                                                            }
                                                            style={{
                                                                background:
                                                                    slice.color,
                                                            }}
                                                        />
                                                        {slice.name}
                                                    </td>
                                                    <td>
                                                        {slice.value.toLocaleString()}
                                                    </td>
                                                    <td>
                                                        {formatPercent(
                                                            slice.value,
                                                            total,
                                                        )}
                                                    </td>
                                                </tr>
                                            )),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CollapsibleSection>
                    </>
                ) : (
                    <>
                        <div className={styles.listHeader}>
                            <FilterPopover
                                filters={filters}
                                onChange={setFilters}
                                nameLabel="Event name"
                                countLabel="Min check-ins"
                            />
                            <span className={styles.subtle}>
                                Showing{" "}
                                {Math.min(chartLimit, filteredEvents.length)} of{" "}
                                {filteredEvents.length} events
                            </span>
                        </div>
                        {filteredEvents.length === 0 ? (
                            <div className={styles.empty}>
                                No events match this filter.
                            </div>
                        ) : (
                            <>
                                <div className={styles.chartSection}>
                                    <h3>
                                        {filters.limit === "all"
                                            ? "All events"
                                            : `Top ${filters.limit} events`}{" "}
                                        by check-ins
                                    </h3>
                                    <TopItemsBarChart
                                        rows={filteredEvents.map((row) => ({
                                            name: row.name,
                                            value: row.attendees,
                                        }))}
                                        valueLabel="Check-ins"
                                        color={COLORS.green}
                                        limit={chartLimit}
                                    />
                                </div>
                                <CollapsibleSection
                                    title={`Data table · ${filteredEvents.length} events`}
                                >
                                    <div className={styles.tableScroll}>
                                        <table className={styles.dataTable}>
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
                                                        <td title={row.eventId}>
                                                            {row.name}
                                                        </td>
                                                        <td>{row.eventType}</td>
                                                        <td>
                                                            {row.startTime
                                                                ? formatStatisticTimestamp(
                                                                      row.startTime,
                                                                  )
                                                                : "—"}
                                                        </td>
                                                        <td>{row.attendees}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CollapsibleSection>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
