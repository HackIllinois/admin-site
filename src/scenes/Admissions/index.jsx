import React, { useEffect } from "react";
import "./style.scss";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import {
    GridRowModes,
    DataGrid,
    GridActionsCellItem,
    GridRowEditStopReasons,
} from "@mui/x-data-grid";
import { getRsvps } from "util/api";

const Admissions = () => {
    const [rows, setRows] = React.useState([]);
    const [rowModesModel, setRowModesModel] = React.useState({});

    useEffect(() => {
        getRsvps()
            .then((initialRows) => convertFromAPI(initialRows))
            .then((rowsToSet) => {
                setRows(rowsToSet);
            });
    }, []);

    const convertFromAPI = (rsvps) => {
        const rowsToSet = rsvps.map((rsvp) => {
            return {
                id: rsvp._id,
                userId: rsvp.userId,
                status: rsvp.admittedPro ? "ACCEPTED_PRO" : rsvp.status,
                reimbursementValue: rsvp.reimbursementValue,
                response: rsvp.response,
            };
        });
        return rowsToSet;
    };

    const handleRowEditStop = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleEditClick = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.Edit },
        });
    };

    const handleSaveClick = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View },
        });
        console.log(rows.find((row) => row.id === id));
    };

    const handleViewApplicationClick = (id) => () => {
        console.log("View Application: " + id);
    };

    const handleCancelClick = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });

        const editedRow = rows.find((row) => row.id === id);
        if (editedRow.isNew) {
            setRows(rows.filter((row) => row.id !== id));
        }
    };

    const processRowUpdate = (newRow) => {
        const updatedRow = { ...newRow, isNew: false };
        setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
        return updatedRow;
    };

    const handleRowModesModelChange = (newRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const columns = [
        { field: "userId", headerName: "User ID", width: 180, editable: false },
        {
            field: "reimbursementValue",
            headerName: "Reimbursement Value",
            type: "number",
            width: 200,
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
                "ACCEPTED",
                "DECLINED",
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
            headerName: "Actions",
            width: 100,
            cellClassName: "actions",
            getActions: ({ id }) => {
                const isInEditMode =
                    rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon />}
                            label="Save"
                            sx={{
                                color: "primary.main",
                            }}
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon />}
                            label="Cancel"
                            className="textPrimary"
                            onClick={handleCancelClick(id)}
                            color="inherit"
                        />,
                    ];
                }

                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<VisibilityIcon />}
                        label="View Application"
                        onClick={handleViewApplicationClick(id)}
                        color="inherit"
                    />,
                ];
            },
        },
    ];

    return (
        <div className="admissions">
            <h1>Admissions</h1>
            <DataGrid
                rows={rows}
                columns={columns}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowModesModelChange={handleRowModesModelChange}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                slotProps={{
                    toolbar: { setRows, setRowModesModel },
                }}
            />
        </div>
    );
};

export default Admissions;
