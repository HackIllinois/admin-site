"use client"

import React, { useState, useEffect, useCallback } from "react"
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
    IconButton,
    Snackbar,
    Alert,
} from "@mui/material"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { Refresh as RefreshIcon } from "@mui/icons-material"
import AttendanceRow from "./AttendanceRow"
import { AttendanceRecord } from "./AttendanceModal"
import { StaffStatistics } from "./AttendanceBar"
import {
    getAllStaffUsers,
    getAllMandatoryEvents,
    getUserAttendanceRecords,
    calculateAttendanceStatistics,
    preloadEventNames,
    isActiveStaffMember,
    type UserInfo,
} from "../lib/api/attendance"

const theme = createTheme({
    typography: {
        fontFamily: "Montserrat, Arial, sans-serif",
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
    const [teamFilter, setTeamFilter] = useState<string>("all")
    const [teams, setTeams] = useState<string[]>(["all"])
    const [error, setError] = useState<string | null>(null)
    const [errorOpen, setErrorOpen] = useState(false)

    const fetchAttendanceData = useCallback(async () => {
        setLoading(true)
        try {
            // Fetch mandatory events once for all users
            const mandatoryEvents = await getAllMandatoryEvents()

            // Preload event names using the already-fetched events
            await preloadEventNames(mandatoryEvents)

            const users = await getAllStaffUsers()

            // Filter for active members only
            const activeUsers = users.filter((user) =>
                isActiveStaffMember(user.email),
            )

            const attendancePromises = activeUsers.map(async (user) => {
                const records = await getUserAttendanceRecords(
                    user.userId,
                    mandatoryEvents,
                )
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

            attendanceData.sort((a, b) =>
                a.user.name.localeCompare(b.user.name),
            )

            setAttendances(attendanceData)

            const uniqueTeams = Array.from(
                new Set(
                    activeUsers
                        .map((u) => u.teamId)
                        .filter((id): id is string => Boolean(id)),
                ),
            )
            setTeams(["all", ...uniqueTeams])
        } catch (error) {
            console.error("Error fetching attendance data:", error)
            setError("Failed to load attendance data. Please try again.")
            setErrorOpen(true)
        } finally {
            setLoading(false)
        }
    }, [])

    const handleCloseError = () => {
        setErrorOpen(false)
        setTimeout(() => setError(null), 400)
    }

    useEffect(() => {
        fetchAttendanceData()
    }, [fetchAttendanceData])

    const filteredAttendances =
        teamFilter === "all"
            ? attendances
            : attendances.filter((a) => a.user.teamId === teamFilter)

    const handleTeamChange = (
        _event: React.MouseEvent<HTMLElement>,
        newTeam: string | null,
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
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={2}
                >
                    <Typography variant="h4" gutterBottom>
                        Attendance
                    </Typography>
                    <IconButton
                        onClick={fetchAttendanceData}
                        disabled={loading}
                    >
                        <RefreshIcon />
                    </IconButton>
                </Box>

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
                                aria-label={team === "all" ? "all teams" : team}
                            >
                                {team === "all" ? "All Teams" : team}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Box>

                <TableContainer
                    component={Paper}
                    sx={{ maxHeight: "calc(100vh - 250px)" }}
                >
                    <Table stickyHeader>
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
                                        statistics={attendance.statistics}
                                        attendanceRecords={attendance.records}
                                    />
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <Snackbar
                open={errorOpen}
                autoHideDuration={6000}
                onClose={handleCloseError}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={handleCloseError}
                    severity="error"
                    sx={{ width: "100%" }}
                >
                    {error}
                </Alert>
            </Snackbar>
        </ThemeProvider>
    )
}
