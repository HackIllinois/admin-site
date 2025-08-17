// AttendanceModal.tsx
'use client'

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from '@mui/material'
import React from 'react'
import { StaffStatistics } from './AttendanceBar'

export interface AttendanceModalProps {
  open: boolean
  onClose: () => void
  name: string
  email: string
  statistics: StaffStatistics
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({
  open,
  onClose,
  name,
  email
}) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>{name}&apos;s Attendance</DialogTitle>
    <DialogContent dividers>
      <Typography variant="subtitle1" gutterBottom>
        Email: {email}
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
)

export default AttendanceModal
