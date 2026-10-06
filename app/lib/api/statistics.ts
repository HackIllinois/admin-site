import {
    Event,
    EventService,
    StatisticLog,
    StatisticService,
} from "@/generated"
import { handleError } from "@/util/api-client"

const PROBES_PER_ROUND = 12
const SEARCH_ROUNDS = 4
const TAIL_PAGE_LIMIT = 25
const MAX_TAIL_PAGES = 5

export interface AttendeeStatsSnapshot {
    latest: StatisticLog | null
    eventLookup: Map<string, Event>
}

async function logsAfter(after: number, limit = 1): Promise<StatisticLog[]> {
    const result = await StatisticService.getStatistic({
        query: { after, limit },
    })
    return result.data ?? []
}

function evenlySpaced(lo: number, hi: number, count: number): number[] {
    const step = (hi - lo) / count
    return Array.from({ length: count }, (_, i) => Math.floor(lo + step * i))
}

function newest(a: StatisticLog, b: StatisticLog | undefined): StatisticLog {
    return b && b.timestamp > a.timestamp ? b : a
}

/**
 * Finds the most recent statistic log.
 *
 * `GET /statistic/` returns logs in insertion (oldest-first) order and only
 * supports `after`/`before`/`limit`, so the newest log is located with a
 * parallel k-ary search over `after`.
 */
async function findLatestLog(): Promise<StatisticLog | null> {
    const [first] = await StatisticService.getStatistic({
        query: { limit: 1 },
    }).then(handleError)
    if (!first) return null

    let latest = first
    let lo = first.timestamp - 1
    let hi = Math.floor(Date.now() / 1000) + 1

    for (let round = 0; round < SEARCH_ROUNDS && hi - lo > 1; round++) {
        const probes = evenlySpaced(lo, hi, PROBES_PER_ROUND)
        const results = await Promise.all(
            probes.map((probe) => logsAfter(probe)),
        )

        let lastHit = -1
        results.forEach(([log], index) => {
            if (!log) return
            lastHit = index
            latest = newest(latest, log)
        })
        if (lastHit === -1) break

        lo = probes[lastHit]
        hi = probes[lastHit + 1] ?? hi
    }

    let cursor = lo
    for (let page = 0; page < MAX_TAIL_PAGES; page++) {
        const tail = await logsAfter(cursor, TAIL_PAGE_LIMIT)
        latest = tail.reduce(newest, latest)
        if (tail.length < TAIL_PAGE_LIMIT) break
        cursor = latest.timestamp
    }

    return latest
}

/**
 * Loads the latest statistic snapshot and event metadata for the Attendee Stats page.
 */
export async function loadLatestAttendeeStats(): Promise<AttendeeStatsSnapshot> {
    const [latest, events, staffEvents] = await Promise.all([
        findLatestLog(),
        EventService.getEvent().then(handleError),
        EventService.getEventStaff().then(handleError),
    ])

    return {
        latest,
        eventLookup: buildEventLookup([
            ...events.events,
            ...staffEvents.events,
        ]),
    }
}

/**
 * Builds a lookup from event id to event.
 */
export function buildEventLookup(events: Event[]): Map<string, Event> {
    return new Map(events.map((event) => [event.eventId, event]))
}

/**
 * Formats a Unix-seconds timestamp for display.
 */
export function formatStatisticTimestamp(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    })
}

/**
 * Formats `part / whole` as a whole-number percentage.
 */
export function formatPercent(part: number, whole: number): string {
    return whole === 0 ? "—" : `${Math.round((part / whole) * 100)}%`
}
