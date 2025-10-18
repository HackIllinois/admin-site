// AttendanceView.tsx
'use client'

import Loading from '@/components/Loading'
import { AuthService, UserInfo, UserService } from '@/generated'
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { useEffect, useState } from 'react'

const theme = createTheme({
  typography: {
    fontFamily: 'Montserrat, Arial, sans-serif',
  },
})

export default function AttendanceView() {
    const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserInfo[]>([]);

  const handleLoadUsers = async () => {
    setLoading(true);
    const users = await AuthService.getAuthRolesListByRole({
        path: {
            role: 'STAFF'
        }
    });
    const userIds = users.data?.userIds || [];

    const userInfos: UserInfo[] = [];

    for (const userId of userIds) {
        const userInfo = await UserService.getUserById({
            path: {
                id: userId
            }
        });
        if (userInfo.data) {
            userInfos.push(userInfo.data);
        }
    }


    console.log('userInfos', userInfos);


    setUsers(userInfos);
    setLoading(false);
  }

  useEffect(() => {
    handleLoadUsers();
  }, [])


  return (
    <ThemeProvider theme={theme}>
      <Box p={2}>
        <Typography variant="h4" gutterBottom>
          Users
        </Typography>
        {loading && (
            <Loading />
        )}
        {users.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell>{user.userId}</TableCell>
                    <TableCell>{user.name || '—'}</TableCell>
                    <TableCell>{user.email || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
