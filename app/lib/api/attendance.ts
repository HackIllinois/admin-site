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
    "aadivya.raushan@hackillinois.org",
    "aarav.shah@hackillinois.org",
    "abigail.vaughan-lee@hackillinois.org",
    "aditya.kshirsagar@hackillinois.org",
    "advita.gelli@hackillinois.org",
    "ahan.maurya@hackillinois.org",
    "ahana.chatterjee@hackillinois.org",
    "akul.sharma@hackillinois.org",
    "angelina.deol@hackillinois.org",
    "annette.li@hackillinois.org",
    "aritro.bhattacharjee@hackillinois.org",
    "aslan.wang@hackillinois.org",
    "benjamin.cerda-menchaca@hackillinois.org",
    "eric.zhang@hackillinois.org",
    "hasini.rachakonda@hackillinois.org",
    "hemanth.itte@hackillinois.org",
    "jacob.edley@hackillinois.org",
    "jasmine.liu@hackillinois.org",
    "jason.wang@hackillinois.org",
    "jerry.li@hackillinois.org",
    "kaden.jeon@hackillinois.org",
    "kayla.sison@hackillinois.org",
    "krishna.chidrawar@hackillinois.org",
    "kyle.park@hackillinois.org",
    "leqi.huang@hackillinois.org",
    "megan.tran@hackillinois.org",
    "megh.patel@hackillinois.org",
    "michelle.yi@hackillinois.org",
    "milana.dam@hackillinois.org",
    "milind.kumar@hackillinois.org",
    "mingche.li@hackillinois.org",
    "mousab.eltgani@hackillinois.org",
    "nathan.wang@hackillinois.org",
    "neel.kumar@hackillinois.org",
    "neel.vinchhi@hackillinois.org",
    "prajna.kurella@hackillinois.org",
    "quinten.schafer@hackillinois.org",
    "sandaru.devmal@hackillinois.org",
    "sasrika.ghosh@hackillinois.org",
    "sherry.long@hackillinois.org",
    "shriya.kunnanath@hackillinois.org",
    "sofia.ramirez.ruiz@hackillinois.org",
    "steve.wong@hackillinois.org",
    "tejas.chakrapani@hackillinois.org",
    "tony.hong@hackillinois.org",
    "tvisha.mishra@hackillinois.org",
    "veer.nanda@hackillinois.org",
    "yaseen.halabi@hackillinois.org",
    "zachary.basinger@hackillinois.org",
    "zoeya.khan@hackillinois.org",
    "zoya.lou@hackillinois.org",
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
