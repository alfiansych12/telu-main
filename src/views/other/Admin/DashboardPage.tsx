'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// MATERIAL - UI
import Typography from '@mui/material/Typography';
import {
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Paper
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Pie, Doughnut, Line } from 'react-chartjs-2';

// PROJECT IMPORTS
import MainCard from 'components/MainCard';
import CustomBreadcrumbs from 'components/@extended/CustomBreadcrumbs';
import { getDashboardStats } from 'utils/api/dashboard';
import { createUser, getUsers } from 'utils/api/users';
import { createUnit, getUnits } from 'utils/api/units';
import { getAttendances } from 'utils/api/attendances';
import { getMonitoringRequests } from 'utils/api/monitoring';

// Register ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

// ==============================|| DASHBOARD PAGE ||============================== //

const DashboardView = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [openUser, setOpenUser] = useState(false);
  const [openUnit, setOpenUnit] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'doughnut' | 'line'>('bar');

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  // Fetch users for placement chart
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(),
  });

  // Fetch recent attendances
  const { data: recentAttendances, isLoading: attendancesLoading } = useQuery({
    queryKey: ['recent-attendances'],
    queryFn: () => getAttendances({ pageSize: 5 }),
  });

  // Fetch today's attendances
  const todayDate = new Date().toISOString().split('T')[0];
  const { data: todayAttendances, isLoading: todayLoading } = useQuery({
    queryKey: ['today-attendances'],
    queryFn: () => getAttendances({ dateFrom: todayDate, dateTo: todayDate, pageSize: 5 }),
  });

  // Fetch monitoring requests
  const { data: monitoringRequests, isLoading: monitoringLoading } = useQuery({
    queryKey: ['monitoring-requests-pending'],
    queryFn: () => getMonitoringRequests({ status: 'pending' }),
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setOpenUser(false);
    },
  });

  // Create unit mutation
  const createUnitMutation = useMutation({
    mutationFn: createUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['units'] });
      setOpenUnit(false);
    },
  });

  // Handle user form submit
  const handleUserSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const userData = {
      email: formData.get('email') as string,
      name: formData.get('email')?.toString().split('@')[0] || 'User',
      role: formData.get('role') as any,
      status: 'active' as any,
      internship_start: formData.get('internship_start') as string || null,
      internship_end: formData.get('internship_end') as string || null,
    };

    createUserMutation.mutate(userData);
  };

  // Handle unit form submit
  const handleUnitSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const unitData = {
      name: formData.get('name') as string,
      department: formData.get('department') as string,
      status: 'active' as any,
    };

    createUnitMutation.mutate(unitData);
  };

  // Chart Data Processing
  const totalUsers = stats?.totalParticipants || 0;
  const presentToday = stats?.todayPresent || 0;
  const absentToday = totalUsers - presentToday;

  const attendancePercentageData = {
    labels: ['Present', 'Absent'],
    datasets: [
      {
        label: 'Attendance',
        data: [presentToday, absentToday > 0 ? absentToday : 0],
        backgroundColor: [
          alpha(theme.palette.success.main, 0.8),
          alpha(theme.palette.error.main, 0.8),
        ],
        borderColor: [
          theme.palette.success.main,
          theme.palette.error.main,
        ],
        borderWidth: 1,
        fill: true,
      },
    ],
  };

  // Unit Placement Data Processing
  const users = usersData?.users || [];
  const unitStats: Record<string, number> = {};
  users.forEach(u => {
    const unitName = u.unit?.name || 'Unassigned';
    unitStats[unitName] = (unitStats[unitName] || 0) + 1;
  });

  const placementLabels = Object.keys(unitStats);
  const placementDataValues = Object.values(unitStats);

  const placementChartData = {
    labels: placementLabels,
    datasets: [
      {
        label: 'Users per Unit',
        data: placementDataValues,
        backgroundColor: placementLabels.map((_, i) => alpha(theme.palette.primary.main, 0.1 + (i * 0.15))),
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
        borderRadius: 8,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: chartType !== 'bar' && chartType !== 'line',
        position: 'bottom' as const,
      },
    },
  };

  const renderChart = () => {
    switch (chartType) {
      case 'pie': return <Pie data={attendancePercentageData} options={chartOptions} />;
      case 'doughnut': return <Doughnut data={attendancePercentageData} options={chartOptions} />;
      case 'line': return <Line data={attendancePercentageData} options={chartOptions} />;
      default: return <Bar data={attendancePercentageData} options={chartOptions} />;
    }
  };

  return (
    <Box sx={{ pb: 5 }}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <MainCard border={false} shadow={theme.customShadows.z1} sx={{ mb: 3, p: 0, borderRadius: '16px', overflow: 'hidden' }}>
            <CustomBreadcrumbs items={['Dashboard']} showDate showExport />
          </MainCard>
        </motion.div>
      </AnimatePresence>

      {(statsError) && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          Error loading dashboard: {(statsError as Error).message}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Users', value: stats?.totalParticipants, icon: 'groups', color: theme.palette.primary.main },
          { label: 'Total SV', value: stats?.totalSupervisors, icon: 'supervisor_account', color: theme.palette.secondary.main },
          { label: 'Total Units', value: stats?.totalUnits, icon: 'apartment', color: theme.palette.warning.main }
        ].map((item, index) => (
          <Grid item xs={4} sm={4} key={item.label}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <MainCard
                border={false}
                shadow={theme.customShadows.z1}
                sx={{
                  height: '100%',
                  p: { xs: 0.5, md: 1 },
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${alpha(item.color, 0.05)} 0%, ${alpha(item.color, 0.1)} 100%)`,
                  border: `1px solid ${alpha(item.color, 0.1)}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ position: 'absolute', right: -10, top: -10, opacity: 0.1 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 80 }}>{item.icon}</span>
                </Box>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '0.6rem', sm: '0.8rem', md: '1.1rem' }, fontWeight: 600, color: item.color }}>
                  <span className="material-symbols-outlined" style={{ fontSize: { xs: 16, md: 24 } }}>{item.icon}</span>
                  {item.label}
                </Typography>
                {statsLoading ? (
                  <CircularProgress size={16} sx={{ mt: 1 }} />
                ) : (
                  <Typography variant="h3" sx={{ mt: 0.5, fontSize: { xs: '1.2rem', sm: '1.8rem', md: '2.5rem' }, fontWeight: 800 }}>
                    {item.value || 0}
                  </Typography>
                )}
              </MainCard>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Chart Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <MainCard
              title={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>Attendance Percentage Today</Typography>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={chartType}
                      onChange={(e) => setChartType(e.target.value as any)}
                      sx={{ borderRadius: '8px' }}
                    >
                      <MenuItem value="bar">Bar Chart</MenuItem>
                      <MenuItem value="pie">Pie Chart</MenuItem>
                      <MenuItem value="doughnut">Doughnut</MenuItem>
                      <MenuItem value="line">Line Chart</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              }
              sx={{ borderRadius: '20px' }}
            >
              <Box sx={{ height: 350, position: 'relative' }}>
                {renderChart()}
              </Box>
            </MainCard>
          </motion.div>
        </Grid>
      </Grid>

      {/* Grid 2 Card: Recent Activity & Activity Placement */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
            <MainCard title="Recent Activity" sx={{ height: '100%', borderRadius: '20px' }}>
              {attendancesLoading ? <CircularProgress /> : (
                <List sx={{ p: 0 }}>
                  {recentAttendances?.attendances?.map((item, i) => (
                    <React.Fragment key={item.id}>
                      <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                            {item.user?.name?.[0] || 'U'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{item.user?.name}</Typography>}
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                Checked in at {item.check_in_time}
                              </Typography>
                              {" — "} {item.user?.unit?.name || 'General'}
                            </>
                          }
                        />
                        <Chip size="small" label={item.status} color={item.status === 'present' ? 'success' : 'warning'} variant="light" />
                      </ListItem>
                      {i < 4 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </MainCard>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
            <MainCard title="Activity Placement" sx={{ height: '100%', borderRadius: '20px' }}>
              <Box sx={{ height: 300 }}>
                <Bar
                  data={placementChartData}
                  options={{
                    ...chartOptions,
                    indexAxis: 'y' as const,
                    plugins: { legend: { display: false } }
                  }}
                />
              </Box>
            </MainCard>
          </motion.div>
        </Grid>
      </Grid>

      {/* Under Grid: Attendance Today & Out-Area Check-In Request */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <MainCard title="Attendance Today" sx={{ borderRadius: '20px' }}>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: theme.palette.grey[50] }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderRadius: '8px 0 0 8px' }}>User</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Time</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayAttendances?.attendances?.map((row) => (
                      <tr key={row.id}>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${theme.palette.divider}` }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar size="sm" src={row.user?.email || ''} sx={{ width: 24, height: 24 }} />
                            <Typography variant="body2">{row.user?.name}</Typography>
                          </Box>
                        </td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${theme.palette.divider}` }}>{row.check_in_time}</td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${theme.palette.divider}` }}>
                          <Chip label={row.status} size="small" color={row.status === 'present' ? 'success' : 'warning'} />
                        </td>
                      </tr>
                    ))}
                    {todayAttendances?.attendances?.length === 0 && (
                      <tr><td colSpan={3} style={{ padding: '20px', textAlign: 'center' }}>No attendance record yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </Box>
            </MainCard>
          </motion.div>
        </Grid>
        <Grid item xs={12} md={5}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <MainCard
              title="Out-Area Check-In Request"
              sx={{ borderRadius: '20px', background: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)` }}
            >
              {monitoringLoading ? <CircularProgress /> : (
                <List sx={{ p: 0 }}>
                  {monitoringRequests?.slice(0, 4).map((req, i) => (
                    <ListItem key={req.id} sx={{ px: 0, py: 1.5, borderBottom: i < 3 ? `1px solid ${theme.palette.divider}` : 'none' }}>
                      <ListItemText
                        primary={<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{req.user?.name}</Typography>}
                        secondary={req.reason}
                      />
                      <Button size="small" variant="outlined" color="primary" sx={{ borderRadius: '6px' }}>View</Button>
                    </ListItem>
                  ))}
                  {monitoringRequests?.length === 0 && (
                    <Typography variant="body2" sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>No pending requests.</Typography>
                  )}
                </List>
              )}
            </MainCard>
          </motion.div>
        </Grid>
      </Grid>

      {/* Quick Actions Floating */}
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<span className="material-symbols-outlined">person_add</span>}
          onClick={() => setOpenUser(true)}
          sx={{ borderRadius: '30px', px: 3, py: 1.5, boxShadow: theme.customShadows.z1 }}
        >
          Add User
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<span className="material-symbols-outlined">domain_add</span>}
          onClick={() => setOpenUnit(true)}
          sx={{ borderRadius: '30px', px: 3, py: 1.5, boxShadow: theme.customShadows.z1 }}
        >
          Add Unit
        </Button>
      </Box>

      {/* Dialogs */}
      <Dialog open={openUser} onClose={() => setOpenUser(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Add New User</DialogTitle>
        <form onSubmit={handleUserSubmit}>
          <DialogContent>
            <Box component="div" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Email" name="email" type="email" required fullWidth />
              <TextField label="Role" name="role" select fullWidth SelectProps={{ native: true }} defaultValue="participant">
                <option value="participant">Participant</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Admin</option>
              </TextField>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField label="Start" name="internship_start" type="date" InputLabelProps={{ shrink: true }} fullWidth />
                <TextField label="End" name="internship_end" type="date" InputLabelProps={{ shrink: true }} fullWidth />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenUser(false)} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" disabled={createUserMutation.isPending}>Save</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={openUnit} onClose={() => setOpenUnit(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Add New Unit</DialogTitle>
        <form onSubmit={handleUnitSubmit}>
          <DialogContent>
            <Box component="div" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Unit Name" name="name" required fullWidth />
              <TextField label="Department" name="department" required fullWidth />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenUnit(false)} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" disabled={createUnitMutation.isPending}>Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default DashboardView;
