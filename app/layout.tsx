"use client"
import React, { useEffect } from "react"
import styles from "./layout.module.scss"
import { authenticate, isAuthenticated, setupClient } from "@/util/api-client"

export default function Layout({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        setupClient()

        // Since admin site is staff only, every page should check authentication
        if (!isAuthenticated()) {
            authenticate()
        }
    }, [])
    return (
        <html lang="en">
            <body className={styles.body}>{children}</body>
        </html>
    )
}
