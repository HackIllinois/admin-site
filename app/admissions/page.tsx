"use client"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import VisibilityIcon from "@mui/icons-material/Visibility"
import { Modal, Backdrop, Fade, IconButton } from "@mui/material"
import {
    DataGrid,
    GridActionsCellItem,
    GridColDef,
    GridToolbarColumnsButton,
    GridToolbarContainer,
    GridToolbarFilterButton,
} from "@mui/x-data-grid"
import {
    AdmissionDecision,
    AdmissionService,
    RegistrationApplicationDraft,
    RegistrationService,
    UserId,
} from "@/generated"
import { handleError } from "@/util/api-client"
import styles from "./style.module.scss"
import { faSync } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Loading from "@/components/Loading"
import { Close } from "@mui/icons-material"

interface Row {
    id: string
    userId: string
    status: string
    reimbursementValue: number
    response: string
}


const FIELDS: Record<string, string> = {
    _id: 'ID',
    userId: 'User ID',
    hasSubmitted: 'Has Submitted',
    preferredName: 'Preferred Name',
    legalName: 'Legal Name',
    emailAddress: 'Email Address',
    gender: 'Gender',
    race: 'Race / Ethnicity',
    requestedTravelReimbursement: 'Requested Travel Reimbursement',
    location: 'Location',
    degree: 'Degree',
    major: 'Major',
    minor: 'Minor',
    university: 'University',
    gradYear: 'Graduation Year',
    hackInterest: 'Hack Interest',
    hackOutreach: 'Hack Outreach',
    dietaryRestrictions: 'Dietary Restrictions',
    hackEssay1: 'Hack Essay 1',
    hackEssay2: 'Hack Essay 2',
    optionalEssay: 'Optional Essay',
    proEssay: 'Pro Essay',
    considerForGeneral: 'Consider for General Tracks'
};



function GridToolbar({ refresh }: { refresh: () => void }) {
    return (
        <GridToolbarContainer
            sx={{fontFamily: 'Montserrat, Segoe UI, Roboto, sans-serif'}}
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
            <div className={styles.refresh} onClick={refresh}>
                <FontAwesomeIcon icon={faSync} />
            </div>
        </GridToolbarContainer>
    )
}

export default function Admissions() {
    const [loading, setLoading] = useState(true)
    const [rows, setRows] = useState<Row[]>([])
    const [cellModesModel, setCellModesModel] = useState({})
    const [openRegistration, setOpenRegistration] = useState(false)
    const [registration, setRegistration] =
        useState<RegistrationApplicationDraft | null>(null)

    const refresh = useCallback(async () => {
        setLoading(true)
        const rows = await AdmissionService.getAdmissionRsvpStaff()
            .then(handleError)
            .then((initialRows) => convertFromAPI(initialRows))
        setRows(rows)
        setLoading(false)
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

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
                console.log('registration', registration);
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
                        disabled
                    />,
                ]
            },
        },
    ]

    const applicantInfo = [
        ['_id',
        'userId',
        'hasSubmitted'],
        ['preferredName',
        'legalName',
        'emailAddress'],
        ['gender',
        'race'],
        ['requestedTravelReimbursement',
        'location'],
        ['degree',
        'major',
        'minor'],
        ['university',
        'gradYear'],
        ['hackInterest',
        'hackOutreach',
        'dietaryRestrictions'],
    ];

    const essayFields = [
        'hackEssay1',
        'hackEssay2',
        'optionalEssay',
        'proEssay',
        'considerForGeneral'
    ];

    if (loading) {
        return <Loading />
    }

    return (
        <div className={styles.admissions}>
            <h1>Admissions</h1>
            <DataGrid
                rows={rows}
                columns={columns}
                cellModesModel={cellModesModel}
                onCellModesModelChange={setCellModesModel}
                sx={{fontFamily: 'Montserrat'}}
                slots={{
                    toolbar: () => <GridToolbar refresh={refresh} />,
                }}
            />

            <Modal
                open={openRegistration}
                onClose={() => setOpenRegistration(false)}
                aria-labelledby="modal-modal-title3"
                aria-describedby="modal-modal-description3"

                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                backdrop: {
                    timeout: 500,
                },
                }}
            >
                <Fade in={openRegistration}>
                    <div className={styles.modal}>
                        {registration && (
                            <>
                            <div className={styles.modalHeader}>
                                <h2>Registration Details</h2>
                                
                                <IconButton
                                aria-label="close"
                                onClick={() => setOpenRegistration(false)}
                                sx={{
                                    position: 'absolute',
                                    right: 8,
                                    top: 8,
                                    color: (theme) => theme.palette.grey[500],
                                }}
                                >
                                    <Close />
                                </IconButton>
                            </div>
                            <div className={styles.registrationDetails}>
                                <div className={styles.applicantInfo}>
                                    {applicantInfo.map((fieldGroup: string[]) => (
                                        <div className={styles.fieldGroup} key={fieldGroup.join('-')}>
                                            {fieldGroup.map((field: string) => (
                                                <AdmissionModalField
                                                    key={field}
                                                    field={field as keyof RegistrationApplicationDraft}
                                                    value={registration[field as keyof RegistrationApplicationDraft] ?? null}
                                                />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                                
                                <h3>Essays</h3>
                                {essayFields.map((field) => (
                                    <AdmissionModalField
                                        key={field}
                                        field={field as keyof RegistrationApplicationDraft}
                                        value={registration[field as keyof RegistrationApplicationDraft] ?? null}
                                    />
                                ))}
                            </div>
                            </>
                        )}
                    </div>
                </Fade>
            </Modal>
        </div>
    )
}

type AdmissionModalFieldProps = {
    field: keyof RegistrationApplicationDraft,
    value: RegistrationApplicationDraft[keyof RegistrationApplicationDraft] | null,
}

function AdmissionModalField({
    field,
    value
}: AdmissionModalFieldProps) {
    const displayedValue = useMemo(() => {
        if (!value) {
            return 'N/A';
        }
        if (typeof value === 'boolean') {
            return value ? "Yes" : "No";
        }
        if (typeof value === 'object' && value !== null) {
            return value.length > 0 ? value.join(', ') : 'N/A'; // Assuming value is an array or object
        }
        return value;
    }, [value]);

    return (
        <div key={field} className={styles.field}>
            <p className={styles.fieldName}>
                {FIELDS[field] ?? field}
            </p>
            <p className={styles.fieldValue}>
                {displayedValue ?? "-"}
            </p>
        </div>
    )
}