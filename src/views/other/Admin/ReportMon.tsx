
'use client';
import React from 'react';

// MATERIAL - UI

import Typography from '@mui/material/Typography';

// PROJECT IMPORTS
import MainCard from 'components/MainCard';
import { useTheme } from '@mui/material/styles';
import { TextField } from '@mui/material';
import CustomBreadcrumbs from 'components/@extended/CustomBreadcrumbs';


// ==============================|| SAMPLE PAGE ||============================== //


const ReportMonitoringView = () => {
  const theme = useTheme();

  return (
    <>
    <MainCard border={false} shadow={theme.customShadows.z1} sx={{ mb: 3, p: 0 }}>
        <CustomBreadcrumbs
          items={['Dashboard', 'Report']}
          showDate
          showExport
        />
      </MainCard>
      <div style={{ display:'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' ,gap:24, marginBottom:24 }}>
        <MainCard border={false} shadow={theme.customShadows.z1} sx={{ height:'100%'}}>
            <Typography variant='h3' sx={{ display:'flex', alignItems:'center' ,gap:5 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 32, verticalAlign: 'middle' }}>Calendar_Today</span>
                Recap Absence
            </Typography>
        </MainCard>
        <MainCard border={false} shadow={theme.customShadows.z1} sx={{ height:'100%'}}>
            <Typography variant='h3' sx={{ display:'flex', alignItems:'center' ,gap:5 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 32, verticalAlign: 'middle' }}>groups</span>
                Participant Activities
            </Typography>
        </MainCard>
        <MainCard border={false} shadow={theme.customShadows.z1} sx={{ height:'100%'}}>
            <Typography variant='h3' sx={{ display:'flex', alignItems:'center' ,gap:5 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 32, verticalAlign: 'middle' }}>location_on</span>
                Request Check-Un
            </Typography>
        </MainCard>
      </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px,1fr))', gap:24, marginBottom:24 }} >
        <MainCard border={false} shadow={theme.customShadows.z1} sx={{ height:'80%'}}>
          {/* ########## FILTER BAR ########## */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
              <TextField
                label="Date"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 220, maxWidth: 180 }}
              />
              <TextField
                select
                label="Unit"
                size="small"
                defaultValue="all"
                SelectProps={{ native: true }}
                sx={{ minWidth: 180, maxWidth: 180 }}
              >
                <option value="all">All Units</option>
                <option value="Participants">Participants</option>
                <option value="Supervisors">Supervisors</option>
              </TextField>
                 <TextField
                select
                label="Role"
                size="small"
                defaultValue="all"
                SelectProps={{ native: true }}
                sx={{ minWidth: 180, maxWidth: 180 }}
              >
                <option value="all">All Roles</option>
                <option value="Participants">Participants</option>
                <option value="Supervisors">Supervisors</option>
              </TextField>
            </div>
            <div>
              <button style={{ background: '#0000FF', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>
                Export Reports
              </button>
            </div>
          </div>

      {/* ########## CARD DATA TABLE ########## */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px,1fr))', gap:24, marginBottom:24 }}>
        <MainCard border={false} shadow={theme.customShadows.z1} sx={{ height:'150%' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: 8, textAlign: 'left' }}>Name</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Units</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Date</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Check-in</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Activity</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Check-out</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {/* Contoh data statis, bisa diganti dengan map dari data */}
                <tr>
                  <td style={{ padding: 8 }}>John Doe</td>
                  <td style={{ padding: 8 }}>Unit A</td>
                  <td style={{ padding: 8 }}>2025-12-17</td>
                  <td style={{ padding: 8 }}>08:00</td>
                  <td style={{ padding: 8 }}>Meeting</td>
                  <td style={{ padding: 8 }}>17:00</td>
                  <td style={{ padding: 8 }}>Present</td>
                </tr>
                <tr>
                  <td style={{ padding: 8 }}>Jane Smith</td>
                  <td style={{ padding: 8 }}>Unit B</td>
                  <td style={{ padding: 8 }}>2025-12-17</td>
                  <td style={{ padding: 8 }}>08:15</td>
                  <td style={{ padding: 8 }}>Workshop</td>
                  <td style={{ padding: 8 }}>16:45</td>
                  <td style={{ padding: 8 }}>Present</td>
                </tr>
              </tbody>
            </table>
          </div>
        </MainCard>
      </div>
        </MainCard>
      </div>
    </>
  );
}

export default ReportMonitoringView;
