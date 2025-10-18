'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
} from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import AttendanceRow from './AttendanceRow'
import { AttendanceRecord } from './AttendanceModal'
import { StaffStatistics } from './AttendanceBar'
import {
  getAllStaffUsers,
  getAllMandatoryEvents,
  getUserAttendanceRecords,
  calculateAttendanceStatistics,
  type UserInfo,
} from '../lib/api/attendance'

const theme = createTheme({
  typography: {
    fontFamily: 'Montserrat, Arial, sans-serif',
  },
})

interface AttendanceData {
  user: UserInfo
  statistics: StaffStatistics
  records: AttendanceRecord[]
}

export default function AttendanceView() {
  const [attendances, setAttendances] = useState<AttendanceData[]>([])
  const [loading, setLoading] = useState(true)
  const [teamFilter, setTeamFilter] = useState<string>('all')
  const [teams, setTeams] = useState<string[]>(['all'])

  useEffect(() => {
    async function fetchAttendanceData() {
      setLoading(true)
      try {
        const users = await getAllStaffUsers()
        const events = await getAllMandatoryEvents()

        const attendancePromises = users.map(async (user) => {
          const records = await getUserAttendanceRecords(user.userId, events)
          const statistics = calculateAttendanceStatistics(records)

          return {
            user,
            statistics,
            records: records.map((r) => ({
              date: r.eventDate,
              status: r.status,
              eventName: r.eventName,
            })),
          }
        })

        const attendanceData = await Promise.all(attendancePromises)
        setAttendances(attendanceData)

        const uniqueTeams = Array.from(
          new Set(
            users
              .map((u) => u.teamId)
              .filter((id): id is string => Boolean(id))
          )
        )
        setTeams(['all', ...uniqueTeams])
      } catch (error) {
        console.error('Error fetching attendance data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAttendanceData()
  }, [])

  const filteredAttendances =
    teamFilter === 'all'
      ? attendances
      : attendances.filter((a) => a.user.teamId === teamFilter)

  const handleTeamChange = (
    _event: React.MouseEvent<HTMLElement>,
    newTeam: string | null
  ) => {
    if (newTeam !== null) {
      setTeamFilter(newTeam)
    }
  }

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          p={2}
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <Box p={2}>
        <Typography variant="h4" gutterBottom>
          Attendance
        </Typography>

        <Box sx={{ mb: 3 }}>
          <ToggleButtonGroup
            value={teamFilter}
            exclusive
            onChange={handleTeamChange}
            aria-label="team filter"
            sx={{ mb: 2 }}
          >
            {teams.map((team) => (
              <ToggleButton
                key={team}
                value={team}
                aria-label={team === 'all' ? 'all teams' : team}
              >
                {team === 'all' ? 'All Teams' : team}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Name</strong>
                </TableCell>
                <TableCell>
                  <strong>Email</strong>
                </TableCell>
                <TableCell>
                  <strong>Attendance</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAttendances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography color="text.secondary">
                      No attendance data available
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAttendances.map((attendance) => (
                  <AttendanceRow
                    key={attendance.user.userId}
                    name={attendance.user.name}
                    email={attendance.user.email}
                    team={attendance.user.teamId || 'No Team'}
                    statistics={attendance.statistics}
                    attendanceRecords={attendance.records}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </ThemeProvider>
  )
}