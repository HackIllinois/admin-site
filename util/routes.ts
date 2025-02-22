import {
    faBell,
    faCalendar,
    faKey,
    faShoppingCart,
    faUsers,
} from "@fortawesome/free-solid-svg-icons"
import { usePathname } from "next/navigation"

export const routes = [
    // { path: '/', name: "Statistics", icon: faCalculator },
    // { path: '/users', name: "Users", icon: faUsers },
    { path: "/admissions", name: "Admissions", icon: faUsers },
    { path: "/notifications", name: "Notifications", icon: faBell },
    { path: "/events", name: "Events", icon: faCalendar },
    { path: "/shop", name: "Shop", icon: faShoppingCart },
    { path: "/token", name: "Token", icon: faKey },
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
