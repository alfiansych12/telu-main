
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

// MATERIAL - UI

import Typography from '@mui/material/Typography';

// PROJECT IMPORTS
import MainCard from 'components/MainCard';
import { TextField, Button, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CustomBreadcrumbs from 'components/@extended/CustomBreadcrumbs';
// ==============================|| SAMPLE PAGE ||============================== //



const ManagementDataView = () => {
  const theme = useTheme();
  const [selectedTable, setSelectedTable] = React.useState<'users' | 'units'>('users');

  // Table Users
  const UsersTable = (
    <MainCard border={false} shadow={theme.customShadows.z1} sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="h5" sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 28, verticalAlign: 'middle' }}>groups</span>
          User Management
        </Typography>
        <TextField
          label="Date"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 140 }}
        />
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
        <TextField size="small" placeholder="Search user..." sx={{ minWidth: 200 }} />
      </Box>
      <Box sx={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: 8, textAlign: 'left' }}>ID</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Name</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Roles</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Units</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Status</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: 8 }}>1</td>
              <td style={{ padding: 8 }}>John Doe</td>
              <td style={{ padding: 8 }}>Participants</td>
              <td style={{ padding: 8 }}>Unit A</td>
              <td style={{ padding: 8 }}>Active</td>
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
              <td style={{ padding: 8 }}>2</td>
              <td style={{ padding: 8 }}>Jane Smith</td>
              <td style={{ padding: 8 }}>Supervisors</td>
              <td style={{ padding: 8 }}>Unit B</td>
              <td style={{ padding: 8 }}>Inactive</td>
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
          <Typography variant="body2">1 of 10</Typography>
          <Button size="small" variant="outlined">&#8594;</Button>
        </Box>
      </Box>
    </MainCard>
  );

  // Table Units
  const UnitsTable = (
    <MainCard border={false} shadow={theme.customShadows.z1} sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="h5" sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 28, verticalAlign: 'middle' }}>apartment</span>
          Units Management
        </Typography>
        <TextField
          label="Date"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 140 }}
        />
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
  );

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
        <MainCard
          border={selectedTable === 'users' ? '2px solid #B53D3D' : false}
          shadow={theme.customShadows.z1}
          sx={{ height: '100%', cursor: 'pointer', background: selectedTable === 'users' ? '#f3eaaeb' : undefined }}
          onClick={() => setSelectedTable('users')}
        >
          <Typography variant='h3' sx={{ display:'flex', alignItems:'center', gap:5 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 32, verticalAlign: 'middle' }}>groups</span>
            Users
          </Typography>
        </MainCard>
        <MainCard
          border={selectedTable === 'units' ? '2px solid #B53D3D' : false}
          shadow={theme.customShadows.z1}
          sx={{ height: '100%', cursor: 'pointer', background: selectedTable === 'units' ? '#f3eaaeb' : undefined }}
          onClick={() => setSelectedTable('units')}
        >
          <Typography variant='h3' sx={{ display:'flex', alignItems:'center', gap:5 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 32, verticalAlign: 'middle' }}>apartment</span>
            Unit
          </Typography>
        </MainCard>
      </div>
      {selectedTable === 'users' ? UsersTable : UnitsTable}
    </>
  );
};

export default ManagementDataView;
