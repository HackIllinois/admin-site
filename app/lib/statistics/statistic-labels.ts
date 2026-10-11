import type { Event } from "@/generated"

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
