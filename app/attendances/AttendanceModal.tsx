"use client"

import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    Tooltip,
} from "@mui/material"
import React from "react"

import dayjs from "dayjs";

export interface AttendanceRecord {
    date: string
    status: "PRESENT" | "ABSENT" | "EXCUSED"
    eventName?: string
}

export interface AttendanceModalProps {
    open: boolean
    onClose: () => void
    name: string
    email: string
    attendanceRecords: AttendanceRecord[]
}

const AttendanceDate: React.FC<{ record: AttendanceRecord }> = ({ record }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "PRESENT":
                return "#4caf50"
            case "ABSENT":
                return "#f44336"
            case "EXCUSED":
                return "#2196f3"
            default:
                return "#e0e0e0"
        }
    }

    const formatFullDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const dayNumber = dayjs(record.date).date();

    return (
        <Tooltip
            title={
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        {formatFullDate(record.date)}
                    </Typography>
                    <Typography variant="body2">
                        {record.eventName || "Staff Meeting"}
                    </Typography>
                    <Typography variant="body2">
                        Status: {record.status}
                    </Typography>
                </Box>
            }
            arrow
            placement="top"
        >
            <Box
                sx={{
                    width: 50,
                    height: 50,
                    bgcolor: getStatusColor(record.status),
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    "&:hover": {
                        opacity: 0.8,
                    },
                }}
            >
                {dayNumber}
            </Box>
        </Tooltip>
    )
}

const AttendanceMonth: React.FC<{
    month: string
    records: AttendanceRecord[]
}> = ({ month, records }) => {
    const formatMonth = (monthStr: string) => {
        const [year, monthNum] = monthStr.split("-")
        const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ]
        return `${monthNames[parseInt(monthNum) - 1]} ${year}`
    }

    return (
        <Box
            sx={{
                minWidth: 200,
                flexShrink: 0,
            }}
        >
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                {formatMonth(month)}
            </Typography>
            <Box
                sx={{
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                    alignContent: "flex-start",
                }}
            >
                {records.map((record, idx) => (
                    <AttendanceDate key={idx} record={record} />
                ))}
            </Box>
        </Box>
    )
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({
    open,
    onClose,
    name,
    attendanceRecords = [],
}) => {
    const groupedByMonth = attendanceRecords.reduce(
        (acc, record) => {
            const month = record.date.substring(0, 7)
            if (!acc[month]) acc[month] = []
            acc[month].push(record)
            return acc
        },
        {} as Record<string, AttendanceRecord[]>,
    )

    const months = Object.keys(groupedByMonth).sort()

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
            <DialogTitle>
                <Box>
                    <Typography variant="h6">{name} - Attendance</Typography>
                </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ bgcolor: "#f5f5f5" }}>
                {months.length === 0 ? (
                    <Typography variant="body1" color="text.secondary">
                        No attendance records found.
                    </Typography>
                ) : (
                    <Box
                        sx={{
                            bgcolor: "white",
                            p: 3,
                            borderRadius: 1,
                            border: "1px solid #000",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                gap: 4,
                                alignItems: "flex-start",
                            }}
                        >
                            <Typography
                                sx={{
                                    width: 120,
                                    fontWeight: "bold",
                                    fontSize: "0.95rem",
                                    pt: 1,
                                    flexShrink: 0,
                                }}
                            >
                                ATTENDANCE
                            </Typography>
                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 4,
                                    flexWrap: "wrap",
                                }}
                            >
                                {months.map((month) => (
                                    <AttendanceMonth
                                        key={month}
                                        month={month}
                                        records={groupedByMonth[month] || []}
                                    />
                                ))}
                            </Box>
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
