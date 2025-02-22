"use client"
import React, { useEffect } from "react"
import "./constants.scss"
import styles from "./layout.module.scss"
import { authenticate, isAuthenticated, setupClient } from "@/util/api-client"
import NavBar from "@/components/NavBar/NavBar"
import { getRouteOpen } from "@/util/routes"

export default function Layout({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        setupClient()

        // Since admin site is staff only, every page should check authentication
        if (!isAuthenticated()) {
            authenticate()
        }
    }, [])

    const routeOpen = getRouteOpen()

    return (
        <html lang="en" className="root">
            <link rel="icon" href="./favicon.png" sizes="any" />
            <title>{(routeOpen ? `${routeOpen} - ` : "") + "Admin Site"}</title>
            <body className={styles.body}>
                <NavBar />
                <main>{children}</main>
            </body>
        </html>
    )
}
