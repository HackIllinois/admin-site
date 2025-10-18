'use client'

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import React from 'react'

export interface AttendanceRecord {
  date: string
  status: 'PRESENT' | 'ABSENT' | 'EXCUSED'
  eventName?: string
}

export interface AttendanceModalProps {
  open: boolean
  onClose: () => void
  name: string
  email: string
  team: string
  attendanceRecords: AttendanceRecord[]
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({
  open,
  onClose,
  name,
  team,
  attendanceRecords = [],
}) => {
  const groupedByMonth = attendanceRecords.reduce((acc, record) => {
    const month = record.date.substring(0, 7)
    if (!acc[month]) acc[month] = []
    acc[month].push(record)
    return acc
  }, {} as Record<string, AttendanceRecord[]>)

  const months = Object.keys(groupedByMonth).sort()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return '#4caf50'
      case 'ABSENT':
        return '#f44336'
      case 'EXCUSED':
        return '#2196f3'
      default:
        return '#e0e0e0'
    }
  }

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + '-01')
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>
        <Box>
          <Typography variant="h6">{name} - Attendance</Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers sx={{ bgcolor: '#f5f5f5' }}>
        <Box sx={{ mb: 3 }}>
          <Chip
            label={team}
            icon={<span>💼</span>}
            variant="outlined"
            sx={{ bgcolor: 'white' }}
          />
        </Box>

        {months.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            No attendance records found.
          </Typography>
        ) : (
          <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
              <Box sx={{ width: 120 }}></Box>
              {months.map((month) => (
                <Box key={month} sx={{ flex: 1, textAlign: 'center' }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {formatMonth(month)}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
              <Typography
                sx={{
                  width: 120,
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  pt: 1,
                }}
              >
                ATTENDANCE
              </Typography>
              {months.map((month) => (
                <Box
                  key={month}
                  sx={{
                    flex: 1,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, 50px)',
                    gap: 1,
                  }}
                >
                  {groupedByMonth[month]?.map((record, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        width: 50,
                        height: 50,
                        bgcolor: getStatusColor(record.status),
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                      }}
                      title={`${record.eventName || record.date} - ${record.status}`}
                    >
                      {new Date(record.date).getDate()}
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AttendanceModal