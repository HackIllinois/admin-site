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
} from "@fortawesome/free-solid-svg-icons"
import { useLocation } from "react-router-dom"

export const routes = [
    // { path: '/', name: "Statistics", icon: faCalculator },
    { path: "/admissions", name: "Admissions", icon: faUsers },
    { path: "/notifications", name: "Notifications", icon: faBell },
    { path: "/events", name: "Events", icon: faCalendar },
    { path: "/newsletters", name: "Newsletters", icon: faEnvelope },
    { path: "/shop", name: "Shop", icon: faShoppingCart },
    { path: "/sponsors", name: "Sponsors", icon: faMedal },
    { path: "/attendances", name: "Attendances", icon: faUserCheck },
    { path: "/version", name: "Version", icon: faCodeBranch },
    { path: "/account", name: "Account", icon: faUser },
]

export function useRouteOpen() {
    const { pathname } = useLocation()

    for (const route of routes) {
        if (pathname.startsWith(route.path)) {
            return route.name
        }
    }

    return null
}
