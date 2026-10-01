import type { Event, ShopItem, StatisticLog } from "@/generated"

/**
 * Builds a lookup from event id to display name.
 */
export function buildEventNameMap(events: Event[]): Map<string, string> {
    return new Map(events.map((event) => [event.eventId, event.name]))
}

/**
 * Builds a lookup from shop item id to display name.
 */
export function buildShopItemNameMap(items: ShopItem[]): Map<string, string> {
    return new Map(items.map((item) => [item.itemId, item.name]))
}

/**
 * Sorts statistic logs newest first by timestamp.
 */
export function sortLogsNewestFirst(logs: StatisticLog[]): StatisticLog[] {
    return [...logs].sort((a, b) => b.timestamp - a.timestamp)
}

/**
 * Formats a statistic log timestamp (Unix seconds) for display.
 */
export function formatStatisticTimestamp(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    })
}
