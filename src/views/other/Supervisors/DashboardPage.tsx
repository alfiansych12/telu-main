'use client';
import React from 'react';

// MATERIAL - UI
import Typography from '@mui/material/Typography';

// PROJECT IMPORTS
import MainCard from 'components/MainCard';
import { TextField, Button, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CustomBreadcrumbs from 'components/@extended/CustomBreadcrumbs';

// CHART.JS
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// ==============================|| DASHBOARD VIEW ||============================== //

const DashboardView = () => {
  const theme = useTheme();

  // Data untuk grafik Absence Statistics
  const absenceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Sick Leave',
        data: [3, 4, 2, 5, 3, 2, 4, 3, 2, 3, 4, 2],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Permission',
        data: [1, 2, 1, 3, 2, 1, 2, 1, 0, 1, 2, 1],
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Unauthorized',
        data: [0, 1, 0, 2, 1, 0, 1, 0, 1, 0, 1, 0],
        borderColor: 'rgba(255, 206, 86, 1)',
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Last Year\'s Absence Statistics',
        font: {
          size: 16
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Days'
        },
        ticks: {
          stepSize: 1
        }
      },
      x: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };

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
            My Interns
          </Typography>
          <Typography variant="h4" sx={{ mt: 1 }}>120</Typography>
        </MainCard>
        <MainCard border={false} shadow={theme.customShadows.z1} sx={{ height: '100%' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, verticalAlign: 'middle' }}>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                <path d="m424-318 282-282-56-56-226 226-114-114-56 56 170 170ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h168q13-36 43.5-58t68.5-22q38 0 68.5 22t43.5 58h168q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm280-590q13 0 21.5-8.5T510-820q0-13-8.5-21.5T480-850q-13 0-21.5 8.5T450-820q0 13 8.5 21.5T480-790ZM200-200v-560 560Z"/>
              </svg>
            </span>
            Active Internship
          </Typography>
          <Typography variant="h4" sx={{ mt: 1 }}>120</Typography>
        </MainCard>
        <MainCard border={false} shadow={theme.customShadows.z1} sx={{ height: '100%' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, verticalAlign: 'middle' }}>schedule</span>
            Request Check-in
          </Typography>
          <Typography variant="h4" sx={{ mt: 1 }}>120</Typography>
        </MainCard>
      </div>


      <MainCard border={false} shadow={theme.customShadows.z1} sx={{ mt: 2, p: 2, maxWidth: '100%', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Button variant="contained">Data</Button>
          <TextField type="date" size="small" sx={{ minWidth: 140 }} />
          <TextField select size="small" defaultValue="all" sx={{ minWidth: 140 }}>
            <option value="all">All Interns</option>
            <option value="unit1">Unit 1</option>
            <option value="unit2">Unit 2</option>
          </TextField>
          <TextField size="small" placeholder="Search..." sx={{ minWidth: 180 }} />
        </Box>
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Name</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Institution</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Period</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Phone Number</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Gmail</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Address</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: 8 }}>Rizky Maulana</td>
                <td style={{ padding: 8 }}>Universitas A</td>
                <td style={{ padding: 8 }}>Jan 2025 - Mar 2025</td>
                <td style={{ padding: 8 }}>08123456789</td>
                <td style={{ padding: 8 }}>rizky@gmail.com</td>
                <td style={{ padding: 8 }}>Jl. Merdeka No. 1</td>
              </tr>
              <tr>
                <td style={{ padding: 8 }}>Dewi Lestari</td>
                <td style={{ padding: 8 }}>Universitas B</td>
                <td style={{ padding: 8 }}>Feb 2025 - Apr 2025</td>
                <td style={{ padding: 8 }}>08234567890</td>
                <td style={{ padding: 8 }}>dewi@gmail.com</td>
                <td style={{ padding: 8 }}>Jl. Sudirman No. 2</td>
              </tr>
            </tbody>
          </table>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">Rows per page:</Typography>
              <TextField select size="small" defaultValue={10} sx={{ width: 70 }}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </TextField>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button size="small" variant="outlined">&#8592;</Button>
              <Typography variant="body2">1-2 of 2</Typography>
              <Button size="small" variant="outlined">&#8594;</Button>
            </Box>
          </Box>
        </Box>
      </MainCard>



      {/* Container untuk Request Check-in dan Absence Statistics */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3, mb: 3 }}>
        {/* Card Request Check-in */}
        <MainCard border={false} shadow={theme.customShadows.z1} sx={{ flex: 1, maxWidth: { lg: 400 }, p: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 24, verticalAlign: 'middle' }}>schedule</span>
            Request Check-in
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <img
                src="/assets/images/users/avatar-1.png"
                alt="Avatar Rizky Maulana"
                style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }}
              />
              <Box>
                <Typography variant="subtitle1" sx={{ textAlign: 'left', fontWeight: 600 }}>
                  Rizky Maulana
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Unit 1 • Check-in Request
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  08:15 AM • 5 min ago
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'space-between' }}>
              <Button variant="contained" color="success" fullWidth>
                Accept
              </Button>
              <Button variant="outlined" color="error" fullWidth>
                Cancel
              </Button>
            </Box>
          </Box>
          
          {/* Additional request (jika ada) */}
          <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
              Other Pending Requests
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2">2 more check-in requests</Typography>
              <Button size="small" variant="text">
                View All
              </Button>
            </Box>
          </Box>
        </MainCard>

        {/* Grafik Absence Statistics */}
        <MainCard border={false} shadow={theme.customShadows.z1} sx={{ flex: 2, p: 2, minHeight: 350 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, verticalAlign: 'middle' }}>bar_chart</span>
              Last Year's Absence Statistics
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" variant="outlined">2024</Button>
              <Button size="small" variant="text">2023</Button>
            </Box>
          </Box>
          
          <Box sx={{ height: 300, position: 'relative' }}>
            <Line data={absenceData} options={options} />
          </Box>
          
          {/* Legend/Summary */}
          <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}`, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">42</Typography>
              <Typography variant="caption" color="textSecondary">Total Sick Days</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="secondary">18</Typography>
              <Typography variant="caption" color="textSecondary">Permission Days</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="warning.main">6</Typography>
              <Typography variant="caption" color="textSecondary">Unauthorized</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6">66</Typography>
              <Typography variant="caption" color="textSecondary">Total Absence</Typography>
            </Box>
          </Box>
        </MainCard>
      </Box>

      {/* Card Attendance For Today */}
      <MainCard border={false} shadow={theme.customShadows.z1} sx={{ mt: 2, p: 2, maxWidth: '100%' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Attendance For Today
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Name</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Units</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Check-in</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Check-out</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Status</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: 8 }}>Rizky Maulana</td>
                <td style={{ padding: 8 }}>Unit 1</td>
                <td style={{ padding: 8 }}>08:00</td>
                <td style={{ padding: 8 }}>16:00</td>
                <td style={{ padding: 8 }}><span style={{ color: 'green', fontWeight: 500 }}>Present</span></td>
                <td style={{ padding: 8 }}><Button size="small" variant="outlined">Details</Button></td>
              </tr>
              <tr>
                <td style={{ padding: 8 }}>Dewi Lestari</td>
                <td style={{ padding: 8 }}>Unit 2</td>
                <td style={{ padding: 8 }}>08:10</td>
                <td style={{ padding: 8 }}>16:05</td>
                <td style={{ padding: 8 }}><span style={{ color: 'orange', fontWeight: 500 }}>Late</span></td>
                <td style={{ padding: 8 }}><Button size="small" variant="outlined">Details</Button></td>
              </tr>
            </tbody>
          </table>
        </Box>
      </MainCard>

      {/* Card Data Interns */}
    </>
  );
};

export default DashboardView;