"use client"
import React, { useEffect, useState } from "react"
import VisibilityIcon from "@mui/icons-material/Visibility"
import { Modal, Button } from "@mui/material"
import { DataGrid, GridActionsCellItem, GridColDef } from "@mui/x-data-grid"
import {
    AdmissionDecision,
    AdmissionService,
    RegistrationApplication,
    RegistrationService,
    UserId,
} from "@/generated"
import { handleError } from "@/util/api-client"
import styles from "./style.module.scss"

interface Row {
    id: string
    userId: string
    status: string
    reimbursementValue: number
    response: string
}

export default function Admissions() {
    const [rows, setRows] = useState<Row[]>([])
    const [cellModesModel, setCellModesModel] = useState({})
    const [openRegistration, setOpenRegistration] = useState(false)
    const [registration, setRegistration] =
        useState<RegistrationApplication | null>(null)

    useEffect(() => {
        AdmissionService.getAdmissionRsvpStaff()
            .then(handleError)
            .then((initialRows) => convertFromAPI(initialRows))
            .then(setRows)
    }, [])

    const convertFromAPI = (rsvps: AdmissionDecision[]) => {
        const rowsToSet = rsvps.map((rsvp) => {
            return {
                id: rsvp.userId,
                userId: rsvp.userId,
                status:
                    rsvp.status === "ACCEPTED" && rsvp.admittedPro
                        ? "ACCEPTED_PRO"
                        : rsvp.status,
                reimbursementValue: rsvp.reimbursementValue,
                response: rsvp.response,
            }
        })
        return rowsToSet
    }

    const handleViewApplicationClick = (id: UserId) => () => {
        RegistrationService.getRegistrationUseridById({ path: { id } })
            .then(handleError)
            .then((registration) => {
                setRegistration(registration)
                setOpenRegistration(true)
            })
    }

    const columns: GridColDef[] = [
        { field: "userId", headerName: "User ID", width: 180, editable: false },
        {
            field: "reimbursementValue",
            headerName: "Reimbursement Value",
            type: "number",
            width: 220,
            align: "left",
            headerAlign: "left",
            editable: true,
        },
        {
            field: "status",
            headerName: "Status",
            width: 220,
            editable: true,
            type: "singleSelect",
            valueOptions: [
                "TBD",
                "WAITLISTED",
                "REJECTED",
                "ACCEPTED",
                "ACCEPTED_PRO",
            ],
        },
        {
            field: "response",
            headerName: "Response",
            width: 220,
            editable: false,
        },
        {
            field: "actions",
            type: "actions",
            headerName: "View Application",
            width: 150,
            cellClassName: "actions",
            getActions: ({ id }) => {
                return [
                    <GridActionsCellItem
                        key={id}
                        icon={<VisibilityIcon />}
                        label="View Application"
                        onClick={handleViewApplicationClick(id as string)}
                        color="inherit"
                    />,
                ]
            },
        },
    ]

    return (
        <div className={styles.admissions}>
            <h1>Admissions</h1>
            <DataGrid
                loading={rows.length === 0}
                rows={rows}
                columns={columns}
                cellModesModel={cellModesModel}
                onCellModesModelChange={setCellModesModel}
            />

            <Modal
                open={openRegistration}
                onClose={() => setOpenRegistration(false)}
                aria-labelledby="modal-modal-title3"
                aria-describedby="modal-modal-description3"
            >
                <div className={styles.modal}>
                    {registration &&
                        Object.entries(registration).map(([key, value]) => (
                            <p key={key}>
                                {key}: {value}
                            </p>
                        ))}
                    <div className="buttons">
                        <Button
                            onClick={() => setOpenRegistration(false)}
                            variant="contained"
                            color="error"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
