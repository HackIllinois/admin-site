"use client"
import { UserService } from "@/generated"
import { initialsOf } from "@/util/nav-groups"
import { faBars } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useState } from "react"
import styles from "./Header.module.scss"

const environment =
    process.env.NEXT_PUBLIC_API_URL !== undefined ? "local" : "production"

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
    const [name, setName] = useState<string | undefined>()

    useEffect(() => {
        UserService.getUser().then((result) => {
            if (result.data) setName(result.data.name)
        })
    }, [])

    return (
        <header className={styles.header}>
            <div className={styles.brand}>
                <button
                    type="button"
                    className={styles.menuButton}
                    onClick={onMenuClick}
                    aria-label="Toggle navigation menu"
                    aria-controls="site-navigation"
                >
                    <FontAwesomeIcon icon={faBars} fixedWidth />
                </button>
                <svg
                    width="22"
                    height="26"
                    viewBox="0 0 22 26"
                    aria-hidden="true"
                >
                    <rect
                        x="2"
                        y="0"
                        width="18"
                        height="6"
                        rx="1"
                        fill="#F29A2E"
                    />
                    <rect x="7" y="6" width="8" height="14" fill="#E8692C" />
                    <rect
                        x="0"
                        y="20"
                        width="22"
                        height="6"
                        rx="1"
                        fill="#F29A2E"
                    />
                </svg>
                <span className={styles.title}>HackIllinois</span>
                <span className={styles.slash} aria-hidden="true">
                    /
                </span>
                <span className={styles.section}>Admin</span>
            </div>
            <div className={styles.status}>
                <span className={styles.environment}>
                    <span className={styles.dot} aria-hidden="true" />
                    adonix · {environment}
                </span>
                <span
                    className={styles.avatar}
                    title={name}
                    aria-label={name ? `Signed in as ${name}` : "User"}
                >
                    {initialsOf(name)}
                </span>
            </div>
        </header>
    )
}
