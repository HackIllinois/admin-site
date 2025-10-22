import {
    faBell,
    faCalendar,
    faCodeBranch,
    faEnvelope,
    faMedal,
    faShoppingCart,
    faUser,
    faUserCheck,
    faUsers,
    faFile
} from "@fortawesome/free-solid-svg-icons"
import { usePathname } from "next/navigation"

export const routes = [
    // { path: '/', name: "Statistics", icon: faCalculator },
    { path: "/admissions", name: "Admissions", icon: faUsers },
    { path: "/notifications", name: "Notifications", icon: faBell },
    { path: "/events", name: "Events", icon: faCalendar },
    { path: "/newsletters", name: "Newsletters", icon: faEnvelope },
    { path: "/shop", name: "Shop", icon: faShoppingCart },
    { path: "/sponsors", name: "Sponsors", icon: faMedal },
    { path: "/attendances", name: "Attendances", icon: faUserCheck },
    { path: "/users", name: "Users", icon: faUsers },
    { path: "/staff-application", name: "Staff Application", icon: faFile },
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
