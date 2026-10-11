"use client"

import Link from "next/link"
import { Tab, Tabs } from "@mui/material"
import styles from "./style.module.scss"

export default function Admissions() {
    return (
        <div className={styles.admissions}>
            <Tabs value={false} aria-label="Admissions sections">
                <Tab
                    className={styles.portalTab}
                    label="Application Portal"
                    value="/application-portal"
                    component={Link}
                    href="/application-portal"
                />
            </Tabs>
        </div>
    )
}
