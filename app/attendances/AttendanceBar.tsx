import React, { FC } from 'react'
import { Box, Tooltip } from '@mui/material'

export interface StaffStatistics {
  ABSENT: number
  PRESENT: number
  EXCUSED: number
  TOTAL: number
}

export interface AttendanceBarProps {
  statistics: StaffStatistics
}

const AttendanceBar: FC<AttendanceBarProps> = ({ statistics }) => {
  const { ABSENT: absent, PRESENT: present, EXCUSED: excused, TOTAL: total } = statistics
  const minPercent = 10

  const presentPercent =
    present === 0 ? 0 : Math.max((present / total) * 100 || 0, minPercent)
  const absentPercent =
    absent === 0 ? 0 : Math.max((absent / total) * 100 || 0, minPercent)
  const excusedPercent =
    excused === 0 ? 0 : Math.max((excused / total) * 100 || 0, minPercent)

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        height: 20,
        borderRadius: 1,
        overflow: 'hidden',
        border: 1,
        borderColor: 'grey.300',
      }}
    >
      <Tooltip title={`${present} Present`} arrow>
        <Box
          sx={{
            width: `${presentPercent}%`,
            bgcolor: 'success.main',
            height: '100%',
          }}
        />
      </Tooltip>

      <Tooltip title={`${absent} Absent`} arrow>
        <Box
          sx={{
            width: `${absentPercent}%`,
            bgcolor: 'error.main',
            height: '100%',
          }}
        />
      </Tooltip>

      <Tooltip title={`${excused} Excused`} arrow>
        <Box
          sx={{
            width: `${excusedPercent}%`,
            bgcolor: 'info.main',
            height: '100%',
          }}
        />
      </Tooltip>
    </Box>
  )
}

export default AttendanceBar