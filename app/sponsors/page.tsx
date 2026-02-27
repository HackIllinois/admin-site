"use client"

import Loading from "@/components/Loading"
import Unauthorized from "@/components/Unauthorized/Unauthorized"
import { Sponsor, SponsorService } from "@/generated"
import { handleError, useRoles } from "@/util/api-client"
import { faPlus, faSync } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useState } from "react"
import DeleteIcon from '@mui/icons-material/Delete';

import styles from "./styles.module.scss"

import {
    DataGrid,
    GridActionsCellItem,
    GridColDef,
    GridToolbarColumnsButton,
    GridToolbarContainer,
    GridToolbarFilterButton,
} from "@mui/x-data-grid"

interface SponsorAddCardProps {
    onAdd: () => void
}

function SponsorAddCard({ onAdd }: SponsorAddCardProps) {
    return (
        <div className={styles.card}>
            <div className={styles.add} onClick={onAdd}>
                <FontAwesomeIcon icon={faPlus}/>
                &nbsp; Add Sponsor 
            </div>
        </div>
    )
}

function GridToolbar({ refresh }: { refresh: () => void }) {
    return (
        <GridToolbarContainer
            sx={{ fontFamily: "Montserrat, Segoe UI, Roboto, sans-serif" }}
        >
            <GridToolbarColumnsButton
                slotProps={{
                    button: {
                        color: "inherit",
                    },
                }}
            />
            <GridToolbarFilterButton
                slotProps={{
                    button: {
                        color: "inherit",
                    },
                }}
            />
            <FontAwesomeIcon
                className={styles.refresh}
                icon={faSync}
                onClick={refresh}
            />
        </GridToolbarContainer>
    )
}


export default function Sponsors() {
    const [loading, setLoading] = useState(true)
    const roles = useRoles()
    const [sponsors, setSponsors] = useState<Sponsor[]>([])

    const isAdmin = roles.includes("ADMIN")

    const refresh = async () => {
        setLoading(true)
        await SponsorService.getSponsor()
            .then(handleError)
            .then((sponsors) => {
                setSponsors(sponsors)
                setLoading(false)
            })
    }

    useEffect(() => {
        if (!isAdmin) return
        refresh()
    }, [isAdmin])

    if (roles.length === 0) {
        return <Loading />
    }

    if (!isAdmin) {
        return <Unauthorized />
    }

    if (loading) {
        return <Loading />
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

     const columns: GridColDef[] = [
         { field: "email", headerName: "Email", width: 300, editable: false },
        { field: "userId", headerName: "User ID", width: 300, editable: false },
             {
            field: "actions",
            type: "actions",
            width: 150,
            cellClassName: "actions",
            getActions: ({ id }) => {
                return [
                    <GridActionsCellItem
                        key={id}
                        icon={<DeleteIcon />}
                        label="View Application"
                        onClick={async () => {
                            await deleteSponsor(id as string)
                            await refresh()
                        }}
                        color="inherit"
                    />,
                ]
            },
        },
     ]

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>Sponsors</div>
                <FontAwesomeIcon
                    className={styles.refresh}
                    icon={faSync}
                    onClick={refresh}
                />
            </div>
            
            <div className={styles.sponsors} >

                        <DataGrid
                        rows={sponsors}
                        columns={columns}
                        getRowId={(row) => row.userId}
                        sx={{fontFamily: 'Arial'}}
                        slots={{
                            toolbar: () => <GridToolbar refresh={refresh} />,
                        }}
                    />
                    
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
