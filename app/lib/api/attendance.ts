async function fetchAPI(endpoint: string) {
  const token = localStorage.getItem('token')
  const response = await fetch(`https://adonix.hackillinois.org${endpoint}`, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  if (!response.ok) {
    const errorText = await response.text()
    console.error(`API error: ${response.status} - ${errorText}`)
    throw new Error(`API error: ${response.statusText}`)
  }
  return response.json()
}

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

// October 1st, 2025
const FALL_2025_START = new Date('2025-10-01').getTime() / 1000 // Convert to Unix timestamp

export async function getAllStaffUsers(): Promise<UserInfo[]> {
  try {
    const data = await fetchAPI('/auth/roles/list-info/STAFF/')
    console.log('Full user structure:', JSON.stringify(data.userInfo?.[0], null, 2))
    return data.userInfo || []
  } catch (error) {
    console.error('Error fetching staff users:', error)
    return []
  }
}

export async function getAllMandatoryEvents(): Promise<any[]> {
  try {
    const data = await fetchAPI('/event/')
    const events = data.events || []
    
    // Filter Staff Meetings from October 1st, 2025 onwards
    const staffMeetings = events.filter((event: any) => {
      const isStaffMeeting = event.name && event.name.includes('Staff Meeting')
      const isAfterOct1 = event.startTime >= FALL_2025_START
      
      return isStaffMeeting && isAfterOct1
    })
    
    console.log(`Found ${staffMeetings.length} staff meetings from Oct 1st onwards`)
    
    return staffMeetings
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

export async function getEventAttendance(eventId: string) {
  try {
    const data = await fetchAPI(`/event/attendees/${eventId}/`)
    return {
      attendees: data.attendees || [],
      excusedAttendees: data.excusedAttendees || [],
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
    const { attendees, excusedAttendees } = await getEventAttendance(event.eventId)

    let status: 'PRESENT' | 'ABSENT' | 'EXCUSED'
    if (attendees.includes(userId)) {
      status = 'PRESENT'
    } else if (excusedAttendees.includes(userId)) {
      status = 'EXCUSED'
    } else {
      status = 'ABSENT'
    }

    // Convert Unix timestamp (seconds) to milliseconds for JavaScript Date
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