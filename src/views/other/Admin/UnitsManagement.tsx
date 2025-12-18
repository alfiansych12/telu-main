'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';
import { TextField, Button, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CustomBreadcrumbs from 'components/@extended/CustomBreadcrumbs';

const UnitsManagementView = () => {
  const theme = useTheme();
  const router = useRouter();
  return (
    <>
    <MainCard border={false} shadow={theme.customShadows.z1} sx={{ mb: 3, p: 0 }}>
        <CustomBreadcrumbs
          items={['Dashboard', 'Report']}
          showDate
          showExport
        />
      </MainCard>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px,1fr))', gap:'24px', marginBottom: 24 }}>
        <MainCard border={false} shadow={theme.customShadows.z1} sx={{ height: '100%', cursor: 'pointer'}} onClick={() => router.push('/Admin/ManagementData')}>
          <Typography variant='h3' sx={{ display:'flex', alignItems:'center', gap:5 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 32, verticalAlign: 'middle' }}>groups</span>
            Users
          </Typography>
        </MainCard>
        <MainCard border={false} shadow={theme.customShadows.z1} sx={{ height: '100%', cursor: 'pointer'}} onClick={() => router.push('/Admin/UnitsManagement')}>
          <Typography variant='h3' sx={{ display:'flex', alignItems:'center', gap:5 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 32, verticalAlign: 'middle' }}>apartment</span>
            Unit
          </Typography>
        </MainCard>
      </div>
      <MainCard border={false} shadow={theme.customShadows.z1} sx={{ mb: 3 }}>
        {/* ########## FILTER BAR WITH DATE ########## */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h5" sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 28, verticalAlign: 'middle', color: '#1976d2', background: '#e3f2fd', borderRadius: '50%', padding: 4, marginRight: 8, boxSizing: 'border-box' }}>apartment</span>
            Units Management
          </Typography>
          {/* ########## DATE FIELD ########## */}
          <TextField
            label="Date"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 140 }}
          />
          {/* ########## ROLE DROPDOWN ########## */}
          <TextField
            select
            label="Role"
            size="small"
            defaultValue="all"
            SelectProps={{ native: true }}
            sx={{ minWidth: 140 }}
          >
            <option value="all">All Roles</option>
            <option value="Participants">Participants</option>
            <option value="Supervisors">Supervisors</option>
          </TextField>
          <TextField size="small" placeholder="Search unit..." sx={{ minWidth: 200 }} />
        </Box>
        {/* ########## END FILTER BAR ########## */}
        <Box sx={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: 8, textAlign: 'left' }}>Info Units</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Department</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Manager</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Employee</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Status</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Created</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: 8 }}>Unit A</td>
              <td style={{ padding: 8 }}>IT</td>
              <td style={{ padding: 8 }}>John Doe</td>
              <td style={{ padding: 8 }}>12</td>
              <td style={{ padding: 8 }}>Active</td>
              <td style={{ padding: 8 }}>2025-12-01</td>
              <td style={{ padding: 8 }}>
                <Button size="small" variant="outlined" sx={{ mr: 1 }} startIcon={<span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>}>
                  Update
                </Button>
                <Button size="small" variant="outlined" sx={{ mr: 1 }} startIcon={<span className="material-symbols-outlined" style={{ fontSize: 18 }}>visibility</span>}>
                  Lihat
                </Button>
                <Button size="small" color="error" variant="outlined" startIcon={<span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>}>
                  Hapus
                </Button>
              </td>
            </tr>
            <tr>
              <td style={{ padding: 8 }}>Unit B</td>
              <td style={{ padding: 8 }}>HR</td>
              <td style={{ padding: 8 }}>Jane Smith</td>
              <td style={{ padding: 8 }}>8</td>
              <td style={{ padding: 8 }}>Inactive</td>
              <td style={{ padding: 8 }}>2025-11-20</td>
              <td style={{ padding: 8 }}>
                <Button size="small" variant="outlined" sx={{ mr: 1 }} startIcon={<span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>}>
                  Update
                </Button>
                <Button size="small" variant="outlined" sx={{ mr: 1 }} startIcon={<span className="material-symbols-outlined" style={{ fontSize: 18 }}>visibility</span>}>
                  Lihat
                </Button>
                <Button size="small" color="error" variant="outlined" startIcon={<span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>}>
                  Hapus
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 2 }}>
        <Typography variant="body2" sx={{ mr: 1 }}>Rows per page:</Typography>
        <TextField select size="small" defaultValue={10} SelectProps={{ native: true }} sx={{ width: 80 }}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
        </TextField>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
          <Button size="small" variant="outlined">&#8592;</Button>
          <Typography variant="body2">1 of 2</Typography>
          <Button size="small" variant="outlined">&#8594;</Button>
        </Box>
      </Box>
    </MainCard>
    </>
  );
};

export default UnitsManagementView;
