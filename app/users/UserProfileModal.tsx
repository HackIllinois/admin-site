import { FC, useEffect, useState } from "react";
import {
  Modal, Box, Stack, Typography, IconButton, Button,
  TextField, Avatar, Checkbox, FormGroup, FormControlLabel, Radio, RadioGroup
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Loading from '@/components/Loading'
import { AuthService, UserService } from '@/generated'
import { profile } from "console";

export const ROLES = [
  "ADMIN","STAFF","MENTOR","APPLICANT","ATTENDEE","USER","SPONSOR","BLOBSTORE","PRO"
] as const;
export type Role = typeof ROLES[number];


export const TITLES = ["CO-DIRECTOR","SYSTEMS LEAD","API LEAD","MOBILE LEAD","WEB LEAD", "API", "MOBILE", "WEB", "EXPERIENCE LEAD",
  "EXPERIENCE", "DESIGN LEAD", "DESIGN", "MARKETING LEAD", "MARKETING", "OUTREACH LEAD", "OUTREACH"
] as const;
export type Title = typeof TITLES[number];


type Props = {
  open: boolean;
  onClose: () => void;
  userId: string | null;
};

const UserProfileModal: FC<Props> = ({ open, onClose, userId }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [originalRoles, setOriginalRoles] = useState<Role[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emoji, setEmoji] = useState("");
  const [quote, setQuote] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState<Title | null>(null);




    const getUserData = async (userId: string) => {
      setLoading(true);
      // console.log(userId)
      const userData = await UserService.getUserById({
          path: { id: userId }
      });
  
      if (userData.data) {
        // console.log(userData.data)
        setName(userData.data.name);
        setEmail(userData.data.email);
      }


      const userRoles = await AuthService.getAuthRolesById({
        path: { id: userId }
      })

      if (userRoles.data) {
        setRoles(userRoles.data.roles);
        setOriginalRoles(userRoles.data.roles);
      }

      setLoading(false);
    }
  
    useEffect(() => {
      if (!userId) return; 
      getUserData(userId);
    }, [open, userId])


   

  // preview URL
  useEffect(() => {
    if (!photoFile) {
      setPhotoUrl(null);
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  const handleEmojiChange = (v: string) => {
    const trimmed = v.trim();
    if (!trimmed) return setEmoji("");
    const first = Array.from(trimmed)[0] ?? "";
    setEmoji(first);
  };

 const toggleRole = (r: Role) => {
  setRoles((prev) => {
    const alreadySelected = prev.includes(r);
    if (alreadySelected) {
      const filtered = prev.filter((role) => role !== r);
      return filtered;
    } else {
      const added = [...prev, r];
      return added;
    }
  });
};

 function ProcessRoleChanges(original: Role[], current: Role[]) {
      const add = current.filter(r => !original.includes(r));
      const remove = original.filter(r => !current.includes(r));
      return { add, remove };
    }

  const handleSave = async () => {
    if (!userId) return;


    //for testing
    const payload = { userId, roles, title, emoji, quote, photoFile };
    console.log("User modal payload:", payload);



    const { add, remove} = ProcessRoleChanges(originalRoles, roles);
    
    await Promise.all([
      ...add.map(roletoadd =>
        AuthService.putAuthRolesByIdByRole({ 
          path: {
                  id: userId,
                  role: roletoadd
          }
         })
      ),
      ...remove.map(roletoremove =>
        AuthService.deleteAuthRolesByIdByRole({ 
          path: {
                  id: userId,
                  role: roletoremove
          }
        })
      ),
    ]);


    onClose();
  };

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
        {loading && (<Loading />)}
    
    
                    {!loading && (
                      <>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" sx={{ mb: 1 }}>
            Edit User
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 1 }}>
            <Box flex={1}>
              <Typography variant="subtitle2">User ID</Typography>
              <Typography>{userId}</Typography>
            </Box>
            <Box flex={1}>
              <Typography variant="subtitle2">Name</Typography>
              <Typography>{name}</Typography>
            </Box>
            <Box flex={1}>
              <Typography variant="subtitle2">Email</Typography>
              <Typography>{email}</Typography>
            </Box>
          </Stack>

          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2">Roles</Typography>
            <FormGroup row>
              {ROLES.map((r) => (
                <FormControlLabel
                  key={r}
                  control={
                    <Checkbox
                      checked={roles.includes(r)}
                      onChange={() => toggleRole(r)}
                      sx={{transform:"scale(0.85)"}}
                    />
                  }
                  label={<Typography>
      {r.charAt(0) + r.slice(1).toLowerCase()}
    </Typography>}
                />
              ))}
            </FormGroup>
          </Box>

          <Box sx={{ mb: 1 }}>
  <Typography variant="subtitle2">Title</Typography>
  <RadioGroup
    row
    value={title ?? ""}
    onChange={(e) => setTitle(e.target.value as Title)}
  >
    {TITLES.map((t) => (
      <FormControlLabel
        key={t}
        value={t}
        control={<Radio 
        sx={{transform:"scale(0.85)"}}
        />}
        label={
          <Typography>
        {t.toLowerCase().split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
        </Typography>
      }
      />
    ))}
  </RadioGroup>
</Box>

          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2">Photo</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button variant="outlined" component="label">
                Upload
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                />
              </Button>
              <Avatar src={photoUrl ?? undefined} sx={{ width: 64, height: 64 }} />
            </Stack>
          </Box>

          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2">Emoji</Typography>
            <TextField
              value={emoji}
              onChange={(e) => handleEmojiChange(e.target.value)}
              placeholder="😀"
              inputProps={{ maxLength: 4, style: { textAlign: "center", fontSize: 18 } }}
              sx={{ width: 50 }}
            />
          </Box>

          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2">Quote</Typography>
            <TextField
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Add a quote…"
              multiline
              rows={2}
              fullWidth

            />
          </Box>

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button onClick={onClose} variant="outlined">Cancel</Button>
            <Button onClick={handleSave} variant="contained">Save</Button>
          </Stack>
          </>
        )}
        </Box>
      </Box>
    </Modal>
  );
};

export default UserProfileModal;
