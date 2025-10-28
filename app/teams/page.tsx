'use client'
import { useEffect, useState, useCallback } from 'react'
import Loading from '@/components/Loading'
import { Box } from '@mui/material';
import { testData } from "./testData";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PeopleIcon from '@mui/icons-material/People';
import IconButton from '@mui/material/IconButton';
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import TeamModal from './teamModal';


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

export async function fetchTeams() {
  await new Promise((r) => setTimeout(r, 500));
  return testData;
}

export default function Teams() {
const [link, setLink] = useState("");
const [active, setActive] = useState(false);
const [loading, setLoading] = useState(true);
const [teams, setTeams] = useState<Team[]>([]);
const [teamModalOpen, setTeamModalOpen] = useState(false);
const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
const [hover, setHover] = useState(false);



const closeModal = () => {
  setTeamModalOpen(false);
  setSelectedTeam(null);
  };

  const openModal = (team: Team) => {
  setSelectedTeam(team);
  setTeamModalOpen(true);
  };


//test data 
useEffect(() => {

  const loadTeams = async () => {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 500)); 
      const data = testData;

      setTeams(data.teams);
      setLoading(false);
  };

  loadTeams();
}, []);


const teamMemberCount = (t: Team) =>
  t.users.length + (t.subteams?.reduce((sum, s) => sum + s.users.length, 0) ?? 0);

if(loading) return <Loading/>;

const handleAdd = async () => {
  const newTeam = prompt("Enter new team name:");
  if(!newTeam) return;
};



const subteamMemberCount = (s: Subteam) => s.users.length;


    return(

    <div style={{padding:"1.5rem"}}>
    <h1 style={{marginTop:0, marginBottom:"2rem"}}>Teams</h1>

                    <List sx={{ width: '100%', bgcolor: 'background.paper', display:"flex", flexDirection: 'column', gap: 1 }}>
                        {teams.map((team) => (
                                <ListItem key={team.id}
                                sx={{border: 1, borderColor: 'divider', borderRadius: 1, fontFamily: 'font-family: Arial, Helvetica, sans-serif;'}}
                                    secondaryAction={
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 3}}>
                                            <Box sx={{display: { xs: 'none', sm: 'flex' } ,  alignItems: "center" }}>
                                                {teamMemberCount(team)} Members &nbsp;
                                                <PeopleIcon />
                                            </Box>
                                            <IconButton edge="end" onClick={() => {
                                                openModal(team);
                                            }}
                                            >
                                                <MoreVertIcon />
                                            </IconButton>
                                        </Box>
                                    }
                                >
                                    <ListItemText primary={team.name}
                                    slotProps={{
                                        primary: {
                                            fontFamily: 'font-family: Arial, Helvetica, sans-serif;'
                                        }
                                    }}/>
                                </ListItem>
                        ))}
                </List>

                <TeamModal
  open={teamModalOpen}
  onClose={closeModal}
  //need to send the team as a string (call API for team members within Modal)
  team = {selectedTeam}
/>
  <div
  onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={handleAdd}
    style={{
      padding: "10px 20px",
      display: "flex",
      marginTop: "20px",
      justifyContent: "center",

      border: "2px solid #505f85",
      borderRadius: 5,
      fontFamily: "inherit",
      fontWeight: "bold",
      cursor: "pointer",
      transition: "color 0.2s, background-color 0.2s",
      backgroundColor: hover ? "#505f85" : "transparent",
        color: hover ? "white" : "#505f85",
    }}
  >
    <FontAwesomeIcon icon={faPlus} />
    <span style={{ marginLeft: 8 }}>Add Team</span>
  </div>
    </div>
    );

}