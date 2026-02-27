"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import { MentorOfficeHours, MentorService } from "@/generated"
import { client } from "@/generated/client.gen"
import { authenticate, handleError } from "@/util/api-client"
import Loading from "@/components/Loading"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faSync } from "@fortawesome/free-solid-svg-icons"
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material"
import {
    DataGrid,
    GridActionsCellItem,
    GridColDef,
    GridToolbarColumnsButton,
    GridToolbarContainer,
    GridToolbarFilterButton,
} from "@mui/x-data-grid"
import dayjs from "dayjs"
import EditIcon from "@mui/icons-material/Edit"
import CloseIcon from "@mui/icons-material/Close"

type MentorResponseShape =
    | MentorOfficeHours[]
    | { data?: MentorOfficeHours[]; mentors?: MentorOfficeHours[] }

interface MentorProfile {
    mentorId: string
    name: string
    description: string
}

type MentorOfficeHoursRow = MentorOfficeHours & {
    id: string
    startTimeDisplay: string
    endTimeDisplay: string
}

type MentorProfileRow = MentorProfile & {
    id: string
}

function parseMentorOfficeHours(response: MentorResponseShape): MentorOfficeHours[] {
    if (Array.isArray(response)) return response
    if (Array.isArray(response.data)) return response.data
    if (Array.isArray(response.mentors)) return response.mentors
    return []
}

function GridToolbar({ refresh }: { refresh: () => void }) {
    return (
        <GridToolbarContainer
            sx={{ fontFamily: "Montserrat, Segoe UI, Roboto, sans-serif" }}
        >
            <GridToolbarColumnsButton
                slotProps={{
                    button: {
                        color: "inherit",
                    },
                }}
            />
            <GridToolbarFilterButton
                slotProps={{
                    button: {
                        color: "inherit",
                    },
                }}
            />
            <IconButton
                size="small"
                sx={{ marginLeft: "0.5rem" }}
                onClick={refresh}
                aria-label="Refresh mentorship data"
            >
                <FontAwesomeIcon icon={faSync} />
            </IconButton>
        </GridToolbarContainer>
    )
}

async function mentorInfoRequest<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${client.getConfig().baseUrl}${path}`, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        ...init,
    })

    let payload: unknown = null
    try {
        payload = await response.json()
    } catch {
        // no-op
    }

    if (!response.ok) {
        const authError =
            payload &&
            typeof payload === "object" &&
            "error" in payload &&
            typeof payload.error === "string" &&
            ["TokenInvalid", "TokenExpired", "NoToken"].includes(payload.error)

        if (authError) {
            authenticate()
        }

        const message =
            payload && typeof payload === "object" && "message" in payload
                ? String(payload.message)
                : `Request failed with status ${response.status}`
        throw new Error(message)
    }

    return payload as T
}

export default function MentorshipPage() {
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<"mentors" | "officeHours">(
        "mentors",
    )
    const [mentorRows, setMentorRows] = useState<MentorProfileRow[]>([])
    const [officeHoursRows, setOfficeHoursRows] = useState<MentorOfficeHoursRow[]>(
        [],
    )
    const [mentorModalOpen, setMentorModalOpen] = useState(false)
    const [editingMentorId, setEditingMentorId] = useState<string | null>(null)
    const [mentorFormName, setMentorFormName] = useState("")
    const [mentorFormDescription, setMentorFormDescription] = useState("")
    const [savingMentor, setSavingMentor] = useState(false)
    const [officeHoursModalOpen, setOfficeHoursModalOpen] = useState(false)
    const [editingOfficeHoursId, setEditingOfficeHoursId] = useState<string | null>(
        null,
    )
    const [officeHoursFormMentorName, setOfficeHoursFormMentorName] = useState("")
    const [officeHoursFormLocation, setOfficeHoursFormLocation] = useState("")
    const [officeHoursFormStartTime, setOfficeHoursFormStartTime] = useState("")
    const [officeHoursFormEndTime, setOfficeHoursFormEndTime] = useState("")
    const [savingOfficeHours, setSavingOfficeHours] = useState(false)

    const refreshMentors = useCallback(async () => {
        const mentors = await mentorInfoRequest<MentorProfile[]>("/mentor/info/")
        const rows = mentors
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
            .map((mentor) => ({ ...mentor, id: mentor.mentorId }))
        setMentorRows(rows)
    }, [])

    const refreshOfficeHours = useCallback(async () => {
        const officeHours = await MentorService.getMentor()
            .then(handleError)
            .then((response) =>
                parseMentorOfficeHours(response as MentorResponseShape),
            )

        const rows = officeHours
            .slice()
            .sort((a, b) => a.startTime - b.startTime)
            .map((mentor) => ({
                ...mentor,
                id: mentor.mentorId,
                startTimeDisplay: dayjs
                    .unix(mentor.startTime)
                    .format("MMM D, YYYY h:mm A"),
                endTimeDisplay: dayjs
                    .unix(mentor.endTime)
                    .format("MMM D, YYYY h:mm A"),
            }))

        setOfficeHoursRows(rows)
    }, [])

    const refresh = useCallback(async () => {
        try {
            setLoading(true)
            if (activeTab === "mentors") {
                await refreshMentors()
            } else {
                await refreshOfficeHours()
            }
        } finally {
            setLoading(false)
        }
    }, [activeTab, refreshMentors, refreshOfficeHours])

    useEffect(() => {
        refresh()
    }, [refresh])

    const openCreateMentorModal = useCallback(() => {
        setEditingMentorId(null)
        setMentorFormName("")
        setMentorFormDescription("")
        setMentorModalOpen(true)
    }, [])

    const openEditMentorModal = useCallback((mentor: MentorProfileRow) => {
        setEditingMentorId(mentor.mentorId)
        setMentorFormName(mentor.name)
        setMentorFormDescription(mentor.description)
        setMentorModalOpen(true)
    }, [])

    const closeMentorModal = useCallback(() => {
        if (savingMentor) return
        setMentorModalOpen(false)
    }, [savingMentor])

    const handleSaveMentor = useCallback(async () => {
        const name = mentorFormName.trim()
        const description = mentorFormDescription.trim()

        if (!name) {
            alert("Mentor name is required.")
            return
        }

        setSavingMentor(true)
        try {
            if (editingMentorId) {
                await mentorInfoRequest(`/mentor/info/${editingMentorId}/`, {
                    method: "PUT",
                    body: JSON.stringify({ name, description }),
                })
            } else {
                await mentorInfoRequest("/mentor/info/", {
                    method: "POST",
                    body: JSON.stringify({ name, description }),
                })
            }
            await refreshMentors()
            setMentorModalOpen(false)
        } finally {
            setSavingMentor(false)
        }
    }, [editingMentorId, mentorFormDescription, mentorFormName, refreshMentors])

    const handleDeleteMentor = useCallback(async (mentor: MentorProfileRow) => {
        const confirmed = confirm(`Delete mentor "${mentor.name}"?`)
        if (!confirmed) return

        await mentorInfoRequest(`/mentor/info/${mentor.mentorId}/`, {
            method: "DELETE",
        })
        await refreshMentors()
    }, [refreshMentors])

    const openCreateOfficeHoursModal = useCallback(() => {
        setEditingOfficeHoursId(null)
        setOfficeHoursFormMentorName("")
        setOfficeHoursFormLocation("")
        setOfficeHoursFormStartTime("")
        setOfficeHoursFormEndTime("")
        setOfficeHoursModalOpen(true)
    }, [])

    const openEditOfficeHoursModal = useCallback((row: MentorOfficeHoursRow) => {
        setEditingOfficeHoursId(row.mentorId)
        setOfficeHoursFormMentorName(row.mentorName)
        setOfficeHoursFormLocation(row.location)
        setOfficeHoursFormStartTime(row.startTime.toString())
        setOfficeHoursFormEndTime(row.endTime.toString())
        setOfficeHoursModalOpen(true)
    }, [])

    const closeOfficeHoursModal = useCallback(() => {
        if (savingOfficeHours) return
        setOfficeHoursModalOpen(false)
    }, [savingOfficeHours])

    const handleSaveOfficeHours = useCallback(async () => {
        const mentorName = officeHoursFormMentorName.trim()
        const location = officeHoursFormLocation.trim()
        const startTime = Number(officeHoursFormStartTime.trim())
        const endTime = Number(officeHoursFormEndTime.trim())

        if (!mentorName) {
            alert("Mentor name is required.")
            return
        }
        if (!location) {
            alert("Location is required.")
            return
        }
        if (!Number.isFinite(startTime)) {
            alert("Start time must be a valid Unix timestamp in seconds.")
            return
        }
        if (!Number.isFinite(endTime)) {
            alert("End time must be a valid Unix timestamp in seconds.")
            return
        }

        setSavingOfficeHours(true)
        try {
            if (editingOfficeHoursId) {
                await mentorInfoRequest(`/mentor/${editingOfficeHoursId}/`, {
                    method: "PUT",
                    body: JSON.stringify({
                        mentorName,
                        location,
                        startTime: Math.floor(startTime),
                        endTime: Math.floor(endTime),
                    }),
                })
            } else {
                await MentorService.postMentor({
                    body: {
                        mentorName,
                        location,
                        startTime: Math.floor(startTime),
                        endTime: Math.floor(endTime),
                    },
                }).then(handleError)
            }
            await refreshOfficeHours()
            setOfficeHoursModalOpen(false)
        } finally {
            setSavingOfficeHours(false)
        }
    }, [
        editingOfficeHoursId,
        officeHoursFormEndTime,
        officeHoursFormLocation,
        officeHoursFormMentorName,
        officeHoursFormStartTime,
        refreshOfficeHours,
    ])

    const handleDeleteOfficeHours = useCallback(
        async (row: MentorOfficeHoursRow) => {
            const confirmed = confirm(
                `Delete office hours for "${row.mentorName}" at "${row.location}"?`,
            )
            if (!confirmed) return

            await MentorService.deleteMentorById({
                path: { id: row.mentorId },
            }).then(handleError)

            await refreshOfficeHours()
        },
        [refreshOfficeHours],
    )

    const mentorColumns = useMemo<GridColDef<MentorProfileRow>[]>(
        () => [
            {
                field: "name",
                headerName: "Name",
                minWidth: 220,
                flex: 1,
            },
            {
                field: "description",
                headerName: "Description",
                minWidth: 420,
                flex: 2,
            },
            {
                field: "actions",
                type: "actions",
                headerName: "",
                width: 120,
                getActions: ({ row }) => [
                    <GridActionsCellItem
                        key={`${row.id}-edit`}
                        icon={<EditIcon />}
                        label="Edit mentor"
                        onClick={() => openEditMentorModal(row)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        key={`${row.id}-delete`}
                        icon={<CloseIcon />}
                        label="Delete mentor"
                        onClick={() => handleDeleteMentor(row)}
                        color="inherit"
                    />,
                ],
            },
        ],
        [handleDeleteMentor, openEditMentorModal],
    )

    const officeHoursColumns = useMemo<GridColDef<MentorOfficeHoursRow>[]>(
        () => [
            {
                field: "mentorName",
                headerName: "Mentor",
                minWidth: 220,
                flex: 1,
            },
            {
                field: "location",
                headerName: "Location",
                minWidth: 160,
                flex: 1,
            },
            {
                field: "startTimeDisplay",
                headerName: "Start Time",
                minWidth: 220,
                flex: 1,
            },
            {
                field: "endTimeDisplay",
                headerName: "End Time",
                minWidth: 220,
                flex: 1,
            },
            {
                field: "actions",
                type: "actions",
                headerName: "",
                width: 120,
                getActions: ({ row }) => [
                    <GridActionsCellItem
                        key={`${row.id}-edit`}
                        icon={<EditIcon />}
                        label="Edit office hours"
                        onClick={() => openEditOfficeHoursModal(row)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        key={`${row.id}-delete`}
                        icon={<CloseIcon />}
                        label="Delete office hours"
                        onClick={() => handleDeleteOfficeHours(row)}
                        color="inherit"
                    />,
                ],
            },
        ],
        [handleDeleteOfficeHours, openEditOfficeHoursModal],
    )

    if (loading) {
        return <Loading />
    }

    return (
        <div style={{ padding: "1.5rem" }}>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
            >
                <Tabs
                    value={activeTab === "mentors" ? 0 : 1}
                    onChange={(_, idx) =>
                        setActiveTab(idx === 0 ? "mentors" : "officeHours")
                    }
                >
                    <Tab label="Mentors" />
                    <Tab label="Office Hours" />
                </Tabs>

                <Box display="flex" gap={1}>
                    {activeTab === "mentors" && (
                        <IconButton
                            onClick={openCreateMentorModal}
                            aria-label="Create mentor"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                        </IconButton>
                    )}
                    {activeTab === "officeHours" && (
                        <IconButton
                            onClick={openCreateOfficeHoursModal}
                            aria-label="Create office hours"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                        </IconButton>
                    )}
                    <IconButton
                        onClick={refresh}
                        aria-label="Refresh mentorship data"
                    >
                        <FontAwesomeIcon icon={faSync} />
                    </IconButton>
                </Box>
            </Box>

            {activeTab === "mentors" ? (
                <DataGrid
                    autoHeight
                    rows={mentorRows}
                    columns={mentorColumns}
                    sx={{ fontFamily: "Montserrat" }}
                    slots={{
                        toolbar: () => <GridToolbar refresh={refresh} />,
                    }}
                />
            ) : (
                <DataGrid
                    autoHeight
                    rows={officeHoursRows}
                    columns={officeHoursColumns}
                    sx={{ fontFamily: "Montserrat" }}
                    slots={{
                        toolbar: () => <GridToolbar refresh={refresh} />,
                    }}
                />
            )}

            <Dialog
                open={mentorModalOpen}
                onClose={closeMentorModal}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {editingMentorId ? "Edit Mentor" : "Create Mentor"}
                </DialogTitle>
                <DialogContent>
                    {editingMentorId && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ marginTop: 1, marginBottom: 2 }}
                        >
                            Mentor ID: {editingMentorId}
                        </Typography>
                    )}
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Name"
                        fullWidth
                        value={mentorFormName}
                        onChange={(e) => setMentorFormName(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        minRows={4}
                        value={mentorFormDescription}
                        onChange={(e) =>
                            setMentorFormDescription(e.target.value)
                        }
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeMentorModal} disabled={savingMentor}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveMentor}
                        variant="contained"
                        disabled={savingMentor}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={officeHoursModalOpen}
                onClose={closeOfficeHoursModal}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {editingOfficeHoursId
                        ? "Edit Mentor Office Hours"
                        : "Create Mentor Office Hours"}
                </DialogTitle>
                <DialogContent>
                    {editingOfficeHoursId && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ marginTop: 1, marginBottom: 2 }}
                        >
                            Mentor ID: {editingOfficeHoursId}
                        </Typography>
                    )}
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Mentor Name"
                        fullWidth
                        value={officeHoursFormMentorName}
                        onChange={(e) =>
                            setOfficeHoursFormMentorName(e.target.value)
                        }
                    />
                    <TextField
                        margin="dense"
                        label="Location"
                        fullWidth
                        value={officeHoursFormLocation}
                        onChange={(e) =>
                            setOfficeHoursFormLocation(e.target.value)
                        }
                    />
                    <TextField
                        margin="dense"
                        label="Start Time (Unix seconds)"
                        fullWidth
                        value={officeHoursFormStartTime}
                        onChange={(e) =>
                            setOfficeHoursFormStartTime(e.target.value)
                        }
                    />
                    <TextField
                        margin="dense"
                        label="End Time (Unix seconds)"
                        fullWidth
                        value={officeHoursFormEndTime}
                        onChange={(e) =>
                            setOfficeHoursFormEndTime(e.target.value)
                        }
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={closeOfficeHoursModal}
                        disabled={savingOfficeHours}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveOfficeHours}
                        variant="contained"
                        disabled={savingOfficeHours}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}
