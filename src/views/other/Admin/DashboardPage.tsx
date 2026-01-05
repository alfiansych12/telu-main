'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// MATERIAL - UI
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Stack,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement, Filler } from 'chart.js';
import { Doughnut, Bar, Pie, Line } from 'react-chartjs-2';

// PROJECT IMPORTS
import MainCard from 'components/MainCard';
import { getDashboardStats } from 'utils/api/dashboard';
import { getAttendances } from 'utils/api/attendances';
import { openAlert } from 'api/alert';

// ICONS
import { Clock, TickCircle, CloseCircle, Warning2 } from 'iconsax-react';

// Register ChartJS
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler
);

const AdminDashboard = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const todayDate = new Date().toISOString().split('T')[0];
  const [chartType, setChartType] = useState<'doughnut' | 'pie' | 'bar' | 'line'>('doughnut');

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  // Fetch recent attendances (for activity)
  const { data: recentAttendancesData, isLoading: activityLoading } = useQuery({
    queryKey: ['recent-attendances'],
    queryFn: () => getAttendances({ pageSize: 5 }),
  });

  // Fetch today's attendances
  const { data: todayAttendancesData, isLoading: todayLoading } = useQuery({
    queryKey: ['today-attendances', todayDate],
    queryFn: () => getAttendances({ dateFrom: todayDate, dateTo: todayDate, pageSize: 10 }),
  });



  // Calculate attendance percentage
  const totalParticipants = stats?.totalParticipants || 0;
  const todayPresent = stats?.todayPresent || 0;
  const attendancePercentage = totalParticipants > 0
    ? Math.round((todayPresent / totalParticipants) * 100)
    : 0;

  // Doughnut chart data for attendance percentage
  const doughnutData = {
    labels: ['Present', 'Absent'],
    datasets: [{
      data: [todayPresent, totalParticipants - todayPresent],
      backgroundColor: ['#2ecc71', '#e74c3c'],
      borderWidth: 0,
    }]
  };

  // Bar chart data for activity placement
  const placementData = {
    labels: ['IT Dev', 'HR', 'Marketing', 'Finance', 'Operations'],
    datasets: [{
      label: 'Participants',
      data: [8, 5, 7, 3, 6],
      backgroundColor: theme.palette.primary.main,
      borderRadius: 8,
    }]
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <TickCircle size={20} variant="Bold" color="#2ecc71" />;
      case 'late':
        return <Clock size={20} variant="Bold" color="#f39c12" />;
      case 'absent':
        return <CloseCircle size={20} variant="Bold" color="#e74c3c" />;
      default:
        return <Warning2 size={20} variant="Bold" color="#95a5a6" />;
    }
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case 'present': return 'success';
      case 'late': return 'warning';
      case 'absent': return 'error';
      default: return 'default';
    }
  };

  if (statsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const recentAttendances = recentAttendancesData?.attendances || [];
  const todayAttendances = todayAttendancesData?.attendances || [];

  return (
    <Grid container spacing={3}>
      {/* LEFT COLUMN - 40% */}
      <Grid item xs={12} lg={5}>
        <Stack spacing={3}>
          {/* Card 1: Recent Activity */}
          <MainCard title="Recent Activity">
            {activityLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={32} />
              </Box>
            ) : (
              <List sx={{ py: 0 }}>
                {recentAttendances.map((attendance, index) => (
                  <React.Fragment key={attendance.id}>
                    {index > 0 && <Divider />}
                    <ListItem sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: theme.palette.primary.lighter, color: theme.palette.primary.main }}>
                          {attendance.user?.name?.charAt(0) || 'U'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {attendance.user?.name || 'Unknown User'}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="textSecondary">
                            Checked in at {attendance.check_in_time || '-'} — {attendance.user?.unit?.name || 'General'}
                          </Typography>
                        }
                      />
                      <Chip
                        icon={getStatusIcon(attendance.status || '')}
                        label={attendance.status}
                        size="small"
                        color={getStatusColor(attendance.status)}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
                {recentAttendances.length === 0 && (
                  <Box sx={{ py: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      No recent activity
                    </Typography>
                  </Box>
                )}
              </List>
            )}
          </MainCard>

          {/* Card 2: Attendance Today */}
          <MainCard title="Attendance Today">
            {todayLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={32} />
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: theme.palette.grey[50] }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {todayAttendances.map((attendance) => (
                      <TableRow key={attendance.id} hover>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                              {attendance.user?.name?.charAt(0) || 'U'}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{attendance.user?.name || 'Unknown'}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="textSecondary">{attendance.check_in_time || '-'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={attendance.status}
                            size="small"
                            color={getStatusColor(attendance.status)}
                            variant="filled"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              borderRadius: 0.5
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {todayAttendances.length === 0 && (
                  <Box sx={{ py: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      No attendance records for today
                    </Typography>
                  </Box>
                )}
              </TableContainer>
            )}
          </MainCard>


        </Stack>
      </Grid>

      {/* RIGHT COLUMN - 60% */}
      <Grid item xs={12} lg={7}>
        <Stack spacing={3}>
          {/* Card 4: Attendance Percentage Today */}
          <MainCard
            title="Attendance Percentage Today"
            secondary={
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value as any)}
                  sx={{ fontSize: '0.875rem' }}
                >
                  <MenuItem value="doughnut">Doughnut</MenuItem>
                  <MenuItem value="pie">Pie</MenuItem>
                  <MenuItem value="bar">Bar</MenuItem>
                  <MenuItem value="line">Line</MenuItem>
                </Select>
              </FormControl>
            }
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
              <Box sx={{ width: '100%', maxWidth: chartType === 'bar' || chartType === 'line' ? 400 : 300, position: 'relative' }}>
                {chartType === 'doughnut' && (
                  <>
                    <Doughnut
                      data={doughnutData}
                      options={{
                        cutout: '70%',
                        plugins: {
                          legend: {
                            display: false
                          },
                          tooltip: {
                            enabled: true
                          }
                        },
                        maintainAspectRatio: true
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center'
                      }}
                    >
                      <Typography variant="h2" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                        {attendancePercentage}%
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Present Today
                      </Typography>
                    </Box>
                  </>
                )}

                {chartType === 'pie' && (
                  <Pie
                    data={doughnutData}
                    options={{
                      plugins: {
                        legend: {
                          display: true,
                          position: 'bottom'
                        },
                        tooltip: {
                          enabled: true
                        }
                      },
                      maintainAspectRatio: true
                    }}
                  />
                )}

                {chartType === 'bar' && (
                  <Bar
                    data={{
                      labels: ['Present', 'Absent'],
                      datasets: [{
                        label: 'Count',
                        data: [todayPresent, totalParticipants - todayPresent],
                        backgroundColor: ['#2ecc71', '#e74c3c'],
                        borderRadius: 8,
                      }]
                    }}
                    options={{
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      },
                      maintainAspectRatio: true
                    }}
                  />
                )}

                {chartType === 'line' && (
                  <Line
                    data={{
                      labels: ['Present', 'Absent'],
                      datasets: [{
                        label: 'Attendance',
                        data: [todayPresent, totalParticipants - todayPresent],
                        borderColor: theme.palette.primary.main,
                        backgroundColor: theme.palette.primary.lighter,
                        fill: true,
                        tension: 0.4
                      }]
                    }}
                    options={{
                      plugins: {
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      },
                      maintainAspectRatio: true
                    }}
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: '#2ecc71' }}>
                    {todayPresent}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Present
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: '#e74c3c' }}>
                    {totalParticipants - todayPresent}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Absent
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {totalParticipants}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Total
                  </Typography>
                </Box>
              </Box>
            </Box>
          </MainCard>

          {/* Card 5: Activity Placement */}
          <MainCard title="Activity Placement">
            <Box sx={{ py: 2 }}>
              <Bar
                data={placementData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      display: false
                    },
                    title: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 2
                      }
                    }
                  }
                }}
              />
            </Box>
          </MainCard>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default AdminDashboard;
