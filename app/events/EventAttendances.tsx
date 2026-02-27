import { getAllStaffUsers, isActiveStaffMember } from "@/app/lib/api/attendance"
import { EventService, UserInfo } from "@/generated"
import { Cancel, CheckCircle, EventBusy } from "@mui/icons-material"
import {
    Alert,
    Box,
    CircularProgress,
    FormControl,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material"
import { useEffect, useState } from "react"

type EventAttendancesProps = {
    eventId: string
}

type StaffAttendanceStatus = {
    user: UserInfo
    status: "PRESENT" | "EXCUSED" | "ABSENT"
}

interface StatusSelectorProps {
    userId: string
    status: "PRESENT" | "EXCUSED" | "ABSENT"
    onStatusChange: (
        userId: string,
        newStatus: "PRESENT" | "EXCUSED" | "ABSENT",
    ) => void
}

const StatusSelector: React.FC<StatusSelectorProps> = ({
    userId,
    status,
    onStatusChange,
}) => {
    const handleChange = (event: SelectChangeEvent<string>) => {
        const newStatus = event.target.value as "PRESENT" | "EXCUSED" | "ABSENT"
        onStatusChange(userId, newStatus)
    }

    return (
        <FormControl size="small" sx={{
            display: 'flex',
            alignItems: "center"
        }}>
            <Select
                value={status}
                onChange={handleChange}
                sx={{
                    minWidth: 150,
                    "& .MuiSelect-select": {
                        display: "flex",
                        alignItems: "center",
                    },
                }}
            >
                <MenuItem value="PRESENT">
                    <CheckCircle
                        fontSize="small"
                        color="success"
                        sx={{ mr: 0.5, mb: 0.2 }}
                    />
                    <Typography
                    >
                        Present
                    </Typography>
                </MenuItem>
                <MenuItem value="EXCUSED">
                    <EventBusy
                        fontSize="small"
                        color="primary"
                        sx={{ mr: 0.5, mb: 0.2 }}
                    />
                    <Typography
                    >
                        Excused
                    </Typography>   
                </MenuItem>
                <MenuItem value="ABSENT">
                    <Cancel fontSize="small" color="error" 
                        sx={{ mr: 0.5, mb: 0.2 }}/>
                    <Typography
                    >
                        Absent
                    </Typography>
                </MenuItem>
            </Select>
        </FormControl>
    )
}

export default function EventAttendances({ eventId }: EventAttendancesProps) {
    const [attendances, setAttendances] = useState<StaffAttendanceStatus[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    const handleStatusChange = async (
        userId: string,
        newStatus: "PRESENT" | "EXCUSED" | "ABSENT",
    ) => {
        try {
            // TODO: Making two API calls opens possibility of partial failure (e.g., one succeeds, other fails),
            // potentially resulting in invalid data states like being both present and excused.
            // The DB should ideally store a single status enum (PRESENT/EXCUSED/ABSENT) instead.
            if (newStatus === "PRESENT") {
                // Set as present and remove excused status
                await Promise.all([
                    EventService.putEventUpdateAttendanceById({
                        path: { id: eventId },
                        body: { userId, present: true },
                    }),
                    EventService.putEventMarkExcusedById({
                        path: { id: eventId },
                        body: { userId, excused: false },
                    }),
                ])
            } else if (newStatus === "EXCUSED") {
                // Set as excused AND remove from present
                await Promise.all([
                    EventService.putEventUpdateAttendanceById({
                        path: { id: eventId },
                        body: { userId, present: false },
                    }),
                    EventService.putEventMarkExcusedById({
                        path: { id: eventId },
                        body: { userId, excused: true },
                    }),
                ])
            } else if (newStatus === "ABSENT") {
                // Set as not present and remove excused status
                await Promise.all([
                    EventService.putEventUpdateAttendanceById({
                        path: { id: eventId },
                        body: { userId, present: false },
                    }),
                    EventService.putEventMarkExcusedById({
                        path: { id: eventId },
                        body: { userId, excused: false },
                    }),
                ])
            }

            // Update local state
            setAttendances((prevAttendances) =>
                prevAttendances.map((attendance) => {
                    if (attendance.user.userId === userId) {
                        return { ...attendance, status: newStatus }
                    }
                    return attendance
                }),
            )
        } catch (err) {
            console.error("Failed to update status:", err)
            setError("Failed to update status. Please try again.")
            // Reload on error to ensure data is in sync
            await handleLoadEventAttendances()
        }
    }

    const handleLoadEventAttendances = async () => {
        setLoading(true)
        try {
            // Fetch all staff members
            const allStaff = await getAllStaffUsers()

            // Filter for active members only
            const activeStaff = allStaff.filter((user) =>
                isActiveStaffMember(user.email),
            )

            // Fetch event attendees and excused list
            const eventData = await EventService.getEventAttendeesById({
                path: { id: eventId },
            })

            const attendeeIds = new Set(eventData.data?.attendees || [])
            const excusedIds = new Set(eventData.data?.excusedAttendees || [])

            // Map all active staff to their attendance status
            // Priority: PRESENT > EXCUSED > ABSENT (if someone checked in, they're present regardless of excused status)
            const staffWithStatus: StaffAttendanceStatus[] = activeStaff.map(
                (user) => {
                    let status: "PRESENT" | "EXCUSED" | "ABSENT" = "ABSENT"

                    if (attendeeIds.has(user.userId)) {
                        status = "PRESENT"
                    } else if (excusedIds.has(user.userId)) {
                        status = "EXCUSED"
                    }

                    return { user, status }
                },
            )

            // Sort by name
            staffWithStatus.sort((a, b) =>
                a.user.name.localeCompare(b.user.name),
            )

            setAttendances(staffWithStatus)
        } catch (err) {
            console.error("Failed to load event attendances:", err)
            setError("Failed to load attendance data. Please try again.")
            setAttendances([])
        } finally {
            setLoading(false)
        }
    }

    const handleCloseError = () => {
        setError(null)
    }

    useEffect(() => {
        handleLoadEventAttendances()
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <Typography
                variant="body1"
                align="center"
                color="textSecondary"
                p={2}
            >
                No staff members found.
            </Typography>
        )
    }

    const filteredAttendances = attendances.filter(({ user, status }) => {
        const query = searchQuery.trim().toLowerCase()
        if (!query) return true
        return (
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            status.toLowerCase().includes(query)
        )
    })

    return (
        <>
            <TextField
                label="Search name/email/status"
                size="small"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                sx={{ mb: 1, minWidth: 320, maxWidth: 480 }}
            />
            <TableContainer
                component={Paper}
                sx={{
                    marginBottom: 2,
                    maxHeight: "calc(100vh - 300px)",
                    overflow: "auto",
                }}
            >
                <Table stickyHeader aria-label="Event Attendance">
                <TableHead>
                    <TableRow>
                        <TableCell
                            sx={{
                                fontFamily:
                                    "Montserrat, Segoe UI, Roboto, sans-serif",
                                fontWeight: "bold",
                            }}
                        >
                            Name
                        </TableCell>
                        <TableCell
                            sx={{
                                fontFamily:
                                    "Montserrat, Segoe UI, Roboto, sans-serif",
                                fontWeight: "bold",
                            }}
                        >
                            Email
                        </TableCell>
                        <TableCell
                            sx={{
                                fontFamily:
                                    "Montserrat, Segoe UI, Roboto, sans-serif",
                                fontWeight: "bold",
                            }}
                        >
                            Status
                        </TableCell>
                    </TableRow>
                </TableHead>
                    <TableBody>
                    {filteredAttendances.map(({ user, status }) => (
                        <TableRow key={user.userId}>
                            <TableCell
                                sx={{
                                    fontFamily:
                                        "Montserrat, Segoe UI, Roboto, sans-serif",
                                }}
                            >
                                {user.name}
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontFamily:
                                        "Montserrat, Segoe UI, Roboto, sans-serif",
                                }}
                            >
                                {user.email}
                            </TableCell>
                            <TableCell>
                                <StatusSelector
                                    userId={user.userId}
                                    status={status}
                                    onStatusChange={handleStatusChange}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>

                <Snackbar
                    open={error !== null}
                    autoHideDuration={6000}
                    onClose={handleCloseError}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                >
                    <Alert
                        onClose={handleCloseError}
                        severity="error"
                        sx={{ width: "100%" }}
                    >
                        {error}
                    </Alert>
                </Snackbar>
            </TableContainer>
        </>
    )
}
