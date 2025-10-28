import { FC, useState, useEffect, useLayoutEffect} from "react";
import {
  Modal, Box, Stack, Typography, IconButton, Button, Divider
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  Autocomplete, TextField
} from "@mui/material";
import { AuthService } from '@/generated'

type Props = {
  open: boolean;
  onClose: () => void;
  team: Team | null;
};

type User = {
  userId: string;
  name: string;
  email: string;
};

type Subteam = {
  id: string;
  name: string;
  users: User[];
};

type Team = {
  id: string;
  name: string;
  users: User[];
  subteams?: Subteam[];
};

const TeamModal: FC<Props> = ({ open, onClose, team}) => {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);



  const handleLoadUsers = async () => {
    setLoading(true);
    const userData = await AuthService.getAuthUserByRole({
        path: { role: "STAFF" }
    });

    if (userData.data) {
      setAllUsers(userData.data.userInfo);
      setLoading(false);
    }
  }


  useEffect(() => {
    setMembers(team?.users ?? []);
    handleLoadUsers();
  }, [team, open]);



  return (
    <Modal open={open} onClose={onClose}>
      <Box
        onClick={onClose}
        sx={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom:"30vh"
        }}
      >
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{
            position: "relative",
            bgcolor: "background.paper",
            p: 2,
            width: { xs: "90vw", sm: 700 },
            maxHeight: "93vh",
            overflow: "auto",
            borderRadius: 1,
            boxShadow: 6,
          }}
        >
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" sx={{ mb: 1 }}>
            {team?.name}
          </Typography>

          <Autocomplete
            multiple
            disableClearable
            options={allUsers}
            value={members}
            onChange={(_event, newValue) => setMembers(newValue)}
            getOptionLabel={(u) => u.name}
            isOptionEqualToValue={(a, b) => a.userId === b.userId}
            renderInput={(params) => (
              <TextField {...params} label="Team Members" placeholder="Select..." />
            )}
            sx={{ width: "100%", height:"fit-content", marginTop:"3vh", marginBottom:"3vh"}}
          />


          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
  <Button
    color="error"
    variant="outlined"
    disabled={loading}
    //API call for deleting team
    onClick={() => console.log("team deleted")}>
    Delete Team
  </Button>

  <Stack direction="row" spacing={1}>
    <Button onClick={onClose} variant="outlined" disabled={loading}>
      Cancel
    </Button>
    {/* API call for adjusting roles */}
    <Button variant="contained" disabled={loading}>
      Save
    </Button>
  </Stack>
</Stack>

        </Box>
      </Box>
    </Modal>
  );
};

export default TeamModal;
