import {
    faBell,
    faBriefcase,
    faCalculator,
    faCalendar,
    faCodeBranch,
    faEnvelope,
    faMedal,
    faPenToSquare,
    faShoppingCart,
    faUser,
    faUserCheck,
    faUserClock,
    faUserTie,
    faUsers,
} from "@fortawesome/free-solid-svg-icons"
import { usePathname } from "next/navigation"
import type { NavGroupId } from "./nav-groups"

export const routes = [
    {
        path: "/admissions",
        group: "people" as NavGroupId,
        name: "Admissions",
        icon: faUsers,
    },
    {
        path: "/notifications",
        group: "event" as NavGroupId,
        name: "Notifications",
        icon: faBell,
    },
    {
        path: "/events",
        group: "event" as NavGroupId,
        name: "Events",
        icon: faCalendar,
    },
    {
        path: "/staff-shifts",
        group: "people" as NavGroupId,
        name: "Staff Shifts",
        icon: faUserClock,
    },
    {
        path: "/mentorship",
        group: "people" as NavGroupId,
        name: "Mentors/Judges",
        icon: faUserTie,
    },
    {
        path: "/newsletters",
        group: "event" as NavGroupId,
        name: "Newsletters",
        icon: faEnvelope,
    },
    {
        path: "/email",
        group: "event" as NavGroupId,
        name: "Email",
        icon: faPenToSquare,
    },
    {
        path: "/shop",
        group: "partners" as NavGroupId,
        name: "Shop",
        icon: faShoppingCart,
    },
    {
        path: "/jobs",
        group: "partners" as NavGroupId,
        name: "Job Postings",
        icon: faBriefcase,
    },
    {
        path: "/sponsors",
        group: "partners" as NavGroupId,
        name: "Sponsors",
        icon: faMedal,
    },
    {
        path: "/attendances",
        group: "people" as NavGroupId,
        name: "Attendances",
        icon: faUserCheck,
    },
    {
        path: "/version",
        group: "system" as NavGroupId,
        name: "Version",
        icon: faCodeBranch,
    },
    {
        path: "/account",
        group: "system" as NavGroupId,
        name: "Account",
        icon: faUser,
    },
    {
        path: "/statistics",
        group: "people" as NavGroupId,
        name: "Attendee Stats",
        icon: faCalculator,
    },
]

export function useRouteOpen() {
    const pathname = usePathname()

    for (const route of routes) {
        if (pathname.startsWith(route.path)) {
            return route.name
        }
    }

    return null
}
