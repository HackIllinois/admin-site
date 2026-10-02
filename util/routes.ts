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

export const routes = [
    { path: "/admissions", name: "Admissions", icon: faUsers },
    { path: "/notifications", name: "Notifications", icon: faBell },
    { path: "/events", name: "Events", icon: faCalendar },
    { path: "/staff-shifts", name: "Staff Shifts", icon: faUserClock },
    { path: "/mentorship", name: "Mentors/Judges", icon: faUserTie },
    { path: "/newsletters", name: "Newsletters", icon: faEnvelope },
    { path: "/email", name: "Email", icon: faPenToSquare },
    { path: "/shop", name: "Shop", icon: faShoppingCart },
    { path: "/jobs", name: "Job Postings", icon: faBriefcase },
    { path: "/sponsors", name: "Sponsors", icon: faMedal },
    { path: "/attendances", name: "Attendances", icon: faUserCheck },
    { path: "/version", name: "Version", icon: faCodeBranch },
    { path: "/account", name: "Account", icon: faUser },
    { path: "/statistics", name: "Attendee Stats", icon: faCalculator },
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
