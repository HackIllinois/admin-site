"use client"
import { UserService } from "@/generated"
import { initialsOf } from "@/util/nav-groups"
import { faBars } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Image from "next/image"
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
                <Image
                    src="/hack_logo.png"
                    alt=""
                    width={673}
                    height={1001}
                    className={styles.logo}
                    aria-hidden="true"
                    priority
                    unoptimized
                />
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
