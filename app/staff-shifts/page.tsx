"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import Loading from "@/components/Loading"
import Unauthorized from "@/components/Unauthorized/Unauthorized"
import { Event, EventService, StaffService } from "@/generated"
import { authenticate, handleError, useRoles } from "@/util/api-client"
import { client } from "@/generated/client.gen"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus, faSync } from "@fortawesome/free-solid-svg-icons"
import {
    Autocomplete,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import LinkIcon from "@mui/icons-material/Link"
import LinkOffIcon from "@mui/icons-material/LinkOff"
import {
    DataGrid,
    GridActionsCellItem,
    GridColDef,
    GridToolbarColumnsButton,
    GridToolbarContainer,
    GridToolbarFilterButton,
} from "@mui/x-data-grid"

type TabValue = "shifts" | "assignments" | "bulkAssignments" | "staffInfo"

type ShiftRow = Event & {
    id: string
    locationDisplay: string
    startDisplay: string
    endDisplay: string
}

type StaffUser = {
    userId: string
    displayName: string
    staffEmail: string
}

type ShiftCandidateUser = {
    userId: string
    name: string
    email: string
}

type StaffInfoRow = {
    id: string
    staffId: string
    userId: string
    firstName: string
    lastName: string
    title: string
    team?: string
    email: string
    staffEmail: string
    school: string
    major: string
    education: string
    graduate: string
    isActive?: boolean
}

type ShiftAssignment = {
    userId: string
    shifts: string[]
}

type ShiftAssignmentRow = ShiftRow & {
    assignedCount: number
    assignedUsersDisplay: string
    selectedAssigned: boolean
}

type BulkStaffOption = {
    userId: string
    label: string
}

function formatChicagoTime(epochSeconds: number): string {
    return new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Chicago",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(new Date(epochSeconds * 1000))
}

function unixToDateTimeLocal(epochSeconds: number): string {
    const local = new Date(epochSeconds * 1000)
    const tzOffsetMs = local.getTimezoneOffset() * 60_000
    return new Date(local.getTime() - tzOffsetMs).toISOString().slice(0, 16)
}

function dateTimeLocalToUnix(value: string): number {
    return Math.floor(new Date(value).getTime() / 1000)
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
                aria-label="Refresh staff shifts"
            >
                <FontAwesomeIcon icon={faSync} />
            </IconButton>
        </GridToolbarContainer>
    )
}

export default function StaffShiftsPage() {
    const roles = useRoles()

    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<TabValue>("shifts")

    const [shiftRows, setShiftRows] = useState<ShiftRow[]>([])
    const [staffUsers, setStaffUsers] = useState<StaffUser[]>([])
    const [staffInfoRows, setStaffInfoRows] = useState<StaffInfoRow[]>([])
    const [shiftAssignments, setShiftAssignments] = useState<ShiftAssignment[]>([])

    const [shiftModalOpen, setShiftModalOpen] = useState(false)
    const [editingShiftId, setEditingShiftId] = useState<string | null>(null)
    const [shiftName, setShiftName] = useState("")
    const [shiftDescription, setShiftDescription] = useState("")
    const [shiftLocation, setShiftLocation] = useState("")
    const [shiftStartLocal, setShiftStartLocal] = useState("")
    const [shiftEndLocal, setShiftEndLocal] = useState("")
    const [savingShift, setSavingShift] = useState(false)

    const [selectedStaffUserId, setSelectedStaffUserId] = useState("")
    const [savingAssignment, setSavingAssignment] = useState(false)
    const [selectedBulkShiftId, setSelectedBulkShiftId] = useState("")
    const [bulkSelectedUserIds, setBulkSelectedUserIds] = useState<string[]>([])
    const [bulkBaseUserIds, setBulkBaseUserIds] = useState<string[]>([])
    const [savingBulkAssignment, setSavingBulkAssignment] = useState(false)

    const [staffInfoModalOpen, setStaffInfoModalOpen] = useState(false)
    const [editingStaffInfoId, setEditingStaffInfoId] = useState<string | null>(null)
    const [staffInfoFirstName, setStaffInfoFirstName] = useState("")
    const [staffInfoLastName, setStaffInfoLastName] = useState("")
    const [staffInfoTitle, setStaffInfoTitle] = useState("")
    const [staffInfoTeam, setStaffInfoTeam] = useState("")
    const [staffInfoEmail, setStaffInfoEmail] = useState("")
    const [staffInfoStaffEmail, setStaffInfoStaffEmail] = useState("")
    const [staffInfoSchool, setStaffInfoSchool] = useState("")
    const [staffInfoMajor, setStaffInfoMajor] = useState("")
    const [staffInfoEducation, setStaffInfoEducation] = useState("")
    const [staffInfoGraduate, setStaffInfoGraduate] = useState("")
    const [staffInfoIsActive, setStaffInfoIsActive] = useState(true)
    const [savingStaffInfo, setSavingStaffInfo] = useState(false)

    const isAdmin = roles.includes("ADMIN")

    const apiRequest = useCallback(
        async <T,>(path: string, init?: RequestInit): Promise<T> => {
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
                    ["TokenInvalid", "TokenExpired", "NoToken"].includes(
                        payload.error,
                    )

                if (authError) {
                    authenticate()
                }

                const message =
                    payload &&
                    typeof payload === "object" &&
                    "message" in payload
                        ? String(payload.message)
                        : `Request failed with status ${response.status}`
                throw new Error(message)
            }

            return payload as T
        },
        [],
    )

    const refreshShifts = useCallback(async () => {
        const response = await EventService.getEventStaff().then(handleError)
        const shifts = response.events
            .filter((event) => event.eventType === "STAFFSHIFT")
            .sort((a, b) => a.startTime - b.startTime)
            .map((shift) => ({
                ...shift,
                id: shift.eventId,
                locationDisplay: shift.locations[0]?.description ?? "TBD",
                startDisplay: formatChicagoTime(shift.startTime),
                endDisplay: formatChicagoTime(shift.endTime),
            }))

        setShiftRows(shifts)
    }, [])

    const refreshStaffInfo = useCallback(async () => {
        const response = await StaffService.getStaffInfo().then(handleError)

        const infoRows = response.staffInfo
            .slice()
            .sort((a, b) =>
                `${a.firstName} ${a.lastName}`.localeCompare(
                    `${b.firstName} ${b.lastName}`,
                ),
            )
            .map((staff) => {
                const unknownStaff = staff as Record<string, unknown>
                const staffId = String(unknownStaff._id ?? staff.userId)
                return {
                    id: staffId,
                    staffId,
                    userId: staff.userId,
                    firstName: staff.firstName,
                    lastName: staff.lastName,
                    title: staff.title,
                    team: staff.team,
                    email: staff.email,
                    staffEmail: staff.staffEmail,
                    school: staff.school,
                    major: staff.major,
                    education: staff.education,
                    graduate: staff.graduate,
                    isActive: typeof staff.isActive === "boolean" ? staff.isActive : true,
                }
            })

        setStaffInfoRows(infoRows)
    }, [])

    const refreshStaffCandidates = useCallback(async () => {
        const response = await apiRequest<{ users: ShiftCandidateUser[] }>(
            "/staff/shift/candidates/",
        )
        const users = response.users
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((user) => ({
                userId: user.userId,
                displayName: user.name,
                staffEmail: user.email,
            }))
        setStaffUsers(users)
    }, [apiRequest])

    const refreshAssignments = useCallback(async () => {
        const response = await apiRequest<{ assignments: ShiftAssignment[] }>(
            "/staff/shift/all/",
        )
        setShiftAssignments(response.assignments)
    }, [apiRequest])

    const refreshAll = useCallback(async () => {
        setLoading(true)
        try {
            await Promise.all([
                refreshShifts(),
                refreshStaffInfo(),
                refreshStaffCandidates(),
                refreshAssignments(),
            ])
        } finally {
            setLoading(false)
        }
    }, [refreshAssignments, refreshShifts, refreshStaffCandidates, refreshStaffInfo])

    useEffect(() => {
        refreshAll()
    }, [refreshAll])

    const openCreateShiftModal = useCallback(() => {
        const now = new Date()
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)

        setEditingShiftId(null)
        setShiftName("")
        setShiftDescription("")
        setShiftLocation("")
        setShiftStartLocal(unixToDateTimeLocal(Math.floor(now.getTime() / 1000)))
        setShiftEndLocal(
            unixToDateTimeLocal(Math.floor(oneHourFromNow.getTime() / 1000)),
        )
        setShiftModalOpen(true)
    }, [])

    const openEditShiftModal = useCallback((shift: ShiftRow) => {
        setEditingShiftId(shift.eventId)
        setShiftName(shift.name)
        setShiftDescription(shift.description)
        setShiftLocation(shift.locations[0]?.description ?? "")
        setShiftStartLocal(unixToDateTimeLocal(shift.startTime))
        setShiftEndLocal(unixToDateTimeLocal(shift.endTime))
        setShiftModalOpen(true)
    }, [])

    const closeShiftModal = useCallback(() => {
        if (savingShift) return
        setShiftModalOpen(false)
    }, [savingShift])

    const handleSaveShift = useCallback(async () => {
        const name = shiftName.trim()
        const description = shiftDescription.trim()
        const location = shiftLocation.trim()
        const startTime = dateTimeLocalToUnix(shiftStartLocal)
        const endTime = dateTimeLocalToUnix(shiftEndLocal)

        if (!name) {
            alert("Shift name is required.")
            return
        }
        if (!location) {
            alert("Location is required.")
            return
        }
        if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
            alert("Please provide valid start and end times.")
            return
        }
        if (endTime <= startTime) {
            alert("End time must be after start time.")
            return
        }

        const shiftPayload = {
            isStaff: true,
            name,
            description,
            startTime,
            endTime,
            eventType: "STAFFSHIFT" as const,
            locations: [
                {
                    description: location,
                    latitude: 0,
                    longitude: 0,
                },
            ],
            isAsync: false,
            points: 0,
            isPrivate: true,
            isMandatory: false,
            isPro: false,
            displayOnStaffCheckIn: true,
        }

        setSavingShift(true)
        try {
            if (editingShiftId) {
                await EventService.putEvent({
                    body: {
                        eventId: editingShiftId,
                        ...shiftPayload,
                    },
                }).then(handleError)
            } else {
                await EventService.postEvent({ body: shiftPayload }).then(handleError)
            }
            await refreshShifts()
            setShiftModalOpen(false)
        } finally {
            setSavingShift(false)
        }
    }, [
        editingShiftId,
        refreshShifts,
        shiftDescription,
        shiftEndLocal,
        shiftLocation,
        shiftName,
        shiftStartLocal,
    ])

    const handleDeleteShift = useCallback(
        async (shift: ShiftRow) => {
            const confirmed = confirm(`Delete shift "${shift.name}"?`)
            if (!confirmed) return

            await EventService.deleteEventById({
                path: { id: shift.eventId },
            }).then(handleError)
            await refreshShifts()
        },
        [refreshShifts],
    )

    const updateShiftAssignment = useCallback(
        async (userId: string, shiftId: string, action: "add" | "remove") => {
            await apiRequest<{ success: true }>(
                action === "add" ? "/staff/shift/add/" : "/staff/shift/remove/",
                {
                    method: "POST",
                    body: JSON.stringify({ userId, shiftId }),
                },
            )
        },
        [apiRequest],
    )

    const handleAddAssignment = useCallback(
        async (shiftId: string) => {
            if (!selectedStaffUserId) {
                alert("Please select a staff member.")
                return
            }

            setSavingAssignment(true)
            try {
                await updateShiftAssignment(selectedStaffUserId, shiftId, "add")
                await refreshAssignments()
            } finally {
                setSavingAssignment(false)
            }
        },
        [refreshAssignments, selectedStaffUserId, updateShiftAssignment],
    )

    const handleRemoveAssignment = useCallback(
        async (shiftId: string) => {
            if (!selectedStaffUserId) {
                alert("Please select a staff member.")
                return
            }

            setSavingAssignment(true)
            try {
                await updateShiftAssignment(selectedStaffUserId, shiftId, "remove")
                await refreshAssignments()
            } finally {
                setSavingAssignment(false)
            }
        },
        [refreshAssignments, selectedStaffUserId, updateShiftAssignment],
    )

    const handleBulkAssignmentSync = useCallback(async () => {
        if (!selectedBulkShiftId) {
            alert("Please select a shift.")
            return
        }

        const { toAdd, toRemove } = bulkDelta
        if (toAdd.length === 0 && toRemove.length === 0) {
            alert("No changes to apply.")
            return
        }

        setSavingBulkAssignment(true)
        try {
            await Promise.all([
                ...toAdd.map((userId) =>
                    updateShiftAssignment(userId, selectedBulkShiftId, "add"),
                ),
                ...toRemove.map((userId) =>
                    updateShiftAssignment(userId, selectedBulkShiftId, "remove"),
                ),
            ])
            await refreshAssignments()
        } finally {
            setSavingBulkAssignment(false)
        }
    }, [bulkDelta, refreshAssignments, selectedBulkShiftId, updateShiftAssignment])

    const openCreateStaffInfoModal = useCallback(() => {
        setEditingStaffInfoId(null)
        setStaffInfoFirstName("")
        setStaffInfoLastName("")
        setStaffInfoTitle("")
        setStaffInfoTeam("")
        setStaffInfoEmail("")
        setStaffInfoStaffEmail("")
        setStaffInfoSchool("")
        setStaffInfoMajor("")
        setStaffInfoEducation("")
        setStaffInfoGraduate("")
        setStaffInfoIsActive(true)
        setStaffInfoModalOpen(true)
    }, [])

    const openEditStaffInfoModal = useCallback((row: StaffInfoRow) => {
        setEditingStaffInfoId(row.staffId)
        setStaffInfoFirstName(row.firstName)
        setStaffInfoLastName(row.lastName)
        setStaffInfoTitle(row.title)
        setStaffInfoTeam(row.team ?? "")
        setStaffInfoEmail(row.email)
        setStaffInfoStaffEmail(row.staffEmail)
        setStaffInfoSchool(row.school)
        setStaffInfoMajor(row.major)
        setStaffInfoEducation(row.education)
        setStaffInfoGraduate(row.graduate)
        setStaffInfoIsActive(Boolean(row.isActive))
        setStaffInfoModalOpen(true)
    }, [])

    const closeStaffInfoModal = useCallback(() => {
        if (savingStaffInfo) return
        setStaffInfoModalOpen(false)
    }, [savingStaffInfo])

    const handleSaveStaffInfo = useCallback(async () => {
        const payload = {
            firstName: staffInfoFirstName.trim(),
            lastName: staffInfoLastName.trim(),
            title: staffInfoTitle.trim(),
            team: staffInfoTeam.trim() || undefined,
            email: staffInfoEmail.trim(),
            staffEmail: staffInfoStaffEmail.trim(),
            school: staffInfoSchool.trim(),
            major: staffInfoMajor.trim(),
            education: staffInfoEducation.trim(),
            graduate: staffInfoGraduate.trim(),
            isActive: staffInfoIsActive,
        }

        if (!payload.firstName || !payload.lastName || !payload.title) {
            alert("First name, last name, and title are required.")
            return
        }
        if (!payload.email || !payload.staffEmail) {
            alert("Email and staff email are required.")
            return
        }
        if (!payload.school || !payload.major || !payload.education || !payload.graduate) {
            alert("School, major, education, and graduate are required.")
            return
        }

        setSavingStaffInfo(true)
        try {
            if (editingStaffInfoId) {
                await StaffService.putStaffInfo({
                    body: {
                        staffId: editingStaffInfoId,
                        ...payload,
                    },
                }).then(handleError)
            } else {
                await StaffService.postStaffInfo({
                    body: payload,
                }).then(handleError)
            }
            await refreshStaffInfo()
            setStaffInfoModalOpen(false)
        } finally {
            setSavingStaffInfo(false)
        }
    }, [
        editingStaffInfoId,
        refreshStaffInfo,
        staffInfoEducation,
        staffInfoEmail,
        staffInfoFirstName,
        staffInfoGraduate,
        staffInfoIsActive,
        staffInfoLastName,
        staffInfoMajor,
        staffInfoSchool,
        staffInfoStaffEmail,
        staffInfoTeam,
        staffInfoTitle,
    ])

    const handleDeleteStaffInfo = useCallback(
        async (row: StaffInfoRow) => {
            if (!row.staffId || row.staffId === row.userId) {
                alert("Unable to delete this row: missing staff profile id.")
                return
            }
            const confirmed = confirm(
                `Delete staff profile for ${row.firstName} ${row.lastName}?`,
            )
            if (!confirmed) return

            await StaffService.deleteStaffInfo({
                body: { staffId: row.staffId },
            }).then(handleError)
            await refreshStaffInfo()
        },
        [refreshStaffInfo],
    )

    const shiftColumns = useMemo<GridColDef<ShiftRow>[]>(
        () => [
            {
                field: "name",
                headerName: "Shift Name",
                minWidth: 220,
                flex: 1,
            },
            {
                field: "locationDisplay",
                headerName: "Location",
                minWidth: 220,
                flex: 1,
            },
            {
                field: "startDisplay",
                headerName: "Start (Chicago)",
                minWidth: 240,
                flex: 1,
            },
            {
                field: "endDisplay",
                headerName: "End (Chicago)",
                minWidth: 240,
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
                        label="Edit shift"
                        onClick={() => openEditShiftModal(row)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        key={`${row.id}-delete`}
                        icon={<DeleteIcon />}
                        label="Delete shift"
                        onClick={() => handleDeleteShift(row)}
                        color="inherit"
                    />,
                ],
            },
        ],
        [handleDeleteShift, openEditShiftModal],
    )

    const assignmentRows = useMemo<ShiftAssignmentRow[]>(() => {
        const staffById = new Map(
            staffUsers.map((staff) => [staff.userId, staff.displayName]),
        )
        const selectedAssignments =
            shiftAssignments.find((entry) => entry.userId === selectedStaffUserId)
                ?.shifts ?? []

        return shiftRows.map((shift) => {
            const assignedUsers = shiftAssignments
                .filter((entry) => entry.shifts.includes(shift.eventId))
                .map((entry) => staffById.get(entry.userId) ?? entry.userId)

            return {
                ...shift,
                assignedCount: assignedUsers.length,
                assignedUsersDisplay:
                    assignedUsers.length > 0
                        ? assignedUsers.join(", ")
                        : "Unassigned",
                selectedAssigned: selectedAssignments.includes(shift.eventId),
            }
        })
    }, [selectedStaffUserId, shiftAssignments, shiftRows, staffUsers])

    const shiftAssignmentsByShiftId = useMemo(() => {
        const assignments = new Map<string, string[]>()
        for (const assignment of shiftAssignments) {
            for (const shiftId of assignment.shifts) {
                const users = assignments.get(shiftId) ?? []
                users.push(assignment.userId)
                assignments.set(shiftId, users)
            }
        }
        return assignments
    }, [shiftAssignments])

    const bulkStaffOptions = useMemo<BulkStaffOption[]>(() => {
        const options = new Map<string, BulkStaffOption>()
        for (const user of staffUsers) {
            options.set(user.userId, {
                userId: user.userId,
                label: `${user.displayName} (${user.staffEmail})`,
            })
        }

        if (selectedBulkShiftId) {
            const assignedUserIds = shiftAssignmentsByShiftId.get(selectedBulkShiftId) ?? []
            for (const userId of assignedUserIds) {
                if (!options.has(userId)) {
                    options.set(userId, {
                        userId,
                        label: `(Existing assignment) ${userId}`,
                    })
                }
            }
        }

        return Array.from(options.values()).sort((a, b) =>
            a.label.localeCompare(b.label),
        )
    }, [selectedBulkShiftId, shiftAssignmentsByShiftId, staffUsers])

    const bulkStaffOptionsById = useMemo(
        () => new Map(bulkStaffOptions.map((option) => [option.userId, option])),
        [bulkStaffOptions],
    )

    useEffect(() => {
        if (!selectedBulkShiftId) {
            setBulkBaseUserIds([])
            setBulkSelectedUserIds([])
            return
        }
        const assignedUserIds = (
            shiftAssignmentsByShiftId.get(selectedBulkShiftId) ?? []
        ).slice()
        assignedUserIds.sort()
        setBulkBaseUserIds(assignedUserIds)
        setBulkSelectedUserIds(assignedUserIds)
    }, [selectedBulkShiftId, shiftAssignmentsByShiftId])

    const bulkSelectedStaffOptions = useMemo(
        () =>
            bulkSelectedUserIds.map((userId) => {
                const option = bulkStaffOptionsById.get(userId)
                if (option) return option
                return {
                    userId,
                    label: `(Existing assignment) ${userId}`,
                }
            }),
        [bulkSelectedUserIds, bulkStaffOptionsById],
    )

    const bulkDelta = useMemo(() => {
        const selectedSet = new Set(bulkSelectedUserIds)
        const existingSet = new Set(bulkBaseUserIds)
        const toAdd = bulkSelectedUserIds.filter((userId) => !existingSet.has(userId))
        const toRemove = bulkBaseUserIds.filter((userId) => !selectedSet.has(userId))
        return { toAdd, toRemove }
    }, [bulkBaseUserIds, bulkSelectedUserIds])

    const selectedBulkShift = useMemo(
        () => shiftRows.find((shift) => shift.eventId === selectedBulkShiftId),
        [selectedBulkShiftId, shiftRows],
    )

    const assignmentColumns = useMemo<GridColDef<ShiftAssignmentRow>[]>(
        () => [
            {
                field: "name",
                headerName: "Shift",
                minWidth: 220,
                flex: 1,
            },
            {
                field: "startDisplay",
                headerName: "Start (Chicago)",
                minWidth: 220,
                flex: 1,
            },
            {
                field: "assignedCount",
                headerName: "Assigned Staff",
                minWidth: 140,
                type: "number",
            },
            {
                field: "assignedUsersDisplay",
                headerName: "Who Is Assigned",
                minWidth: 340,
                flex: 2,
            },
            {
                field: "actions",
                type: "actions",
                headerName: "",
                width: 140,
                getActions: ({ row }) => [
                    row.selectedAssigned ? (
                        <GridActionsCellItem
                            key={`${row.id}-remove`}
                            icon={<LinkOffIcon />}
                            label="Remove from selected staff"
                            onClick={() => handleRemoveAssignment(row.eventId)}
                            color="inherit"
                            disabled={!selectedStaffUserId || savingAssignment}
                        />
                    ) : (
                        <GridActionsCellItem
                            key={`${row.id}-add`}
                            icon={<LinkIcon />}
                            label="Assign to selected staff"
                            onClick={() => handleAddAssignment(row.eventId)}
                            color="inherit"
                            disabled={!selectedStaffUserId || savingAssignment}
                        />
                    ),
                ],
            },
        ],
        [
            handleAddAssignment,
            handleRemoveAssignment,
            savingAssignment,
            selectedStaffUserId,
        ],
    )

    const staffInfoColumns = useMemo<GridColDef<StaffInfoRow>[]>(
        () => [
            { field: "firstName", headerName: "First Name", minWidth: 140 },
            { field: "lastName", headerName: "Last Name", minWidth: 140 },
            { field: "title", headerName: "Title", minWidth: 180, flex: 1 },
            { field: "team", headerName: "Team", minWidth: 140 },
            { field: "staffEmail", headerName: "Staff Email", minWidth: 240, flex: 1 },
            { field: "email", headerName: "Email", minWidth: 240, flex: 1 },
            { field: "school", headerName: "School", minWidth: 180 },
            { field: "major", headerName: "Major", minWidth: 140 },
            { field: "education", headerName: "Education", minWidth: 140 },
            { field: "graduate", headerName: "Graduate", minWidth: 120 },
            {
                field: "isActive",
                headerName: "Active",
                minWidth: 90,
                type: "boolean",
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
                        label="Edit staff"
                        onClick={() => openEditStaffInfoModal(row)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        key={`${row.id}-delete`}
                        icon={<DeleteIcon />}
                        label="Delete staff"
                        onClick={() => handleDeleteStaffInfo(row)}
                        color="inherit"
                    />,
                ],
            },
        ],
        [handleDeleteStaffInfo, openEditStaffInfoModal],
    )

    if (roles.length === 0 || loading) {
        return <Loading />
    }

    if (!isAdmin) {
        return <Unauthorized />
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
                    value={
                        activeTab === "shifts"
                            ? 0
                            : activeTab === "assignments"
                              ? 1
                              : activeTab === "bulkAssignments"
                                ? 2
                                : 3
                    }
                    onChange={(_, idx) =>
                        setActiveTab(
                            idx === 0
                                ? "shifts"
                                : idx === 1
                                  ? "assignments"
                                  : idx === 2
                                    ? "bulkAssignments"
                                    : "staffInfo",
                        )
                    }
                >
                    <Tab label="Staff Shifts" />
                    <Tab label="Assign Staff" />
                    <Tab label="Bulk Assign Shifts" />
                    <Tab label="Staff Info" />
                </Tabs>

                <Box display="flex" gap={1}>
                    {(activeTab === "shifts" || activeTab === "staffInfo") && (
                        <IconButton
                            onClick={
                                activeTab === "shifts"
                                    ? openCreateShiftModal
                                    : openCreateStaffInfoModal
                            }
                            aria-label="Create"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                        </IconButton>
                    )}
                    <IconButton
                        onClick={refreshAll}
                        aria-label="Refresh staff shift page"
                    >
                        <FontAwesomeIcon icon={faSync} />
                    </IconButton>
                </Box>
            </Box>

            {activeTab === "shifts" ? (
                <DataGrid
                    autoHeight
                    rows={shiftRows}
                    columns={shiftColumns}
                    sx={{ fontFamily: "Montserrat" }}
                    slots={{
                        toolbar: () => <GridToolbar refresh={refreshAll} />,
                    }}
                />
            ) : activeTab === "assignments" ? (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    <Typography variant="h6">Assign Staff To Shifts</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Choose a staff member, then use action buttons in each
                        shift row to add or remove assignment. The table also
                        shows who is already assigned to each shift.
                    </Typography>

                    <FormControl fullWidth>
                        <InputLabel id="staff-user-select-label">
                            Staff Member
                        </InputLabel>
                        <Select
                            labelId="staff-user-select-label"
                            label="Staff Member"
                            value={selectedStaffUserId}
                            onChange={(event: SelectChangeEvent<string>) =>
                                setSelectedStaffUserId(event.target.value)
                            }
                        >
                            {staffUsers.map((user) => (
                                <MenuItem key={user.userId} value={user.userId}>
                                    {user.displayName} ({user.staffEmail})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Typography variant="body2">
                        Currently assigned to selected staff:{" "}
                        {assignmentRows
                            .filter((row) => row.selectedAssigned)
                            .map((row) => row.name)
                            .join(", ") || "None"}
                    </Typography>

                    <DataGrid
                        autoHeight
                        rows={assignmentRows}
                        columns={assignmentColumns}
                        sx={{ fontFamily: "Montserrat" }}
                        slots={{
                            toolbar: () => <GridToolbar refresh={refreshAll} />,
                        }}
                    />
                </Box>
            ) : activeTab === "bulkAssignments" ? (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    <Typography variant="h6">Bulk Assign Shifts</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Pick a shift, select all assignees, then apply once. This
                        syncs to add newly selected staff and remove deselected staff.
                    </Typography>

                    <FormControl fullWidth>
                        <InputLabel id="bulk-shift-select-label">Shift</InputLabel>
                        <Select
                            labelId="bulk-shift-select-label"
                            label="Shift"
                            value={selectedBulkShiftId}
                            onChange={(event: SelectChangeEvent<string>) =>
                                setSelectedBulkShiftId(event.target.value)
                            }
                        >
                            {shiftRows.map((shift) => (
                                <MenuItem key={shift.eventId} value={shift.eventId}>
                                    {shift.name} - {shift.startDisplay}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Autocomplete
                        multiple
                        options={bulkStaffOptions}
                        value={bulkSelectedStaffOptions}
                        isOptionEqualToValue={(option, value) =>
                            option.userId === value.userId
                        }
                        onChange={(_, values) =>
                            setBulkSelectedUserIds(
                                Array.from(new Set(values.map((option) => option.userId))),
                            )
                        }
                        disabled={!selectedBulkShiftId}
                        filterSelectedOptions
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Assigned Staff"
                                placeholder="Search staff to add/remove"
                            />
                        )}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => {
                                const tagProps = getTagProps({ index })
                                const { key, ...chipProps } = tagProps
                                return (
                                    <Chip
                                        key={key}
                                        label={option.label}
                                        size="small"
                                        {...chipProps}
                                    />
                                )
                            })
                        }
                    />

                    <Typography variant="body2">
                        Selected shift:{" "}
                        {selectedBulkShift
                            ? `${selectedBulkShift.name} (${selectedBulkShift.startDisplay})`
                            : "None"}
                    </Typography>
                    <Typography variant="body2">
                        Pending changes: add {bulkDelta.toAdd.length}, remove{" "}
                        {bulkDelta.toRemove.length}
                    </Typography>

                    <Box display="flex" gap={1} flexWrap="wrap">
                        <Button
                            variant="outlined"
                            disabled={!selectedBulkShiftId || savingBulkAssignment}
                            onClick={() => setBulkSelectedUserIds(bulkBaseUserIds)}
                        >
                            Reset To Current
                        </Button>
                        <Button
                            variant="outlined"
                            disabled={!selectedBulkShiftId || savingBulkAssignment}
                            onClick={() => setBulkSelectedUserIds([])}
                        >
                            Clear All
                        </Button>
                        <Button
                            variant="contained"
                            disabled={
                                !selectedBulkShiftId ||
                                savingBulkAssignment ||
                                (bulkDelta.toAdd.length === 0 &&
                                    bulkDelta.toRemove.length === 0)
                            }
                            onClick={handleBulkAssignmentSync}
                        >
                            Apply Bulk Update
                        </Button>
                    </Box>
                </Box>
            ) : (
                <DataGrid
                    autoHeight
                    rows={staffInfoRows}
                    columns={staffInfoColumns}
                    sx={{ fontFamily: "Montserrat" }}
                    slots={{
                        toolbar: () => <GridToolbar refresh={refreshAll} />,
                    }}
                />
            )}

            <Dialog
                open={shiftModalOpen}
                onClose={closeShiftModal}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {editingShiftId ? "Edit Staff Shift" : "Create Staff Shift"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Shift Name"
                        fullWidth
                        value={shiftName}
                        onChange={(event) => setShiftName(event.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        multiline
                        minRows={3}
                        value={shiftDescription}
                        onChange={(event) =>
                            setShiftDescription(event.target.value)
                        }
                    />
                    <TextField
                        margin="dense"
                        label="Location"
                        fullWidth
                        value={shiftLocation}
                        onChange={(event) => setShiftLocation(event.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Start Time"
                        type="datetime-local"
                        fullWidth
                        value={shiftStartLocal}
                        onChange={(event) =>
                            setShiftStartLocal(event.target.value)
                        }
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        margin="dense"
                        label="End Time"
                        type="datetime-local"
                        fullWidth
                        value={shiftEndLocal}
                        onChange={(event) => setShiftEndLocal(event.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeShiftModal} disabled={savingShift}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveShift}
                        variant="contained"
                        disabled={savingShift}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={staffInfoModalOpen}
                onClose={closeStaffInfoModal}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {editingStaffInfoId ? "Edit Staff Info" : "Create Staff Info"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="First Name"
                        fullWidth
                        value={staffInfoFirstName}
                        onChange={(event) => setStaffInfoFirstName(event.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Last Name"
                        fullWidth
                        value={staffInfoLastName}
                        onChange={(event) => setStaffInfoLastName(event.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Title"
                        fullWidth
                        value={staffInfoTitle}
                        onChange={(event) => setStaffInfoTitle(event.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Team"
                        fullWidth
                        value={staffInfoTeam}
                        onChange={(event) => setStaffInfoTeam(event.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Email"
                        fullWidth
                        value={staffInfoEmail}
                        onChange={(event) => setStaffInfoEmail(event.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Staff Email"
                        fullWidth
                        value={staffInfoStaffEmail}
                        onChange={(event) => setStaffInfoStaffEmail(event.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="School"
                        fullWidth
                        value={staffInfoSchool}
                        onChange={(event) => setStaffInfoSchool(event.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Major"
                        fullWidth
                        value={staffInfoMajor}
                        onChange={(event) => setStaffInfoMajor(event.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Education"
                        fullWidth
                        value={staffInfoEducation}
                        onChange={(event) => setStaffInfoEducation(event.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Graduate"
                        fullWidth
                        value={staffInfoGraduate}
                        onChange={(event) => setStaffInfoGraduate(event.target.value)}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel id="staff-active-label">Active</InputLabel>
                        <Select
                            labelId="staff-active-label"
                            label="Active"
                            value={staffInfoIsActive ? "true" : "false"}
                            onChange={(event) =>
                                setStaffInfoIsActive(event.target.value === "true")
                            }
                        >
                            <MenuItem value="true">Active</MenuItem>
                            <MenuItem value="false">Inactive</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeStaffInfoModal} disabled={savingStaffInfo}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveStaffInfo}
                        variant="contained"
                        disabled={savingStaffInfo}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}
