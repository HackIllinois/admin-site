import React, { useEffect, useState } from 'react'
import './style.scss'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { Modal, Button, Snackbar, Alert } from '@mui/material'
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid'
import { getRegistration, getRsvps, makeDecision } from '@/util/api'

const Admissions = () => {
    const [rows, setRows] = useState([])
    const [originalRows, setOriginalRows] = useState([])
    const [changedRows, setChangedRows] = useState([])
    const [cellModesModel, setCellModesModel] = useState({})
    const [open, setOpen] = useState(false)
    const [openRegistration, setOpenRegistration] = useState(false)
    const [registration, setRegistration] = useState({})
    const [clear, setClear] = useState(false)
    const [openSnackbar, setOpenSnackbar] = useState(false)

    useEffect(() => {
        getRsvps()
            .then((initialRows) => convertFromAPI(initialRows))
            .then((rowsToSet) => {
                setRows(rowsToSet)
                setOriginalRows(rowsToSet)
            })
    }, [])

    const convertFromAPI = (rsvps) => {
        const rowsToSet = rsvps.map((rsvp) => {
            return {
                id: rsvp.userId,
                userId: rsvp.userId,
                status: rsvp.admittedPro ? 'ACCEPTED_PRO' : rsvp.status,
                reimbursementValue: rsvp.reimbursementValue,
                response: rsvp.response,
            }
        })
        return rowsToSet
    }

    const convertToAPI = (rows) => {
        const rsvpsToSet = rows.map((row) => {
            return {
                userId: row.userId,
                admittedPro: row.status === 'ACCEPTED_PRO',
                status: row.status === 'ACCEPTED_PRO' ? 'ACCEPTED' : row.status,
                reimbursementValue: row.reimbursementValue,
                response: row.response,
                emailSent: false,
            }
        })
        return rsvpsToSet
    }

    const clearChanges = () => {
        setRows(originalRows)
        setChangedRows([])
        setClear(false)
    }

    const submitDecisions = () => {
        if (changedRows.length === 0) {
            alert('No changes to submit.')
            return
        }
        const rsvpUpdates = convertToAPI(changedRows)
        makeDecision(rsvpUpdates)
            .then(() => {
                setChangedRows([])
                setOriginalRows(rows)
                setOpenSnackbar(true)
            })
            .catch((error) => {
                if (error.status === 424) {
                    alert(
                        'Status updated successfully, but there was an error sending email! Please try again or talk to Web/API',
                    )
                    window.location.reload()
                } else {
                    alert(
                        'Error submitting decisions. Please refresh and try again.',
                    )
                }
            })
        setOpen(false)
    }

    const handleViewApplicationClick = (id) => () => {
        getRegistration(id).then((registration) => {
            setRegistration(registration)
            setOpenRegistration(true)
        })
    }

    const processRowUpdate = (newRow) => {
        setRows(rows.map((row) => (row.id === newRow.id ? newRow : row)))
        if (
            _.isEqual(
                originalRows.find((row) => row.id === newRow.id),
                newRow,
            )
        ) {
            setChangedRows(changedRows.filter((row) => row.id !== newRow.id))
        } else {
            if (!changedRows.find((row) => row.id === newRow.id)) {
                setChangedRows([...changedRows, newRow])
            }
        }
        return newRow
    }

    const columns = [
        { field: 'userId', headerName: 'User ID', width: 180, editable: false },
        {
            field: 'reimbursementValue',
            headerName: 'Reimbursement Value',
            type: 'number',
            width: 220,
            align: 'left',
            headerAlign: 'left',
            editable: true,
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 220,
            editable: true,
            type: 'singleSelect',
            valueOptions: [
                'TBD',
                'WAITLISTED',
                'REJECTED',
                'ACCEPTED',
                'ACCEPTED_PRO',
            ],
        },
        {
            field: 'response',
            headerName: 'Response',
            width: 220,
            editable: false,
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'View Application',
            width: 150,
            cellClassName: 'actions',
            getActions: ({ id }) => {
                return [
                    <GridActionsCellItem
                        icon={<VisibilityIcon />}
                        label="View Application"
                        onClick={handleViewApplicationClick(id)}
                        color="inherit"
                    />,
                ]
            },
        },
    ]

    return (
        <div className="admissions">
            <h1>Admissions</h1>
            <DataGrid
                loading={rows.length === 0}
                rows={rows}
                columns={columns}
                cellModesModel={cellModesModel}
                onCellModesModelChange={setCellModesModel}
                processRowUpdate={processRowUpdate}
                slotProps={{
                    toolbar: { setRows, setCellModesModel },
                }}
            />

            <div className="submitButton">
                <Snackbar
                    open={openSnackbar}
                    onClose={() => setOpenSnackbar(false)}
                    autoHideDuration={5000}
                >
                    <Alert
                        onClose={() => setOpenSnackbar(false)}
                        severity="success"
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        Decisions Successfully Submitted!
                    </Alert>
                </Snackbar>

                <Button
                    onClick={() => setClear(true)}
                    variant="contained"
                    sx={{ margin: 'auto' }}
                    color="error"
                >
                    Discard Changes
                </Button>
                <Button
                    onClick={() => setOpen(true)}
                    variant="contained"
                    sx={{ margin: 'auto' }}
                >
                    Save Changes
                </Button>
            </div>

            <Modal
                open={clear}
                onClose={() => setClear(false)}
                aria-labelledby="modal-modal-title2"
                aria-describedby="modal-modal-description2"
            >
                <div className="modal">
                    <h2>Are you sure you want to discard your changes?</h2>
                    <p>You will not be able to recover your changes.</p>
                    <div className="buttons">
                        <Button
                            onClick={() => setClear(false)}
                            variant="contained"
                            color="error"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => clearChanges()}
                            variant="contained"
                        >
                            Clear
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <div className="modal">
                    <h2>Are you sure you want to submit decisions?</h2>
                    <p>
                        Applicants will be emaild with status update upon
                        submit.
                    </p>
                    <div className="buttons">
                        <Button
                            onClick={() => setOpen(false)}
                            variant="contained"
                            color="error"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => submitDecisions()}
                            variant="contained"
                            color="success"
                        >
                            Submit
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                open={openRegistration}
                onClose={() => setOpenRegistration(false)}
                aria-labelledby="modal-modal-title3"
                aria-describedby="modal-modal-description3"
            >
                <div className="modal2">
                    {Object.keys(registration).map((key) => (
                        <p key={key}>
                            {key}: {registration[key].toString()}
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

export default Admissions
