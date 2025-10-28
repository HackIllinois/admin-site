import { AuthService, EventService } from '@/generated'
import { createClient, createConfig } from '@hey-api/client-fetch'
import type { ClientOptions } from '@/generated/types.gen'

// Create a custom client that uses the full URL (same as other SDK calls)
const customClient = createClient(createConfig<ClientOptions>({
  baseUrl: 'https://adonix.hackillinois.org'
}))

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
    
    const staffMeetings = events.filter((event: any) => {
      const isStaffMeeting = event.name && event.name.includes('Staff Meeting')
      const isAfterSept1 = event.startTime >= FALL_2025_START
      
      return isStaffMeeting && isAfterSept1
    })
    
    return staffMeetings
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

export async function preloadEventNames(): Promise<void> {
  try {
    const events = await getAllMandatoryEvents()
    events.forEach(event => {
      if (event.eventId && event.name) {
        eventNameCache.set(event.eventId, event.name)
      }
    })
  } catch (error) {
    console.error('Error preloading event names:', error)
  }
}

export async function getUserAttendanceRecords(
  userId: string
): Promise<AttendanceData[]> {
  try {
    const response = await EventService.getEventAttendanceById({
      path: { id: userId },
      client: customClient
    })
    
    const data = response.data
    const records: AttendanceData[] = []
    
    if (data?.present && Array.isArray(data.present)) {
      for (const [eventId, startTime] of data.present) {
        if (startTime >= FALL_2025_START) {
          const eventName = await getEventName(eventId)
          if (eventName.includes('Staff Meeting')) {
            records.push({
              eventId,
              eventDate: new Date(startTime * 1000).toISOString().split('T')[0],
              eventName,
              status: 'PRESENT',
            })
          }
        }
      }
    }
    
    if (data?.excused && Array.isArray(data.excused)) {
      for (const [eventId, startTime] of data.excused) {
        if (startTime >= FALL_2025_START) {
          const eventName = await getEventName(eventId)
          if (eventName.includes('Staff Meeting')) {
            records.push({
              eventId,
              eventDate: new Date(startTime * 1000).toISOString().split('T')[0],
              eventName,
              status: 'EXCUSED',
            })
          }
        }
      }
    }
    
    if (data?.absent && Array.isArray(data.absent)) {
      for (const [eventId, startTime] of data.absent) {
        if (startTime >= FALL_2025_START) {
          const eventName = await getEventName(eventId)
          if (eventName.includes('Staff Meeting')) {
            records.push({
              eventId,
              eventDate: new Date(startTime * 1000).toISOString().split('T')[0],
              eventName,
              status: 'ABSENT',
            })
          }
        }
      }
    }
    
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