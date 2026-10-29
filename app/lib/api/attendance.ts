import { AuthService, EventService, type Event } from "@/generated"
import dayjs from "dayjs"

export interface UserInfo {
    userId: string
    name: string
    email: string
    teamId?: string
}

export interface AttendanceData {
    eventId: string
    eventName: string
    eventDate: dayjs.Dayjs
    status: "PRESENT" | "ABSENT" | "EXCUSED"
}

export interface AttendanceStatistics {
    PRESENT: number
    ABSENT: number
    EXCUSED: number
    TOTAL: number
}

export type EventData = Pick<
    Event,
    "eventId" | "name" | "isMandatory" | "startTime"
>

const FALL_2025_START = new Date("2025-09-01").getTime() / 1000

// Active members list
const ACTIVE_MEMBERS_EMAILS = new Set([
    "agelli2@illinois.edu",
    "annette9@illinois.edu",
    "milanad2@illinois.edu",
    "ksiso2@illinois.edu",
    "kyleqp2@illinois.edu",
    "yi52@illinois.edu",
    "abbiev2@illinois.edu",
    "stevew2@illinois.edu",
    "devmal2@illinois.edu",
    "leqih2@illinois.edu",
    "sruiz46@illinois.edu",
    "milindk2@illinois.edu",
    "megant7@illinois.edu",
    "kadensj2@illinois.edu",
    "ahanac3@illinois.edu",
    "vinchhi2@illinois.edu",
    "kc113@illinois.edu",
    "mpate449@illinois.edu",
    "mousabe2@illinois.edu",
    "amaur7@illinois.edu",
    "sghosh50@illinois.edu",
    "jrliu2@illinois.edu",
    "akuls2@illinois.edu",
    "pkure@illinois.edu",
    "jasonw8@illinois.edu",
    "deol2@illinois.edu",
    "zmb3@illinois.edu",
    "zoyalou2@illinois.edu",
    "nathanw8@illinois.edu",
    "sherryl4@illinois.edu",
    "tonyhong@illinois.edu",
    "atshah@illinois.edu",
    "veern2@illinois.edu",
    "jerryel2@illinois.edu",
    "tvishacmishra@gmail.com",
    "bcerd@illinois.edu",
    "mingche3@illinois.edu",
    "hitte@illinois.edu",
    "zoeyak2@illinois.edu",
    "yaseenh2@illinois.edu",
    "qas3@illinois.edu",
    "aslanw2@illinois.edu",
    "ezhan293@illinois.edu",
    "tejaslc2@illinois.edu",
    "aritrob2@illinois.edu",
    "hrach2@illinois.edu",
    "svkunn@illinois.edu",
    "edley2@illinois.edu",
    "neelvk2@illinois.edu",
    "raushan2@illinois.edu",
    "amk13@illinois.edu",
])

// Cache for event names
const eventNameCache = new Map<string, string>()

export function isActiveStaffMember(email: string): boolean {
    return ACTIVE_MEMBERS_EMAILS.has(email)
}

export async function getAllStaffUsers(): Promise<UserInfo[]> {
    try {
        const response = await AuthService.getAuthRolesListInfoByRole({
            path: { role: "STAFF" },
        })
        return response.data?.userInfo || []
    } catch (error) {
        console.error("Error fetching staff users:", error)
        return []
    }
}

export async function getAllMandatoryEvents(): Promise<EventData[]> {
    try {
        const response = await EventService.getEvent()
        const events = response.data?.events || []

        const mandatoryEvents = events.filter((event: Event) => {
            const isMandatory = event.isMandatory === true
            const isAfterFallStart = event.startTime >= FALL_2025_START

            return isMandatory && isAfterFallStart
        })

        return mandatoryEvents
    } catch (error) {
        console.error("Error fetching mandatory events:", error)
        return []
    }
}

async function getEventName(eventId: string): Promise<string> {
    if (eventNameCache.has(eventId)) {
        return eventNameCache.get(eventId)!
    }

    try {
        const response = await EventService.getEventById({
            path: { id: eventId },
        })

        const eventName = response.data?.name || "Unknown Event"
        eventNameCache.set(eventId, eventName)
        return eventName
    } catch (error) {
        console.error(`Error fetching event name for ${eventId}:`, error)
        return "Unknown Event"
    }
}

export async function preloadEventNames(events?: EventData[]): Promise<void> {
    try {
        const mandatoryEvents = events || (await getAllMandatoryEvents())
        mandatoryEvents.forEach((event) => {
            if (event.eventId && event.name) {
                eventNameCache.set(event.eventId, event.name)
            }
        })
    } catch (error) {
        console.error("Error preloading event names:", error)
    }
}

export async function getUserAttendanceRecords(
    userId: string,
    mandatoryEvents?: EventData[],
): Promise<AttendanceData[]> {
    try {
        const response = await EventService.getEventAttendanceById({
            path: { id: userId },
        })

        const data = response.data

        // Use a Map to track events and prioritize: PRESENT > EXCUSED > ABSENT
        // If someone checked in, they're present regardless of excused status
        const recordsMap = new Map<string, AttendanceData>()

        // Get all mandatory events to check against (use provided or fetch if not provided)
        const events = mandatoryEvents || (await getAllMandatoryEvents())
        const mandatoryEventIds = new Set(events.map((e) => e.eventId))

        // Process ABSENT first (lowest priority)
        if (data?.absent && Array.isArray(data.absent)) {
            for (const [eventId, startTime] of data.absent) {
                if (
                    startTime >= FALL_2025_START &&
                    mandatoryEventIds.has(eventId)
                ) {
                    const eventName = await getEventName(eventId)

                    recordsMap.set(eventId, {
                        eventId,
                        eventDate: dayjs(startTime * 1000),
                        eventName,
                        status: "ABSENT",
                    })
                }
            }
        }

        // Process EXCUSED next (medium priority, overwrites ABSENT)
        if (data?.excused && Array.isArray(data.excused)) {
            for (const [eventId, startTime] of data.excused) {
                if (
                    startTime >= FALL_2025_START &&
                    mandatoryEventIds.has(eventId)
                ) {
                    const eventName = await getEventName(eventId)
                    recordsMap.set(eventId, {
                        eventId,
                        eventDate: dayjs(startTime * 1000),
                        eventName,
                        status: "EXCUSED",
                    })
                }
            }
        }

        // Process PRESENT last (highest priority, overwrites EXCUSED and ABSENT)
        if (data?.present && Array.isArray(data.present)) {
            for (const [eventId, startTime] of data.present) {
                if (
                    startTime >= FALL_2025_START &&
                    mandatoryEventIds.has(eventId)
                ) {
                    const eventName = await getEventName(eventId)
                    recordsMap.set(eventId, {
                        eventId,
                        eventDate: dayjs(startTime * 1000),
                        eventName,
                        status: "PRESENT",
                    })
                }
            }
        }

        const records = Array.from(recordsMap.values())
        records.sort((a, b) => a.eventDate.valueOf() - b.eventDate.valueOf())

        return records
    } catch (error) {
        console.error(`Error fetching attendance for user ${userId}:`, error)
        return []
    }
}

export function calculateAttendanceStatistics(
    records: AttendanceData[],
): AttendanceStatistics {
    const stats = {
        PRESENT: 0,
        ABSENT: 0,
        EXCUSED: 0,
        TOTAL: records.length,
    }

    records.forEach((record) => {
        stats[record.status]++
    })

    return stats
}
