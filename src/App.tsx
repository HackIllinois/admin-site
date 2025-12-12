import { lazy, Suspense, useEffect, useMemo } from "react"
import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import NavBar from "@/components/NavBar/NavBar"
import { setupClient } from "@/util/api-client"
import { useRouteOpen } from "@/util/routes"
import styles from "@/app/layout.module.scss"
import Loading from "@/components/Loading"

// Pages
const Admissions = lazy(() => import("@/app/admissions/page"))
const Notifications = lazy(() => import("@/app/notifications/page"))
const Events = lazy(() => import("@/app/events/page"))
const Newsletters = lazy(() => import("@/app/newsletters/page"))
const Shop = lazy(() => import("@/app/shop/page"))
const Sponsors = lazy(() => import("@/app/sponsors/page"))
const Attendances = lazy(() => import("@/app/attendances/page"))
const Version = lazy(() => import("@/app/version/page"))
const Account = lazy(() => import("@/app/account/page"))
const CheckinPage = lazy(() => import("@/app/events/[eventId]/checkin/page"))
const NotFound = lazy(() => import("@/app/not-found"))

const PAGES_TO_HIDE_NAVBAR: RegExp[] = [/^\/events\/[^/]+\/checkin$/]

export default function App() {
    useEffect(() => {
        setupClient()
    }, [])

    const routeOpen = useRouteOpen()
    const location = useLocation()
    const showNavbar = useMemo(() => {
        return !PAGES_TO_HIDE_NAVBAR.some((rx) => rx.test(location.pathname))
    }, [location.pathname])

    useEffect(() => {
        document.title = (routeOpen ? `${routeOpen} - ` : "") + "Admin Site"
    }, [routeOpen])

    return (
        <div className={styles.body}>
            {showNavbar && <NavBar />}
            <main>
                <Suspense fallback={<Loading />}>
                    <Routes>
                        <Route
                            path="/"
                            element={<Navigate to="/admissions" replace />}
                        />
                        <Route path="/admissions" element={<Admissions />} />
                        <Route
                            path="/notifications"
                            element={<Notifications />}
                        />
                        <Route path="/events" element={<Events />} />
                        <Route path="/newsletters" element={<Newsletters />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/sponsors" element={<Sponsors />} />
                        <Route path="/attendances" element={<Attendances />} />
                        <Route path="/version" element={<Version />} />
                        <Route path="/account" element={<Account />} />
                        <Route
                            path="/events/:eventId/checkin"
                            element={<CheckinPage />}
                        />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </main>
        </div>
    )
}
