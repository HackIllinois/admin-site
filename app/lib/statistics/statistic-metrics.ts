import type { DecisionStatistic, StatisticLog } from "@/generated"

/**
 * Total applicants with a recorded admission decision in a snapshot.
 */
export function totalApplicants(decision: DecisionStatistic): number {
    return (
        decision.accepted +
        decision.rejected +
        decision.waitlisted +
        decision.tbd
    )
}

/**
 * Total event check-ins across all events in a snapshot.
 */
export function totalCheckIns(log: StatisticLog): number {
    return log.events.reduce((sum, event) => sum + event.attendees, 0)
}

/**
 * Total shop redemptions across all items in a snapshot.
 */
export function totalRedeemed(log: StatisticLog): number {
    return log.shopItems.reduce((sum, item) => sum + item.purchased, 0)
}

export interface TrendPoint {
    timestamp: number
    label: string
    checkIns: number
    redeemed: number
}

/**
 * Builds chart points from logs sorted oldest first.
 */
export function buildTrendSeries(
    logs: StatisticLog[],
    formatLabel: (timestamp: number) => string,
): TrendPoint[] {
    return logs.map((log) => ({
        timestamp: log.timestamp,
        label: formatLabel(log.timestamp),
        checkIns: totalCheckIns(log),
        redeemed: totalRedeemed(log),
    }))
}
