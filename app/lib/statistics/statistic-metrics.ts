import type { StatisticLog } from "@/generated"

/**
 * Total shop redemptions across all items in a snapshot.
 */
export function totalRedeemed(log: StatisticLog): number {
    return log.shopItems.reduce((sum, item) => sum + item.purchased, 0)
}

/**
 * Formats `part / whole` as a whole-number percentage.
 */
export function formatPercent(part: number, whole: number): string {
    return whole === 0 ? "—" : `${Math.round((part / whole) * 100)}%`
}
