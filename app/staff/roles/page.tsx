"use client"

import Loading from "@/components/Loading"
import Unauthorized from "@/components/Unauthorized/Unauthorized"
import { AuthService, Role, UserInfo } from "@/generated"
import { handleError, useRoles } from "@/util/api-client"
import { faSync } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    Alert,
    Box,
    Button,
    Chip,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
    Typography,
} from "@mui/material"
import { DataGrid, GridColDef } from "@mui/x-data-grid"
import { useCallback, useEffect, useMemo, useState } from "react"

type ManagedRole = (typeof MANAGED_ROLES)[number]

type RoleRow = UserInfo & {
    id: string
    roles: ManagedRole[]
}

const MANAGED_ROLES = [
    "ADMIN",
    "STAFF",
    "MENTOR",
    "SPONSOR",
    "PRO",
    "BLOBSTORE",
] as const satisfies ReadonlyArray<Role>

const roleLabels: Record<ManagedRole, string> = {
    ADMIN: "Admin",
    STAFF: "Staff",
    MENTOR: "Mentor",
    SPONSOR: "Sponsor",
    PRO: "Pro",
    BLOBSTORE: "Blobstore",
}

function fuzzyScore(query: string, haystack: string): number {
    const q = query.trim().toLowerCase()
    if (!q) return 0

    const h = haystack.toLowerCase()
    if (h.startsWith(q)) return 1000 - h.length
    if (h.includes(q)) return 700 - h.length

    let qIdx = 0
    let score = 0
    for (let hIdx = 0; hIdx < h.length && qIdx < q.length; hIdx += 1) {
        if (h[hIdx] === q[qIdx]) {
            score += 1
            qIdx += 1
        }
    }

    return qIdx === q.length ? score : -1
}

export default function StaffRolesPage() {
    const roles = useRoles()
    const isAdmin = roles.includes("ADMIN")

    const [loading, setLoading] = useState(true)
    const [allUsers, setAllUsers] = useState<UserInfo[]>([])
    const [rolesByUserId, setRolesByUserId] = useState<Record<string, ManagedRole[]>>({})

    const [search, setSearch] = useState("")
    const [selectedSearchRole, setSelectedSearchRole] = useState<ManagedRole>("STAFF")
    const [grantingUserId, setGrantingUserId] = useState<string | null>(null)
    const [updatingRoleKey, setUpdatingRoleKey] = useState<string | null>(null)

    const refreshData = useCallback(async () => {
        setLoading(true)
        try {
            const [allUsersResult, ...roleInfoResults] = await Promise.all([
                AuthService.getAuthRolesListInfoByRole({ path: { role: "USER" } }).then(
                    handleError,
                ),
                ...MANAGED_ROLES.map((role) =>
                    AuthService.getAuthRolesListInfoByRole({ path: { role } }).then(
                        handleError,
                    ),
                ),
            ])

            const roleMap = new Map<string, Set<ManagedRole>>()

            roleInfoResults.forEach((result, index) => {
                const role = MANAGED_ROLES[index]
                result.userInfo.forEach((user) => {
                    const existing = roleMap.get(user.userId) ?? new Set<ManagedRole>()
                    existing.add(role)
                    roleMap.set(user.userId, existing)
                })
            })

            const nextRolesByUserId: Record<string, ManagedRole[]> = {}
            roleMap.forEach((roleSet, userId) => {
                nextRolesByUserId[userId] = Array.from(roleSet)
            })

            setAllUsers(allUsersResult.userInfo)
            setRolesByUserId(nextRolesByUserId)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!isAdmin) return
        refreshData()
    }, [isAdmin, refreshData])

    const privilegedRows = useMemo<RoleRow[]>(() => {
        return allUsers
            .filter((user) => (rolesByUserId[user.userId] ?? []).length > 0)
            .map((user) => ({
                id: user.userId,
                ...user,
                roles: rolesByUserId[user.userId] ?? [],
            }))
            .sort((a, b) => a.email.localeCompare(b.email))
    }, [allUsers, rolesByUserId])

    const searchResults = useMemo(() => {
        const query = search.trim()
        if (!query) return []

        return allUsers
            .map((user) => {
                const target = `${user.userId} ${user.email} ${user.name}`
                const score = fuzzyScore(query, target)
                return {
                    user,
                    score,
                }
            })
            .filter((entry) => entry.score >= 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 20)
    }, [allUsers, search])

    const setRole = useCallback(
        async (userId: string, role: ManagedRole, shouldHaveRole: boolean) => {
            setUpdatingRoleKey(`${userId}:${role}`)
            try {
                if (shouldHaveRole) {
                    await AuthService.putAuthRolesByIdByRole({
                        path: { id: userId, role },
                    }).then(handleError)
                } else {
                    await AuthService.deleteAuthRolesByIdByRole({
                        path: { id: userId, role },
                    }).then(handleError)
                }
                await refreshData()
            } finally {
                setUpdatingRoleKey(null)
            }
        },
        [refreshData],
    )

    const roleColumns = useMemo<GridColDef<RoleRow>[]>(() => {
        const baseColumns: GridColDef<RoleRow>[] = [
            { field: "name", headerName: "Name", minWidth: 180, flex: 1 },
            { field: "email", headerName: "Email", minWidth: 260, flex: 1 },
            { field: "userId", headerName: "User ID", minWidth: 240, flex: 1 },
        ]

        const roleColumns = MANAGED_ROLES.map<GridColDef<RoleRow>>((role) => ({
            field: role,
            headerName: roleLabels[role],
            width: 130,
            sortable: false,
            filterable: false,
            renderCell: ({ row }) => {
                const checked = row.roles.includes(role)
                const key = `${row.userId}:${role}`
                const busy = updatingRoleKey === key

                return (
                    <Button
                        size="small"
                        variant={checked ? "contained" : "outlined"}
                        disabled={busy}
                        onClick={() => setRole(row.userId, role, !checked)}
                    >
                        {checked ? "Enabled" : "Grant"}
                    </Button>
                )
            },
        }))

        return [...baseColumns, ...roleColumns]
    }, [setRole, updatingRoleKey])

    if (roles.length === 0 || (isAdmin && loading)) {
        return <Loading />
    }

    if (!isAdmin) {
        return <Unauthorized />
    }

    return (
        <Box sx={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h5" fontWeight={700}>
                        Staff Roles
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Admin-only role assignment for privileged accounts.
                    </Typography>
                </Box>
                <IconButton onClick={refreshData} aria-label="Refresh roles">
                    <FontAwesomeIcon icon={faSync} />
                </IconButton>
            </Box>

            <Box>
                <Typography variant="h6" mb={1}>
                    Privileged Accounts
                </Typography>
                <DataGrid
                    autoHeight
                    rows={privilegedRows}
                    columns={roleColumns}
                    disableRowSelectionOnClick
                    sx={{ fontFamily: "Montserrat" }}
                />
            </Box>

            <Box>
                <Typography variant="h6" mb={1}>
                    Search Accounts To Grant Role
                </Typography>
                <Alert severity="info" sx={{ marginBottom: 1.5 }}>
                    Search by user ID or email. Results are fuzzy-matched and not limited to staff profiles.
                </Alert>
                <Box display="flex" gap={1} flexWrap="wrap" alignItems="center" mb={2}>
                    <TextField
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        label="Search by user ID or email"
                        sx={{ minWidth: 320, flex: 1 }}
                    />
                    <FormControl sx={{ minWidth: 180 }}>
                        <InputLabel id="grant-role-label">Role</InputLabel>
                        <Select
                            labelId="grant-role-label"
                            value={selectedSearchRole}
                            label="Role"
                            onChange={(event: SelectChangeEvent<ManagedRole>) =>
                                setSelectedSearchRole(event.target.value as ManagedRole)
                            }
                        >
                            {MANAGED_ROLES.map((role) => (
                                <MenuItem key={role} value={role}>
                                    {roleLabels[role]}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Box display="flex" flexDirection="column" gap={1}>
                    {searchResults.map(({ user }) => {
                        const currentRoles = rolesByUserId[user.userId] ?? []
                        const alreadyHasRole = currentRoles.includes(selectedSearchRole)
                        const busy = grantingUserId === user.userId

                        return (
                            <Box
                                key={user.userId}
                                sx={{
                                    border: "1px solid #ddd",
                                    borderRadius: 1,
                                    padding: 1.5,
                                    display: "flex",
                                    flexWrap: "wrap",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 1,
                                }}
                            >
                                <Box>
                                    <Typography fontWeight={600}>{user.name}</Typography>
                                    <Typography variant="body2">{user.email}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {user.userId}
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                    {currentRoles.map((role) => (
                                        <Chip key={`${user.userId}-${role}`} label={roleLabels[role]} size="small" />
                                    ))}
                                    <Button
                                        variant="contained"
                                        disabled={alreadyHasRole || busy}
                                        onClick={async () => {
                                            setGrantingUserId(user.userId)
                                            try {
                                                await setRole(user.userId, selectedSearchRole, true)
                                            } finally {
                                                setGrantingUserId(null)
                                            }
                                        }}
                                    >
                                        {alreadyHasRole ? "Already Has Role" : `Grant ${roleLabels[selectedSearchRole]}`}
                                    </Button>
                                </Box>
                            </Box>
                        )
                    })}
                    {search.trim() && searchResults.length === 0 && (
                        <Typography color="text.secondary">No accounts found.</Typography>
                    )}
                </Box>
            </Box>
        </Box>
    )
}
