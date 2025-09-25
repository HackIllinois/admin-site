import { EventService, UserInfo, UserService } from "@/generated"
import { Delete } from "@mui/icons-material"
import {
    Box,
    CircularProgress,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material"
import { useEffect, useState } from "react"

type EventAttendancesProps = {
  eventId: string
}

export default function EventAttendances({ eventId }: EventAttendancesProps) {
  const [attendances, setAttendances] = useState<UserInfo[]>([])
  const [loading, setLoading] = useState(false)

  const handleLoadEventAttendances = async () => {
    setLoading(true)
    try {
      const eventAttendees = await EventService.getEventAttendeesById({
        path: { id: eventId },
      })
      if (!eventAttendees.data?.attendees) {
        // no attendees
        setAttendances([])
      } else {
        const infos: UserInfo[] = []
        for (const attendeeId of eventAttendees.data.attendees) {
          const user = await UserService.getUserById({
            path: { id: attendeeId },
          })
          if (user.data) infos.push(user.data)
          else console.error(`Failed to fetch data for ${attendeeId}`)
        }
        setAttendances(infos)
      }
    } catch (err) {
      console.error(err)
      setAttendances([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleLoadEventAttendances()
  }, [eventId])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    )
  }

  if (attendances.length === 0) {
    return (
      <Typography variant="body1" align="center" color="textSecondary" p={2}>
        No attendees found.
      </Typography>
    )
  }

  return (
    <TableContainer component={Paper} sx={{
        marginBottom: 2
      }}>
      <Table aria-label="Event Attendance">
        <TableHead>
            <TableRow>
                <TableCell sx={{ fontFamily: 'Montserrat', fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontFamily: 'Montserrat', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontFamily: 'Montserrat', fontWeight: 'bold' }}></TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {attendances.map((user) => (
                <TableRow key={user.userId}>
                <TableCell sx={{ fontFamily: 'Montserrat' }}>{user.name}</TableCell>
                <TableCell sx={{ fontFamily: 'Montserrat' }}>{user.email}</TableCell>
                <TableCell>
                    <IconButton
                    size="small"
                    onClick={() => {
                        // TODO: call your removeAttendance function here
                        console.log("Remove", user.userId)
                    }}
                    aria-label={`Remove ${user.name}`}
                    >
                        <Delete fontSize="small" />
                    </IconButton>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
      </Table>
    </TableContainer>
  )
}
