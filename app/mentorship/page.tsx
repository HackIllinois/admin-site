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
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
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
import EditIcon from "@mui/icons-material/Edit"
import CloseIcon from "@mui/icons-material/Close"

type MentorResponseShape =
    | MentorOfficeHours[]
    | { data?: MentorOfficeHours[]; mentors?: MentorOfficeHours[] }

interface MentorProfile {
    mentorId: string
    name: string
    description: string
    imageUrl: string
}

interface JudgeProfile {
    _id: string
    name: string
    description: string
    imageUrl: string
}

type MentorOfficeHoursRow = MentorOfficeHours & {
    id: string
    startTimeDisplay: string
    endTimeDisplay: string
}

type MentorProfileRow = MentorProfile & {
    id: string
}

type JudgeProfileRow = JudgeProfile & {
    id: string
}

const DEFAULT_MENTOR_IMAGE_URL =
    "https://raw.githubusercontent.com/HackIllinois/mobile/refs/heads/main/assets/point-shop/point-shop-shopkeeper-2.png"

function formatChicagoEpoch(value: number): string {
    const epochMs = value < 1_000_000_000_000 ? value * 1000 : value
    return new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Chicago",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    }).format(new Date(epochMs))
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
    const [activeTab, setActiveTab] = useState<"mentors" | "officeHours" | "judges">(
        "judges",
    )
    const [mentorRows, setMentorRows] = useState<MentorProfileRow[]>([])
    const [judgeRows, setJudgeRows] = useState<JudgeProfileRow[]>([])
    const [officeHoursRows, setOfficeHoursRows] = useState<MentorOfficeHoursRow[]>(
        [],
    )
    const [mentorModalOpen, setMentorModalOpen] = useState(false)
    const [editingMentorId, setEditingMentorId] = useState<string | null>(null)
    const [mentorFormName, setMentorFormName] = useState("")
    const [mentorFormDescription, setMentorFormDescription] = useState("")
    const [mentorFormImageUrl, setMentorFormImageUrl] = useState(
        DEFAULT_MENTOR_IMAGE_URL,
    )
    const [savingMentor, setSavingMentor] = useState(false)
    const [mentorDetailsOpen, setMentorDetailsOpen] = useState(false)
    const [selectedMentor, setSelectedMentor] = useState<MentorProfileRow | null>(
        null,
    )
    const [judgeModalOpen, setJudgeModalOpen] = useState(false)
    const [editingJudgeId, setEditingJudgeId] = useState<string | null>(null)
    const [judgeFormName, setJudgeFormName] = useState("")
    const [judgeFormDescription, setJudgeFormDescription] = useState("")
    const [judgeFormImageUrl, setJudgeFormImageUrl] = useState(
        DEFAULT_MENTOR_IMAGE_URL,
    )
    const [savingJudge, setSavingJudge] = useState(false)
    const [judgeDetailsOpen, setJudgeDetailsOpen] = useState(false)
    const [selectedJudge, setSelectedJudge] = useState<JudgeProfileRow | null>(
        null,
    )
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
            .map((mentor) => ({
                ...mentor,
                imageUrl: mentor.imageUrl || DEFAULT_MENTOR_IMAGE_URL,
                id: mentor.mentorId,
            }))
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
                startTimeDisplay: formatChicagoEpoch(mentor.startTime),
                endTimeDisplay: formatChicagoEpoch(mentor.endTime),
            }))

        setOfficeHoursRows(rows)
    }, [])

    const refreshJudges = useCallback(async () => {
        const judges = await mentorInfoRequest<JudgeProfile[]>("/judge/info/")
        const rows = judges
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
            .map((judge) => ({
                ...judge,
                imageUrl: judge.imageUrl || DEFAULT_MENTOR_IMAGE_URL,
                id: judge._id,
            }))
        setJudgeRows(rows)
    }, [])

    const refresh = useCallback(async () => {
        try {
            setLoading(true)
            if (activeTab === "mentors") {
                await refreshMentors()
            } else if (activeTab === "judges") {
                await refreshJudges()
            } else {
                await Promise.all([refreshOfficeHours(), refreshMentors()])
            }
        } finally {
            setLoading(false)
        }
    }, [activeTab, refreshJudges, refreshMentors, refreshOfficeHours])

    useEffect(() => {
        refresh()
    }, [refresh])

    const openCreateMentorModal = useCallback(() => {
        setEditingMentorId(null)
        setMentorFormName("")
        setMentorFormDescription("")
        setMentorFormImageUrl(DEFAULT_MENTOR_IMAGE_URL)
        setMentorModalOpen(true)
    }, [])

    const openEditMentorModal = useCallback((mentor: MentorProfileRow) => {
        setEditingMentorId(mentor.mentorId)
        setMentorFormName(mentor.name)
        setMentorFormDescription(mentor.description)
        setMentorFormImageUrl(mentor.imageUrl || DEFAULT_MENTOR_IMAGE_URL)
        setMentorModalOpen(true)
    }, [])

    const closeMentorModal = useCallback(() => {
        if (savingMentor) return
        setMentorModalOpen(false)
    }, [savingMentor])

    const handleSaveMentor = useCallback(async () => {
        const name = mentorFormName.trim()
        const description = mentorFormDescription.trim()
        const imageUrl = mentorFormImageUrl.trim() || DEFAULT_MENTOR_IMAGE_URL

        if (!name) {
            alert("Mentor name is required.")
            return
        }
        try {
            new URL(imageUrl)
        } catch {
            alert("Image URL must be a valid URL.")
            return
        }

        setSavingMentor(true)
        try {
            if (editingMentorId) {
                await mentorInfoRequest(`/mentor/info/${editingMentorId}/`, {
                    method: "PUT",
                    body: JSON.stringify({ name, description, imageUrl }),
                })
            } else {
                await mentorInfoRequest("/mentor/info/", {
                    method: "POST",
                    body: JSON.stringify({ name, description, imageUrl }),
                })
            }
            await refreshMentors()
            setMentorModalOpen(false)
        } finally {
            setSavingMentor(false)
        }
    }, [
        editingMentorId,
        mentorFormDescription,
        mentorFormImageUrl,
        mentorFormName,
        refreshMentors,
    ])

    const handleDeleteMentor = useCallback(async (mentor: MentorProfileRow) => {
        const confirmed = confirm(`Delete mentor "${mentor.name}"?`)
        if (!confirmed) return

        await mentorInfoRequest(`/mentor/info/${mentor.mentorId}/`, {
            method: "DELETE",
        })
        await refreshMentors()
    }, [refreshMentors])

    const openMentorDetails = useCallback((mentor: MentorProfileRow) => {
        setSelectedMentor(mentor)
        setMentorDetailsOpen(true)
    }, [])

    const closeMentorDetails = useCallback(() => {
        setMentorDetailsOpen(false)
    }, [])

    const openCreateJudgeModal = useCallback(() => {
        setEditingJudgeId(null)
        setJudgeFormName("")
        setJudgeFormDescription("")
        setJudgeFormImageUrl(DEFAULT_MENTOR_IMAGE_URL)
        setJudgeModalOpen(true)
    }, [])

    const openEditJudgeModal = useCallback((judge: JudgeProfileRow) => {
        setEditingJudgeId(judge._id)
        setJudgeFormName(judge.name)
        setJudgeFormDescription(judge.description)
        setJudgeFormImageUrl(judge.imageUrl || DEFAULT_MENTOR_IMAGE_URL)
        setJudgeModalOpen(true)
    }, [])

    const closeJudgeModal = useCallback(() => {
        if (savingJudge) return
        setJudgeModalOpen(false)
    }, [savingJudge])

    const handleSaveJudge = useCallback(async () => {
        const name = judgeFormName.trim()
        const description = judgeFormDescription.trim()
        const imageUrl = judgeFormImageUrl.trim() || DEFAULT_MENTOR_IMAGE_URL

        if (!name) {
            alert("Judge name is required.")
            return
        }
        try {
            new URL(imageUrl)
        } catch {
            alert("Image URL must be a valid URL.")
            return
        }

        setSavingJudge(true)
        try {
            if (editingJudgeId) {
                await mentorInfoRequest(`/judge/info/${editingJudgeId}/`, {
                    method: "PUT",
                    body: JSON.stringify({ name, description, imageUrl }),
                })
            } else {
                await mentorInfoRequest("/judge/info/", {
                    method: "POST",
                    body: JSON.stringify({ name, description, imageUrl }),
                })
            }
            await refreshJudges()
            setJudgeModalOpen(false)
        } finally {
            setSavingJudge(false)
        }
    }, [
        editingJudgeId,
        judgeFormDescription,
        judgeFormImageUrl,
        judgeFormName,
        refreshJudges,
    ])

    const handleDeleteJudge = useCallback(async (judge: JudgeProfileRow) => {
        const confirmed = confirm(`Delete judge "${judge.name}"?`)
        if (!confirmed) return

        await mentorInfoRequest(`/judge/info/${judge._id}/`, {
            method: "DELETE",
        })
        await refreshJudges()
    }, [refreshJudges])

    const openJudgeDetails = useCallback((judge: JudgeProfileRow) => {
        setSelectedJudge(judge)
        setJudgeDetailsOpen(true)
    }, [])

    const closeJudgeDetails = useCallback(() => {
        setJudgeDetailsOpen(false)
    }, [])

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
            alert("Mentor is required.")
            return
        }
        if (!mentorRows.some((mentor) => mentor.name === mentorName)) {
            alert("Please select an existing mentor.")
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
        mentorRows,
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
                field: "imageUrl",
                headerName: "Avatar",
                width: 90,
                sortable: false,
                filterable: false,
                renderCell: ({ row }) => (
                    <Box
                        component="img"
                        src={row.imageUrl || DEFAULT_MENTOR_IMAGE_URL}
                        alt={`${row.name} avatar`}
                        onError={(event: React.SyntheticEvent<HTMLImageElement>) => {
                            event.currentTarget.src = DEFAULT_MENTOR_IMAGE_URL
                        }}
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "1px solid #ddd",
                        }}
                    />
                ),
            },
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

    const judgeColumns = useMemo<GridColDef<JudgeProfileRow>[]>(
        () => [
            {
                field: "imageUrl",
                headerName: "Avatar",
                width: 90,
                sortable: false,
                filterable: false,
                renderCell: ({ row }) => (
                    <Box
                        component="img"
                        src={row.imageUrl || DEFAULT_MENTOR_IMAGE_URL}
                        alt={`${row.name} avatar`}
                        onError={(event: React.SyntheticEvent<HTMLImageElement>) => {
                            event.currentTarget.src = DEFAULT_MENTOR_IMAGE_URL
                        }}
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "1px solid #ddd",
                        }}
                    />
                ),
            },
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
                        label="Edit judge"
                        onClick={() => openEditJudgeModal(row)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        key={`${row.id}-delete`}
                        icon={<CloseIcon />}
                        label="Delete judge"
                        onClick={() => handleDeleteJudge(row)}
                        color="inherit"
                    />,
                ],
            },
        ],
        [handleDeleteJudge, openEditJudgeModal],
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
                    value={activeTab === "judges" ? 0 : activeTab === "mentors" ? 1 : 2}
                    onChange={(_, idx) =>
                        setActiveTab(
                            idx === 0
                                ? "judges"
                                : idx === 1
                                ? "mentors"
                                : "officeHours",
                        )
                    }
                >
                    <Tab label="Judges" />
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
                    {activeTab === "judges" && (
                        <IconButton
                            onClick={openCreateJudgeModal}
                            aria-label="Create judge"
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

            {activeTab === "judges" ? (
                <DataGrid
                    autoHeight
                    rows={judgeRows}
                    columns={judgeColumns}
                    sx={{ fontFamily: "Montserrat" }}
                    onCellClick={(params) => {
                        if (params.field === "actions") return
                        openJudgeDetails(params.row as JudgeProfileRow)
                    }}
                    slots={{
                        toolbar: () => <GridToolbar refresh={refresh} />,
                    }}
                />
            ) : activeTab === "mentors" ? (
                <DataGrid
                    autoHeight
                    rows={mentorRows}
                    columns={mentorColumns}
                    sx={{ fontFamily: "Montserrat" }}
                    onCellClick={(params) => {
                        if (params.field === "actions") return
                        openMentorDetails(params.row as MentorProfileRow)
                    }}
                    slots={{
                        toolbar: () => <GridToolbar refresh={refresh} />,
                    }}
                />
            ) : activeTab === "officeHours" ? (
                <DataGrid
                    autoHeight
                    rows={officeHoursRows}
                    columns={officeHoursColumns}
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
                    <TextField
                        margin="dense"
                        label="Image URL"
                        fullWidth
                        value={mentorFormImageUrl}
                        onChange={(e) => setMentorFormImageUrl(e.target.value)}
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
                open={mentorDetailsOpen}
                onClose={closeMentorDetails}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Mentor Profile</DialogTitle>
                <DialogContent>
                    {selectedMentor && (
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 2,
                                pt: 1,
                            }}
                        >
                            <Box
                                component="img"
                                src={
                                    selectedMentor.imageUrl ||
                                    DEFAULT_MENTOR_IMAGE_URL
                                }
                                alt={`${selectedMentor.name} profile`}
                                onError={(
                                    event: React.SyntheticEvent<HTMLImageElement>,
                                ) => {
                                    event.currentTarget.src =
                                        DEFAULT_MENTOR_IMAGE_URL
                                }}
                                sx={{
                                    width: 180,
                                    height: 180,
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    border: "1px solid #ddd",
                                }}
                            />
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 600, textAlign: "center" }}
                            >
                                {selectedMentor.name}
                            </Typography>
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ width: "100%", whiteSpace: "pre-wrap" }}
                            >
                                {selectedMentor.description}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeMentorDetails}>Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={judgeModalOpen}
                onClose={closeJudgeModal}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {editingJudgeId ? "Edit Judge" : "Create Judge"}
                </DialogTitle>
                <DialogContent>
                    {editingJudgeId && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ marginTop: 1, marginBottom: 2 }}
                        >
                            Judge ID: {editingJudgeId}
                        </Typography>
                    )}
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Name"
                        fullWidth
                        value={judgeFormName}
                        onChange={(e) => setJudgeFormName(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        minRows={4}
                        value={judgeFormDescription}
                        onChange={(e) => setJudgeFormDescription(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Image URL"
                        fullWidth
                        value={judgeFormImageUrl}
                        onChange={(e) => setJudgeFormImageUrl(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeJudgeModal} disabled={savingJudge}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveJudge}
                        variant="contained"
                        disabled={savingJudge}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={judgeDetailsOpen}
                onClose={closeJudgeDetails}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Judge Profile</DialogTitle>
                <DialogContent>
                    {selectedJudge && (
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 2,
                                pt: 1,
                            }}
                        >
                            <Box
                                component="img"
                                src={
                                    selectedJudge.imageUrl ||
                                    DEFAULT_MENTOR_IMAGE_URL
                                }
                                alt={`${selectedJudge.name} profile`}
                                onError={(
                                    event: React.SyntheticEvent<HTMLImageElement>,
                                ) => {
                                    event.currentTarget.src =
                                        DEFAULT_MENTOR_IMAGE_URL
                                }}
                                sx={{
                                    width: 180,
                                    height: 180,
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    border: "1px solid #ddd",
                                }}
                            />
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 600, textAlign: "center" }}
                            >
                                {selectedJudge.name}
                            </Typography>
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ width: "100%", whiteSpace: "pre-wrap" }}
                            >
                                {selectedJudge.description}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeJudgeDetails}>Close</Button>
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
                    <FormControl fullWidth margin="dense">
                        <InputLabel id="office-hours-mentor-label">
                            Mentor
                        </InputLabel>
                        <Select
                            autoFocus
                            labelId="office-hours-mentor-label"
                            label="Mentor"
                            value={officeHoursFormMentorName}
                            onChange={(e) =>
                                setOfficeHoursFormMentorName(e.target.value)
                            }
                        >
                            {mentorRows.map((mentor) => (
                                <MenuItem
                                    key={mentor.mentorId}
                                    value={mentor.name}
                                >
                                    {mentor.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
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
