"use client"
import Loading from "@/components/Loading"
import { AuthService, UserInfo, UserService } from "@/generated"
import { handleError, useRoles } from "@/util/api-client"
import { useEffect, useState } from "react"

import styles from "./styles.module.scss"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faArrowRightToBracket,
    faEnvelope,
    faIdBadge,
    faKey,
    faUser,
} from "@fortawesome/free-solid-svg-icons"

export default function Account() {
    const [user, setUser] = useState<UserInfo | null>(null)
    const roles = useRoles()

    const [copySuccess, setCopySuccess] = useState(false)
    const logOut = () => {
        AuthService.postAuthLogout().then(() => window.location.reload())
    }

    useEffect(() => {
        UserService.getUser()
            .then(handleError)
            .then((user) => setUser(user))
    }, [])

    if (!user || roles.length === 0) {
        return <Loading />
    }

    function copyTokenToClipboard() {
        AuthService.getAuthToken()
            .then(handleError)
            .then(({ jwt }) => {
                navigator.clipboard
                    .writeText(jwt)
                    .then(() => {
                        setCopySuccess(true)
                        setTimeout(() => setCopySuccess(false), 1000)
                    })
                    .catch(() => alert("Failed to copy"))
            })
    }

    return (
        <div className={styles.container}>
            <div className={styles.title}>
                <h2>Account</h2>
            </div>
            <div className={styles.account}>
                <div className={styles.name}>
                    <div className={styles.label}>
                        <FontAwesomeIcon icon={faUser} />
                        Name:
                    </div>
                    {user.name}
                </div>
                <div className={styles["user-id"]}>
                    <div className={styles.label}>
                        <FontAwesomeIcon icon={faIdBadge} />
                        User Id:
                    </div>
                    {user.userId}
                </div>
                <div className={styles.email}>
                    <div className={styles.label}>
                        <FontAwesomeIcon icon={faEnvelope} />
                        Email:
                    </div>
                    {user.email}
                </div>
                <div className={styles.roles}>
                    <div className={styles.label}>
                        <FontAwesomeIcon icon={faKey} />
                        Roles:
                    </div>
                    {roles.map((role) => (
                        <div
                            className={styles.role + " " + styles[role]}
                            key={role}
                        >
                            {role}
                        </div>
                    ))}
                </div>
                <div className={styles.actions}>
                    <button
                        className={copySuccess ? styles.success : ""}
                        onClick={copyTokenToClipboard}
                    >
                        <FontAwesomeIcon icon={faKey} /> Copy Token
                    </button>
                    <button className={styles["log-out"]} onClick={logOut}>
                        <FontAwesomeIcon icon={faArrowRightToBracket} /> Log Out
                    </button>
                </div>
            </div>
        </div>
    )
}
