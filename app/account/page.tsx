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

import { loadFixedUserList, FixedUserList } from "@/app/lib/api/account"

export default function Account() {
    const [user, setUser] = useState<UserInfo | null>(null)
    const roles = useRoles()
    const isLocal = process.env.NEXT_PUBLIC_API_URL !== undefined

    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<UserInfo[]>([])

    const [fixedUsers, setFixedUsers] = useState<FixedUserList | null>(null)

    const [copySuccess, setCopySuccess] = useState(false)
    const logOut = () => {
        AuthService.postAuthLogout().then(() =>
            window.location.replace("/admissions"),
        )
    }

    const searchUsers = async (query: string) => {
        setSearchQuery(query)
        if (query.length < 2) {
            setSearchResults([])
            return
        }
        const res = await fetch(
            `/api/auth/dev/users/?q=${encodeURIComponent(query)}`,
        )
        const users = await res.json()
        setSearchResults(users)
    }

    const devLogin = async (userId: string) => {
        await fetch(`/api/auth/dev/login/${userId}/`)
        window.location.replace("/admissions")
    }

    useEffect(() => {
        UserService.getUser()
            .then(handleError)
            .then((user) => setUser(user))
            .catch(() => {})
    }, [])

    if (!user || roles.length === 0) {
        if (isLocal) {
            if (!fixedUsers) {
                loadFixedUserList()
                    .then(setFixedUsers)
                    .catch(() => {})
                return (
                    <div style={{ padding: 40 }}>
                        <h2>Loading users...</h2>
                    </div>
                )
            }
            return (
                <div style={{ padding: 40, maxWidth: 500 }}>
                    <h2>Login</h2>

                    {fixedUsers &&
                        Object.entries(fixedUsers).map(
                            ([role, users]) =>
                                users.length > 0 && (
                                    <div
                                        key={role}
                                        style={{ marginBottom: 16 }}
                                    >
                                        <h3
                                            style={{
                                                textTransform: "uppercase",
                                                fontSize: 14,
                                                color: "#505f85",
                                            }}
                                        >
                                            {role}
                                        </h3>
                                        {users.map((u: UserInfo) => (
                                            <div
                                                key={u.userId}
                                                onClick={() =>
                                                    devLogin(u.userId)
                                                }
                                                style={{
                                                    padding: 8,
                                                    cursor: "pointer",
                                                    borderBottom:
                                                        "1px solid #eee",
                                                }}
                                                onMouseEnter={(e) =>
                                                    (e.currentTarget.style.background =
                                                        "#f0f0f0")
                                                }
                                                onMouseLeave={(e) =>
                                                    (e.currentTarget.style.background =
                                                        "white")
                                                }
                                            >
                                                <strong>{u.name}</strong>
                                                <span
                                                    style={{
                                                        fontSize: 12,
                                                        color: "#666",
                                                        marginLeft: 8,
                                                    }}
                                                >
                                                    {u.email}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ),
                        )}

                    <h3 style={{ marginTop: 24 }}>Or search by name:</h3>
                    <input
                        value={searchQuery}
                        onChange={(e) => searchUsers(e.target.value)}
                        placeholder="Start typing a name..."
                        style={{ width: "100%", padding: 8, fontSize: 16 }}
                    />
                    {searchResults.length > 0 && (
                        <div style={{ border: "1px solid #ccc", marginTop: 4 }}>
                            {searchResults.map((u) => (
                                <div
                                    key={u.userId}
                                    onClick={() => devLogin(u.userId)}
                                    style={{
                                        padding: 10,
                                        cursor: "pointer",
                                        borderBottom: "1px solid #eee",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.background =
                                            "#f0f0f0")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.background =
                                            "white")
                                    }
                                >
                                    <strong>{u.name}</strong>
                                    <br />
                                    <span
                                        style={{ fontSize: 12, color: "#666" }}
                                    >
                                        {u.email}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                    {searchQuery.length >= 2 && searchResults.length === 0 && (
                        <p style={{ color: "#999" }}>No users found</p>
                    )}
                </div>
            )
        }
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
                <div className={styles.dataItem}>
                    <div className={styles.label}>
                        <FontAwesomeIcon icon={faUser} />
                        Name
                    </div>
                    {user.name}
                </div>
                <div className={styles.dataItem}>
                    <div className={styles.label}>
                        <FontAwesomeIcon icon={faIdBadge} />
                        User Id
                    </div>
                    {user.userId}
                </div>
                <div className={styles.dataItem}>
                    <div className={styles.label}>
                        <FontAwesomeIcon icon={faEnvelope} />
                        Email
                    </div>
                    {user.email}
                </div>
                <div className={styles.roles}>
                    <div className={styles.label}>
                        <FontAwesomeIcon icon={faKey} />
                        Roles
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
