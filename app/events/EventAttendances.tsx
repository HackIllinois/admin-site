import { EventService, UserInfo } from "@/generated"
import { CheckCircle, Delete, EventBusy, Cancel } from "@mui/icons-material"
import {
    Box,
    Chip,
    CircularProgress,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from "@mui/material"
import { useEffect, useState, useCallback } from "react"
import { getAllStaffUsers, isActiveStaffMember } from "@/app/lib/api/attendance"

type EventAttendancesProps = {
  eventId: string
}

type StaffAttendanceStatus = {
  user: UserInfo
  status: 'PRESENT' | 'EXCUSED' | 'ABSENT'
}

export default function EventAttendances({ eventId }: EventAttendancesProps) {
  const [attendances, setAttendances] = useState<StaffAttendanceStatus[]>([])
  const [loading, setLoading] = useState(false)

  const handleToggleExcused = async (userId: string, currentStatus: 'PRESENT' | 'EXCUSED' | 'ABSENT') => {
    try {
      // Toggle: if currently excused, set to not excused (absent), otherwise set to excused
      const shouldBeExcused = currentStatus !== 'EXCUSED'

      await EventService.putEventMarkExcusedById({
        path: { id: eventId },
        body: { userId, excused: shouldBeExcused }
      })

      // Update local state instead of reloading everything
      setAttendances(prevAttendances =>
        prevAttendances.map(attendance => {
          if (attendance.user.userId === userId) {
            // Determine new status
            let newStatus: 'PRESENT' | 'EXCUSED' | 'ABSENT'
            if (shouldBeExcused) {
              newStatus = 'EXCUSED'
            } else if (currentStatus === 'EXCUSED') {
              // If they were excused and we're unmarking them, check if they were originally present
              newStatus = 'ABSENT' // Default to absent when unmarking excused
            } else {
              newStatus = currentStatus
            }
            return { ...attendance, status: newStatus }
          }
          return attendance
        })
      )
    } catch (err) {
      console.error("Failed to update excused status:", err)
      alert("Failed to update excused status. Please try again.")
      // Reload on error to ensure data is in sync
      await handleLoadEventAttendances()
    }
  }

  const handleLoadEventAttendances = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch all staff members
      const allStaff = await getAllStaffUsers()

      // Filter for active members only
      const activeStaff = allStaff.filter(user => isActiveStaffMember(user.email))

      // Fetch event attendees and excused list
      const eventData = await EventService.getEventAttendeesById({
        path: { id: eventId },
      })

      const attendeeIds = new Set(eventData.data?.attendees || [])
      const excusedIds = new Set(eventData.data?.excusedAttendees || [])

      // Map all active staff to their attendance status
      const staffWithStatus: StaffAttendanceStatus[] = activeStaff.map(user => {
        let status: 'PRESENT' | 'EXCUSED' | 'ABSENT' = 'ABSENT'

        if (excusedIds.has(user.userId)) {
          status = 'EXCUSED'
        } else if (attendeeIds.has(user.userId)) {
          status = 'PRESENT'
        }

        return { user, status }
      })

      // Sort by name
      staffWithStatus.sort((a, b) => a.user.name.localeCompare(b.user.name))

      setAttendances(staffWithStatus)
    } catch (err) {
      console.error(err)
      setAttendances([])
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    handleLoadEventAttendances()
  }, [handleLoadEventAttendances])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    )
  }

  const getStatusChip = (status: 'PRESENT' | 'EXCUSED' | 'ABSENT') => {
    switch (status) {
      case 'PRESENT':
        return <Chip icon={<CheckCircle />} label="Present" color="success" size="small" />
      case 'EXCUSED':
        return <Chip icon={<EventBusy />} label="Excused" color="primary" size="small" />
      case 'ABSENT':
        return <Chip icon={<Cancel />} label="Absent" color="error" size="small" />
    }
  }

  if (attendances.length === 0) {
    return (
      <Typography variant="body1" align="center" color="textSecondary" p={2}>
        No staff members found.
      </Typography>
    )
  }

  return (
    <TableContainer component={Paper} sx={{
        marginBottom: 2,
        maxHeight: 'calc(100vh - 300px)',
        overflow: 'auto'
      }}>
      <Table stickyHeader aria-label="Event Attendance">
        <TableHead>
            <TableRow>
                <TableCell sx={{ fontFamily: 'Montserrat, Segoe UI, Roboto, sans-serif', fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontFamily: 'Montserrat, Segoe UI, Roboto, sans-serif', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontFamily: 'Montserrat, Segoe UI, Roboto, sans-serif', fontWeight: 'bold' }}></TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {attendances.map(({ user, status }) => (
                <TableRow key={user.userId}>
                <TableCell sx={{ fontFamily: 'Montserrat, Segoe UI, Roboto, sans-serif' }}>{user.name}</TableCell>
                <TableCell sx={{ fontFamily: 'Montserrat, Segoe UI, Roboto, sans-serif' }}>{user.email}</TableCell>
                <TableCell>{getStatusChip(status)}</TableCell>
                <TableCell>
                    <Tooltip title={status === 'EXCUSED' ? 'Unmark as excused' : 'Mark as excused'}>
                        <IconButton
                            size="small"
                            onClick={() => handleToggleExcused(user.userId, status)}
                            aria-label={status === 'EXCUSED' ? `Unmark ${user.name} as excused` : `Mark ${user.name} as excused`}
                            color={status === 'EXCUSED' ? 'default' : 'primary'}
                        >
                            <EventBusy fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove attendee">
                        <IconButton
                            size="small"
                            onClick={() => {
                                // TODO: call your removeAttendance function here
                                console.log("Remove", user.userId)
                            }}
                            aria-label={`Remove ${user.name}`}
                            color="error"
                        >
                            <Delete fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
      </Table>
    </TableContainer>
  )
}
