import type { Event, ShopItem } from "@/generated"

/**
 * Builds a lookup from event id to event.
 */
export function buildEventLookup(events: Event[]): Map<string, Event> {
    return new Map(events.map((event) => [event.eventId, event]))
}

/**
 * Builds a lookup from shop item id to display name.
 */
export function buildShopItemNameMap(items: ShopItem[]): Map<string, string> {
    return new Map(items.map((item) => [item.itemId, item.name]))
}

/**
 * Label for an id that no longer exists in Adonix (for example, a past year's event).
 */
export function formatMissingLabel(prefix: string, id: string): string {
    return `${prefix} · ${id.slice(0, 6)}`
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

/**
 * Short label for chart axes (Unix seconds).
 */
export function formatTrendAxisLabel(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString(undefined, {
        weekday: "short",
        hour: "numeric",
    })
}
