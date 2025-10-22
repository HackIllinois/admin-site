// AttendanceView.tsx
'use client'

import Loading from '@/components/Loading'
import { AuthService, UserInfo, UserService } from '@/generated'
import {
    Box,
    modalClasses,
    Typography
} from '@mui/material'

import {
    GridActionsCellItem,
} from "@mui/x-data-grid"
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import UserProfileModal from "./UserProfileModal";


import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
    DataGrid,
    GridColDef
} from "@mui/x-data-grid"


const theme = createTheme({
  typography: {
    fontFamily: 'Montserrat, Segoe UI, Roboto, sans-serif',
  },
})

export const ROLES = [
  "ADMIN",
  "STAFF",
  "MENTOR",
  "APPLICANT",
  "ATTENDEE",
  "USER",
  "SPONSOR",
  "BLOBSTORE",
  "PRO"
] as const;

export type Role = typeof ROLES[number];


export default function AttendanceView() {

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [filter, setFilter] = useState<Role>("STAFF");

  const [ModalOpen, setModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const openModal = (id: string) => {
  setSelectedUserId(id);
  setModalOpen(true);
  };

  const closeModal = () => {
  setModalOpen(false);
  setSelectedUserId(null);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };



  const handleLoadUsers = async () => {
    setLoading(true);
    const userData = await AuthService.getAuthUserByRole({
        path: { role: filter }
    });

    if (userData.data) {
      setUsers(userData.data.userInfo);
    }
    setLoading(false);
  }

  useEffect(() => {
    handleLoadUsers();
  }, [filter])


  const columns: GridColDef[] = [
    { field: "userId", headerName: "User ID", width: 300, editable: false },
    { field: "name", headerName: "Name", width: 300, editable: false },
         { field: "email", headerName: "Email", width: 300, editable: false },
             {
            field: "actions",
            type: "actions",
            width: 100,
            cellClassName: "actions",
            getActions: ({ row }) => {
              const { userId } = row as { userId: string };
                return [
                    <GridActionsCellItem
                        key={userId}
                        icon={<MoreVertIcon />}
                        label="Edit User"
                        onClick={() => openModal(userId)}
                        color="inherit"
                    />,
                ]
            },
        },
     ]



  return (
    <ThemeProvider theme={theme}>
      <Box p={2}>


        <Box p={2} display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h4" gutterBottom>
          Users
        </Typography>
        <div>
      <Button
        id="simple-button"
        aria-controls={open ? 'simple-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        variant="contained"
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
      >
        Role
      </Button>

      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'simple-button',
        }}
      >
              {ROLES.map((role) => {
          const formattedRole = role.charAt(0) + role.slice(1).toLowerCase();
          return (
            <MenuItem
              key={role}
              onClick={() => {
                setFilter(role as Role);
                handleClose();
              }}
              selected={filter === role}
            >
              {formattedRole}
            </MenuItem>
          );
        })}
      </Menu>
    </div>
    </Box>
        {loading && (
            <Loading />
        )}
        {users.length > 0 ? (
          <>
          <DataGrid
                        rows={users}
                        columns={columns}
                        getRowId={(row) => row.userId}
                        sx={{fontFamily: 'Arial'}}
                    />


<UserProfileModal
  open={ModalOpen}
  onClose={closeModal}
  userId={selectedUserId}
/>
</>
            
        ) : (
          !loading && (
            <Typography variant="body1" color="text.secondary">
              No users loaded yet.
            </Typography>
          )
        )}
      </Box>
    </ThemeProvider>
  )
}
