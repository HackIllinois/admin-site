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

export async function getEventAttendance(eventId: string) {
  try {
    const response = await EventService.getEventAttendeesById({
      path: { id: eventId }
    })
    return {
      attendees: response.data?.attendees || [],
      excusedAttendees: response.data?.excusedAttendees || [],
    }
  } catch (error) {
    console.error(`Error fetching attendance for event ${eventId}:`, error)
    return { attendees: [], excusedAttendees: [] }
  }
}

export async function getUserAttendanceRecords(
  userId: string,
  events: any[]
): Promise<AttendanceData[]> {
  const records: AttendanceData[] = []

  for (const event of events) {
    const { attendees, excusedAttendees } = await getEventAttendance(
      event.eventId
    )

    let status: 'PRESENT' | 'ABSENT' | 'EXCUSED'
    if (attendees.includes(userId)) {
      status = 'PRESENT'
    } else if (excusedAttendees.includes(userId)) {
      status = 'EXCUSED'
    } else {
      status = 'ABSENT'
    }

    const eventDate = new Date(event.startTime * 1000)

    records.push({
      eventId: event.eventId,
      eventName: event.name,
      eventDate: eventDate.toISOString().split('T')[0],
      status,
    })
  }

  return records
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