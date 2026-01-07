"use client"

import { Box, TableCell, TableRow, Typography } from "@mui/material"
import React, { useState } from "react"
import AttendanceBar, { StaffStatistics } from "./AttendanceBar"
import AttendanceModal, { AttendanceRecord } from "./AttendanceModal"

export interface AttendanceRowProps {
    name: string
    email: string
    statistics: StaffStatistics
    attendanceRecords: AttendanceRecord[]
}

const AttendanceRow: React.FC<AttendanceRowProps> = ({
    name,
    email,
    statistics,
    attendanceRecords,
}) => {
    const [modalOpen, setModalOpen] = useState(false)

    const handleRowClick = () => {
        setModalOpen(true)
    }

    const handleCloseModal = () => {
        setModalOpen(false)
    }

    return (
        <>
            <TableRow
                onClick={handleRowClick}
                sx={{
                    cursor: "pointer",
                    "&:hover": {
                        bgcolor: "action.hover",
                    },
                    transition: "background-color 0.2s",
                }}
            >
                <TableCell>
                    <Typography variant="body1">{name}</Typography>
                </TableCell>
                <TableCell>
                    <Typography variant="body2" color="text.secondary">
                        {email}
                    </Typography>
                </TableCell>
                <TableCell>
                    <Box sx={{ width: "100%", minWidth: 200 }}>
                        <AttendanceBar statistics={statistics} />
                    </Box>
                </TableCell>
            </TableRow>

            <AttendanceModal
                open={modalOpen}
                onClose={handleCloseModal}
                name={name}
                email={email}
                attendanceRecords={attendanceRecords}
            />
        </>
    )
}

export default AttendanceRow
