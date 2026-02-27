"use client"

import Loading from "@/components/Loading"
import { VersionService } from "@/generated"
import { handleError, useRoles } from "@/util/api-client"
import { faEdit, faSync } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useState } from "react"

import styles from "./styles.module.scss"

export default function Version() {
    const roles = useRoles()
    const [androidVersion, setAndroidVersion] = useState<string | null>(null)
    const [iosVersion, setIosVersion] = useState<string | null>(null)

    const isAdmin = roles.includes("ADMIN")

    const refresh = async () => {
        setAndroidVersion(null)
        setIosVersion(null)
        const [androidVersion, iosVersion] = await Promise.all([
            VersionService.getVersionAndroid().then(handleError),
            VersionService.getVersionIos().then(handleError),
        ])
        setAndroidVersion(androidVersion.version)
        setIosVersion(iosVersion.version)
    }

    async function editAndroidVersion() {
        if (!isAdmin) return

        const version = prompt("Enter android version:", androidVersion ?? "")
        if (!version) return

        await VersionService.postVersionAndroidByVersion({ path: { version } })
        await refresh()
    }

    async function editIosVersion() {
        if (!isAdmin) return

        const version = prompt("Enter ios version:", iosVersion ?? "")
        if (!version) return

        await VersionService.postVersionIosByVersion({ path: { version } })
        await refresh()
    }

    useEffect(() => {
        refresh()
    }, [])

    if (!androidVersion || !iosVersion) {
        return <Loading />
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>Version</div>
                <FontAwesomeIcon
                    className={styles.refresh}
                    icon={faSync}
                    onClick={refresh}
                />
            </div>
            <div className={styles.versions}>
                <div className={styles.version}>
                    <div className={styles.name}>Android Version:</div>
                    <div className={styles.value}>{androidVersion}</div>
                    <div
                        className={
                            styles.edit +
                            " " +
                            (!isAdmin ? styles.disabled : "")
                        }
                        onClick={editAndroidVersion}
                    >
                        <FontAwesomeIcon icon={faEdit}></FontAwesomeIcon>
                    </div>
                </div>
                <div className={styles.version}>
                    <div className={styles.name}>iOS Version:</div>
                    <div className={styles.value}>{iosVersion}</div>
                    <div
                        className={
                            styles.edit +
                            " " +
                            (!isAdmin ? styles.disabled : "")
                        }
                        onClick={editIosVersion}
                    >
                        <FontAwesomeIcon icon={faEdit}></FontAwesomeIcon>
                    </div>
                </div>
                <p>
                    This version is used to know when to prompt to update the
                    app.
                    <br />
                    <br />
                    Note that{" "}
                    <b>
                        entering the wrong version will make the apps
                        dysfunctional
                    </b>{" "}
                    due to trying to update to a non-existent version
                    infinitely. Please make sure the version is pushed and live
                    on the store (not in testing or development) before changing
                    it here.
                </p>
            </div>
        </div>
    )
}
