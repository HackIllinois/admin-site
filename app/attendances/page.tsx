// AttendanceView.tsx
'use client'

import React, { useState } from 'react'
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
} from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import AttendanceBar, { StaffStatistics } from './AttendanceBar'
import AttendanceModal from './AttendanceModal'

const theme = createTheme({
  typography: {
    fontFamily: 'Montserrat, Arial, sans-serif',
  },
})

type AttendanceRecord = {
  name: string
  email: string
  statistics: StaffStatistics
}

export default function AttendanceView() {
  const attendances: AttendanceRecord[] = [
    {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      statistics: { ABSENT: 2, PRESENT: 8, EXCUSED: 2, TOTAL: 12 },
    },
    {
      name: 'Bob Smith',
      email: 'bob@example.com',
      statistics: { ABSENT: 1, PRESENT: 6, EXCUSED: 1, TOTAL: 8 },
    },
    {
      name: 'Carol Lee',
      email: 'carol@example.com',
      statistics: { ABSENT: 3, PRESENT: 10, EXCUSED: 2, TOTAL: 15 },
    },
  ]

  const [selected, setSelected] = useState<AttendanceRecord | null>(null)

  return (
    <ThemeProvider theme={theme}>
      <Box p={2}>
        <Typography variant="h4" gutterBottom>
          Attendance
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Attendance</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendances.map((row) => (
                <TableRow
                  key={row.email}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setSelected(row)}
                >
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>
                    <AttendanceBar statistics={row.statistics} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <AttendanceModal
          open={!!selected}
          onClose={() => setSelected(null)}
          name={selected?.name ?? ''}
          email={selected?.email ?? ''}
          statistics={selected?.statistics ?? { ABSENT: 0, PRESENT: 0, EXCUSED: 0, TOTAL: 0 }}
        />
      </Box>
    </ThemeProvider>
  )
}
