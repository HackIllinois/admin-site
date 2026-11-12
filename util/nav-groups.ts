// Pure helpers for the sidebar: group order, grouping, active state, initials.

export type NavGroupId = "people" | "event" | "partners" | "system"

export const NAV_GROUPS: { id: NavGroupId; label: string }[] = [
    { id: "people", label: "People" },
    { id: "event", label: "Event" },
    { id: "partners", label: "Partners & Shop" },
    { id: "system", label: "System" },
]

export function groupRoutes<T extends { group: NavGroupId }>(routes: T[]) {
    return NAV_GROUPS.map((group) => ({
        ...group,
        routes: routes.filter((route) => route.group === group.id),
    })).filter((group) => group.routes.length > 0)
}

// A route is active on its own path and on any sub page of it
export function isRouteActive(pathname: string, routePath: string) {
    return pathname === routePath || pathname.startsWith(routePath + "/")
}

export function initialsOf(name: string | undefined | null) {
    const parts = (name ?? "").trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return "?"
    const letters =
        parts.length === 1
            ? parts[0][0]
            : parts[0][0] + parts[parts.length - 1][0]
    return letters.toUpperCase()
}
