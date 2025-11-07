import { AuthService, EventService } from '@/generated'

export interface UserInfo {
  userId: string
  name: string
  email: string
  teamId?: string
}

export interface AttendanceData {
  eventId: string
  eventName: string
  eventDate: string
  status: 'PRESENT' | 'ABSENT' | 'EXCUSED'
}

export interface AttendanceStatistics {
  PRESENT: number
  ABSENT: number
  EXCUSED: number
  TOTAL: number
}

const FALL_2025_START = new Date('2025-09-01').getTime() / 1000

// Cache for event names
const eventNameCache = new Map<string, string>()

export async function getAllStaffUsers(): Promise<UserInfo[]> {
  try {
    const response = await AuthService.getAuthRolesListInfoByRole({
      path: { role: 'STAFF' }
    })
    return response.data?.userInfo || []
  } catch (error) {
    console.error('Error fetching staff users:', error)
    return []
  }
}

export async function getAllMandatoryEvents(): Promise<any[]> {
  try {
    const response = await EventService.getEvent()
    const events = response.data?.events || []

    const mandatoryEvents = events.filter((event: any) => {
      const isMandatory = event.isMandatory === true
      const isAfterFallStart = event.startTime >= FALL_2025_START

      return isMandatory && isAfterFallStart
    })

    return mandatoryEvents
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

async function getEventName(eventId: string): Promise<string> {
  if (eventNameCache.has(eventId)) {
    return eventNameCache.get(eventId)!
  }
  
  try {
    const response = await EventService.getEventById({
      path: { id: eventId }
    })
    
    const eventName = response.data?.name || 'Unknown Event'
    eventNameCache.set(eventId, eventName)
    return eventName
  } catch (error) {
    console.error(`Error fetching event name for ${eventId}:`, error)
    return 'Unknown Event'
  }
}

export async function preloadEventNames(events?: any[]): Promise<void> {
  try {
    const mandatoryEvents = events || await getAllMandatoryEvents()
    console.log('Preloading events:', mandatoryEvents.length)
    mandatoryEvents.forEach(event => {
      if (event.eventId && event.name) {
        eventNameCache.set(event.eventId, event.name)
      }
    })
  } catch (error) {
    console.error('Error preloading event names:', error)
  }
}

export async function getUserAttendanceRecords(
  userId: string,
  mandatoryEvents?: any[]
): Promise<AttendanceData[]> {
  try {
    const response = await EventService.getEventAttendanceById({
      path: { id: userId }
    })

    const data = response.data
    console.log(`Raw attendance data for ${userId}:`, data)

    const records: AttendanceData[] = []

    // Get all mandatory events to check against (use provided or fetch if not provided)
    const events = mandatoryEvents || await getAllMandatoryEvents()
    const mandatoryEventIds = new Set(events.map(e => e.eventId))

    if (data?.present && Array.isArray(data.present)) {
      console.log(`${userId} - Present events:`, data.present.length)
      for (const [eventId, startTime] of data.present) {
        console.log(`  Event ${eventId}, time: ${startTime}, filter: ${FALL_2025_START}`)
        if (startTime >= FALL_2025_START && mandatoryEventIds.has(eventId)) {
          const eventName = await getEventName(eventId)
          console.log(`  Event name: ${eventName}`)
          records.push({
            eventId,
            eventDate: new Date(startTime * 1000).toISOString().split('T')[0],
            eventName,
            status: 'PRESENT',
          })
        }
      }
    }

    if (data?.excused && Array.isArray(data.excused)) {
      console.log(`${userId} - Excused events:`, data.excused.length)
      for (const [eventId, startTime] of data.excused) {
        if (startTime >= FALL_2025_START && mandatoryEventIds.has(eventId)) {
          const eventName = await getEventName(eventId)
          records.push({
            eventId,
            eventDate: new Date(startTime * 1000).toISOString().split('T')[0],
            eventName,
            status: 'EXCUSED',
          })
        }
      }
    }

    if (data?.absent && Array.isArray(data.absent)) {
      console.log(`${userId} - Absent events:`, data.absent.length)
      for (const [eventId, startTime] of data.absent) {
        if (startTime >= FALL_2025_START && mandatoryEventIds.has(eventId)) {
          const eventName = await getEventName(eventId)
          records.push({
            eventId,
            eventDate: new Date(startTime * 1000).toISOString().split('T')[0],
            eventName,
            status: 'ABSENT',
          })
        }
      }
    }

    console.log(`Final records for ${userId}:`, records.length)
    records.sort((a, b) => b.eventDate.localeCompare(a.eventDate))

    return records
  } catch (error) {
    console.error(`Error fetching attendance for user ${userId}:`, error)
    return []
  }
}

export function calculateAttendanceStatistics(
  records: AttendanceData[]
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