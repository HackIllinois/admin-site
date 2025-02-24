"use client"

import Loading from "@/components/Loading"
import Unauthorized from "@/components/Unauthorized/Unauthorized"
import { Sponsor, SponsorService } from "@/generated"
import { handleError, useRoles } from "@/util/api-client"
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useState } from "react"

import styles from "./styles.module.scss"

interface SponsorCardProps {
    sponsor: Sponsor
    onDelete: () => void
}

function SponsorCard({ sponsor, onDelete }: SponsorCardProps) {
    return (
        <div className={styles.card}>
            <div className={styles.email}>{sponsor.email}</div>
            <div className={styles.delete} onClick={onDelete}>
                <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon>
            </div>
        </div>
    )
}

interface SponsorAddCardProps {
    onAdd: () => void
}

function SponsorAddCard({ onAdd }: SponsorAddCardProps) {
    return (
        <div className={styles.card} onClick={onAdd}>
            <div className={styles.add}>
                <FontAwesomeIcon icon={faPlus}></FontAwesomeIcon>
            </div>
        </div>
    )
}

export default function Sponsors() {
    const roles = useRoles()
    const [sponsors, setSponsors] = useState<Sponsor[] | null>(null)

    const isAdmin = roles.includes("ADMIN")

    const refresh = async () =>
        await SponsorService.getSponsor()
            .then(handleError)
            .then((sponsors) => {
                setSponsors(sponsors)
            })

    useEffect(() => {
        if (!isAdmin) return
        refresh()
    }, [isAdmin])

    if (roles.length === 0 || sponsors === null) {
        return <Loading />
    }

    if (!isAdmin) {
        return <Unauthorized />
    }

    async function createSponsor() {
        const email = prompt("Enter email:")
        if (!email) {
            return
        }
        await SponsorService.postSponsor({ body: { email } })
    }

    async function deleteSponsor(userId: string) {
        await SponsorService.deleteSponsor({ body: { userId } })
    }

    return (
        <div className={styles.container}>
            <div className={styles.title}>Sponsors</div>
            <div className={styles.sponsors}>
                {sponsors.map((sponsor) => (
                    <SponsorCard
                        key={sponsor.userId}
                        sponsor={sponsor}
                        onDelete={async () => {
                            await deleteSponsor(sponsor.userId)
                            await refresh()
                        }}
                    />
                ))}
                <SponsorAddCard
                    onAdd={async () => {
                        await createSponsor()
                        await refresh()
                    }}
                />
            </div>
        </div>
    )
}
