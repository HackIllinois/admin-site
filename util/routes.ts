import {
    faBell,
    faCalendar,
    faCheck,
    faCodeBranch,
    faMedal,
    faShoppingCart,
    faUser,
    faUserCheck,
    faUsers,
} from "@fortawesome/free-solid-svg-icons"
import { usePathname } from "next/navigation"

export const routes = [
    // { path: '/', name: "Statistics", icon: faCalculator },
    { path: "/admissions", name: "Admissions", icon: faUsers },
    { path: "/notifications", name: "Notifications", icon: faBell },
    { path: "/events", name: "Events", icon: faCalendar },
    { path: "/shop", name: "Shop", icon: faShoppingCart },
    { path: "/sponsors", name: "Sponsors", icon: faMedal },
    { path: "/attendances", name: "Attendances", icon: faUserCheck },
    { path: "/version", name: "Version", icon: faCodeBranch },
    { path: "/account", name: "Account", icon: faUser },
]

export function getRouteOpen() {
    const pathname = usePathname()

    for (const route of routes) {
        if (pathname.startsWith(route.path)) {
            return route.name
        }
    }

    return null
}
