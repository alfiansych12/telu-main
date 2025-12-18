
'use client';
import React from 'react';

// MATERIAL - UI

import Typography from '@mui/material/Typography';

// PROJECT IMPORTS
import MainCard from 'components/MainCard';
import { TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CustomBreadcrumbs from 'components/@extended/CustomBreadcrumbs';
// ==============================|| SAMPLE PAGE ||============================== //


const DashboardView = () => {
  const theme = useTheme();
  const [openUser, setOpenUser] = React.useState(false);
  const [openUnit, setOpenUnit] = React.useState(false);

  return (
    <>
    <MainCard border={false} shadow={theme.customShadows.z1} sx={{ mb: 3, p: 0 }}>
        <CustomBreadcrumbs
          items={['Dashboard', 'Report']}
          showDate
          showExport
        />
      </MainCard>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr)', gap:24, marginBottom:24 }}>
        <MainCard border={false} shadow={theme.customShadows.z1} sx={{ height: '100%' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, verticalAlign: 'middle' }}>groups</span>
            Total Participants
          </Typography>
          <Typography variant="h4" sx={{ mt: 1 }}>120</Typography>
        </MainCard>
        <MainCard border={false} shadow={theme.customShadows.z1} sx={{ height: '100%' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, verticalAlign: 'middle' }}>groups</span>
            Total Participants
          </Typography>
          <Typography variant="h4" sx={{ mt: 1 }}>120</Typography>
        </MainCard>
        <MainCard border={false} shadow={theme.customShadows.z1} sx={{ height: '100%' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, verticalAlign: 'middle' }}>groups</span>
            Total Participants
          </Typography>
          <Typography variant="h4" sx={{ mt: 1 }}>120</Typography>
        </MainCard>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:24 }}>
      <MainCard border={false} shadow={theme.customShadows.z1} sx={{ height: '100%', cursor: 'pointer'}} onClick={() =>setOpenUser(true)}>
      <Typography variant='h4' sx={{ display:'flex', alignItems:'center', gap:5 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 32, verticalAlign: 'middle' }}>add</span>
        Add Users
      </Typography>
      </MainCard>
      <MainCard border={false} shadow={theme.customShadows.z1} sx={{ height: '100%', cursor: 'pointer'}} onClick={() =>setOpenUser(true)}>
      <Typography variant='h4' sx={{ display:'flex', alignItems:'center', gap:5 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 34, verticalAlign: 'middle' }}>add</span>
        Add Units
      </Typography>
      </MainCard>
      </div>

            {/* Dialog Add Users */}
      <Dialog open={openUser} onClose={() => setOpenUser(false)}>
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1, minWidth: 300, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField margin="normal" label="Gmail" fullWidth />
            <TextField margin="normal" label="Initial Password" type="password" fullWidth />
            <TextField
              margin="normal"
              label="Role"
              select
              fullWidth
              SelectProps={{ native: true }}
              defaultValue="Participants"
            >
              <option value="Participants">Participants</option>
              <option value="Supervisors">Supervisors</option>
            </TextField>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label="Internship Start"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Internship End"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUser(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenUser(false)}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Add Units */}
      <Dialog open={openUnit} onClose={() => setOpenUnit(false)}>
        <DialogTitle>Add Unit</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1, minWidth: 300 }}>
            <TextField margin="normal" label="Unit Name" fullWidth />
            <TextField margin="normal" label="Description" fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUnit(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenUnit(false)}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DashboardView;
