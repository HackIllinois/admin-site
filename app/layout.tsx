"use client"
import NavBar from "@/components/NavBar/NavBar"
import { authenticate, isAuthenticated, setupClient } from "@/util/api-client"
import { useRouteOpen } from "@/util/routes"
import { usePathname } from "next/navigation"
import React, { useEffect, useState } from "react"
import "./constants.scss"
import styles from "./layout.module.scss"


const PAGES_TO_HIDE_NAVBAR: RegExp[] = [
  /^\/events\/[^/]+\/checkin$/
]

export default function Layout({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        setupClient()

        // Since admin site is staff only, every page should check authentication
        if (!isAuthenticated()) {
            authenticate()
        }
    }, [])

    const routeOpen = useRouteOpen()

    const [showNavbar, setShowNavbar] = useState(false);

  const pathname = usePathname() || ''

    useEffect(() => {
        const hide = PAGES_TO_HIDE_NAVBAR.some((rx) => rx.test(pathname))
        setShowNavbar(!hide)
    }, [pathname])


    return (
        <html lang="en" className="root">
            <link rel="icon" href="./favicon.png" sizes="any" />
            <title>{(routeOpen ? `${routeOpen} - ` : "") + "Admin Site"}</title>
            <body className={styles.body}>
                {showNavbar ? (
                    <NavBar />
                ) : <></>}
                <main>{children}</main>
            </body>
        </html>
    )
}
