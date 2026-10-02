import { StatisticLog, StatisticService } from "@/generated"
import { handleError } from "@/util/api-client"

const PROBES_PER_ROUND = 12
const SEARCH_ROUNDS = 4
const TIMELINE_POINTS = 24
const TAIL_PAGE_LIMIT = 25
const MAX_TAIL_PAGES = 5

/** Length of the activity window that ends at the latest log, in seconds. */
export const TIMELINE_WINDOW_SECONDS = 3 * 24 * 60 * 60

export interface StatisticTimeline {
    readonly latest: StatisticLog | null
    /** Sampled logs across the activity window, oldest first. */
    readonly points: StatisticLog[]
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
        const results = await Promise.all(probes.map((probe) => logsAfter(probe)))

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
 * Loads the latest statistic log plus evenly sampled logs from the activity
 * window that ends at it.
 */
export async function loadStatisticTimeline(): Promise<StatisticTimeline> {
    const latest = await findLatestLog()
    if (!latest) return { latest: null, points: [] }

    const start = latest.timestamp - TIMELINE_WINDOW_SECONDS
    const samples = await Promise.all(
        evenlySpaced(start, latest.timestamp, TIMELINE_POINTS).map((probe) =>
            logsAfter(probe),
        ),
    )

    const byTimestamp = new Map<number, StatisticLog>([
        [latest.timestamp, latest],
    ])
    for (const [log] of samples) {
        if (log && log.timestamp <= latest.timestamp) {
            byTimestamp.set(log.timestamp, log)
        }
    }

    return {
        latest,
        points: [...byTimestamp.values()].sort(
            (a, b) => a.timestamp - b.timestamp,
        ),
    }
}
