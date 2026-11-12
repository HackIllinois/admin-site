"use client"
import Header from "@/components/Header/Header"
import NavBar from "@/components/NavBar/NavBar"
import { setupClient } from "@/util/api-client"
import { useRouteOpen } from "@/util/routes"
import { usePathname } from "next/navigation"
import { ThemeProvider } from "@mui/material/styles"
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google"
import React, { useCallback, useEffect, useState } from "react"
import { theme } from "./theme"
import "./constants.scss"
import styles from "./layout.module.scss"

const fontUi = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-ui",
})
const fontMono = JetBrains_Mono({
    subsets: ["latin"],
    weight: ["400", "500"],
    variable: "--font-mono",
})

const PAGES_TO_HIDE_NAVBAR: RegExp[] = [/^\/events\/[^/]+\/checkin$/]

export default function Layout({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        setupClient()
    }, [])

    const routeOpen = useRouteOpen()

    const [showNavbar, setShowNavbar] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const closeMenu = useCallback(() => setMenuOpen(false), [])

    const pathname = usePathname() || ""

    useEffect(() => {
        const hide = PAGES_TO_HIDE_NAVBAR.some((rx) => rx.test(pathname))
        setShowNavbar(!hide)
        setMenuOpen(false)
    }, [pathname])

    return (
        <html
            lang="en"
            className={`root ${fontUi.variable} ${fontMono.variable}`}
        >
            <link rel="icon" href="./favicon.png" sizes="any" />
            <title>{(routeOpen ? `${routeOpen} - ` : "") + "Admin Site"}</title>
            <body className={styles.body}>
                <ThemeProvider theme={theme}>
                    {showNavbar ? (
                        <Header onMenuClick={() => setMenuOpen((o) => !o)} />
                    ) : (
                        <></>
                    )}
                    <div className={styles.shell}>
                        {showNavbar ? (
                            <NavBar open={menuOpen} onClose={closeMenu} />
                        ) : (
                            <></>
                        )}
                        <main>{children}</main>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    )
}
