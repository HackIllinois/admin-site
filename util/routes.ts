import {
    faBell,
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
import { IconDefinition } from "@fortawesome/fontawesome-svg-core"
import { Role } from "@/generated"
import { usePathname } from "next/navigation"

export type NavRoute = {
    path: string
    name: string
    icon: IconDefinition
    requiredRoles?: Role[]
}

export const routes: NavRoute[] = [
    { path: "/admissions", name: "Admissions", icon: faUsers },
    { path: "/notifications", name: "Notifications", icon: faBell },
    { path: "/events", name: "Events", icon: faCalendar },
    { path: "/staff-shifts", name: "Staff Shifts", icon: faUserClock },
    {
        path: "/staff/roles",
        name: "Staff Roles",
        icon: faUser,
        requiredRoles: ["ADMIN"],
    },
    { path: "/mentorship", name: "Mentorship", icon: faUserTie },
    { path: "/newsletters", name: "Newsletters", icon: faEnvelope },
    { path: "/email", name: "Email", icon: faPenToSquare },
    { path: "/shop", name: "Shop", icon: faShoppingCart },
    { path: "/sponsors", name: "Sponsors", icon: faMedal },
    { path: "/attendances", name: "Attendances", icon: faUserCheck },
    { path: "/version", name: "Version", icon: faCodeBranch },
    { path: "/account", name: "Account", icon: faUser },
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
