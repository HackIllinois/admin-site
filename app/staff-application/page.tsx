'use client'
import { useEffect, useState } from 'react'
import Loading from '@/components/Loading'
import { Box, TextField, Checkbox, FormControlLabel } from '@mui/material';


export default function StaffApplication() {
const [link, setLink] = useState("");
const [active, setActive] = useState(false);
const [loading, setLoading] = useState(true);



    return(
    <div style={{padding:"24px"}}>
    <h1 style={{padding:"0px 0px 20px 0px"}}>Staff Application</h1>
        <p>Link to Application:</p>
    <Box sx={{ display: 'flex', gap: 6, p: 3, padding: 0 }}>
      <TextField
        label="Add Link Here"
        variant="outlined"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        fullWidth
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
        }
        sx={{ whiteSpace: 'nowrap' }}
        label="Shown on info site"
      />
    </Box>
    </div>
    );
}