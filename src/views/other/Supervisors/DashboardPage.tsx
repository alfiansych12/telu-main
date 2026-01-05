'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

// MATERIAL - UI
import {
  Grid,
  Typography,
  Box,
  CircularProgress,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Paper,
  IconButton,
  Tooltip,
  Button
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

// PROJECT IMPORTS
import MainCard from 'components/MainCard';
import CustomBreadcrumbs from 'components/@extended/CustomBreadcrumbs';
import { getMonitoringRequests, updateMonitoringRequest } from 'utils/api/monitoring';
import { getAttendances } from 'utils/api/attendances';
import { getUsers } from 'utils/api/users';
import { getUnits } from 'utils/api/units';
import { openAlert } from 'api/alert';

// ICONS
import {
  People,
  TickCircle,
  CloseCircle,
  Chart as ChartIcon,
  Timer1,
} from 'iconsax-react';

// Dynamic Map Component
const MapComponent = dynamic(() => import('components/MapComponent'), {
  ssr: false,
  loading: () => (
    <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}>
      <CircularProgress />
    </Box>
  )
});

// Register ChartJS
ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler);

const SupervisorDashboard = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];
  const [selectedUnit, setSelectedUnit] = React.useState<string>('all');

  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  // 0. Fetch Units for Selector
  const { data: unitsData } = useQuery({
    queryKey: ['units-list'],
    queryFn: () => getUnits({ pageSize: 100 })
  });


  // 1. Fetch Monitoring Requests (Pending)
  const { data: pendingRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['monitoring-requests', 'pending', userId, selectedUnit],
    queryFn: () => getMonitoringRequests({
      status: 'pending',
      supervisorId: userId,
      unitId: selectedUnit === 'all' ? undefined : selectedUnit
    }),
    enabled: !!userId
  });

  // 2. Fetch Today's Attendances
  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['today-attendance', today, userId, selectedUnit],
    queryFn: () => getAttendances({
      dateFrom: today,
      dateTo: today,
      pageSize: 100,
      supervisorId: userId,
      unitId: selectedUnit === 'all' ? undefined : selectedUnit
    }),
    enabled: !!userId
  });

  // 3. Fetch Team Members
  const { data: teamData, isLoading: teamLoading } = useQuery({
    queryKey: ['team-members', userId, selectedUnit],
    queryFn: () => getUsers({
      role: 'participant',
      pageSize: 100,
      supervisorId: userId,
      unitId: selectedUnit === 'all' ? undefined : selectedUnit
    }),
    enabled: !!userId
  });

  // Mutations
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'approved' | 'rejected' }) =>
      updateMonitoringRequest(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-requests'] });
      openAlert({
        title: 'Success',
        message: `Request has been ${variables.status} successfully.`,
        variant: 'success'
      });
    },
    onError: (error: any) => {
      openAlert({
        title: 'Error',
        message: 'Failed to update request: ' + error.message,
        variant: 'error'
      });
    }
  });

  // 4. Generate Markers for Map
  const { totalInterns, presentCount, absentCount, attendanceRate, doughnutData, lineData, mapMarkers, todayAttendances } = useMemo(() => {
    const interns = teamData?.users || [];
    const totalInterns = interns.length;
    const todayAttendances = attendanceData?.attendances || [];
    const presentCount = todayAttendances.filter(a => a.status === 'present' || a.status === 'late').length;
    const absentCount = Math.max(0, totalInterns - presentCount);
    const attendanceRate = totalInterns > 0 ? Math.round((presentCount / totalInterns) * 100) : 0;

    // Chart Data
    const doughnutData = {
      labels: ['Present', 'Absent'],
      datasets: [{
        data: [presentCount, absentCount],
        backgroundColor: [theme.palette.success.main, theme.palette.error.light],
        hoverOffset: 4,
        borderWidth: 0,
      }]
    };

    const lineData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Team Presence',
        data: [12, 11, 15, 14, 13, 8, 5],
        fill: true,
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        tension: 0.4
      }]
    };

    const markers: any[] = [
      {
        position: [-6.974580, 107.630910],
        title: 'Unit Base (Telekomunikasi No.1)',
        type: 'admin'
      }
    ];

    todayAttendances.forEach(attendance => {
      try {
        const meta = attendance.activity_description ? JSON.parse(attendance.activity_description) : null;
        if (meta && meta.check_in_location) {
          markers.push({
            position: meta.check_in_location,
            title: attendance.user?.name || 'Unknown User',
            subtitle: `Checked in at ${attendance.check_in_time}`,
            type: 'user'
          });
        }
      } catch (e) {
        // Silently skip if not parsable
      }
    });

    return {
      totalInterns,
      presentCount,
      absentCount,
      attendanceRate,
      doughnutData,
      lineData,
      mapMarkers: markers,
      todayAttendances // Added this to the return
    };
  }, [teamData, attendanceData, theme]);

  if (teamLoading || attendanceLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <MainCard border={false} shadow={theme.customShadows.z1} sx={{ mb: 3, p: 0 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ pr: 2 }}>
          <CustomBreadcrumbs items={['Supervisor', 'Dashboard']} showDate />
          <FormControl size="small" sx={{ minWidth: 200, mb: { xs: 2, sm: 0 }, mt: { xs: 0, sm: 0 } }}>
            <InputLabel id="unit-select-label">Team / Unit</InputLabel>
            <Select
              labelId="unit-select-label"
              value={selectedUnit}
              label="Team / Unit"
              onChange={(e) => setSelectedUnit(e.target.value)}
              sx={{ bgcolor: 'white' }}
            >
              <MenuItem value="all">All My Teams</MenuItem>
              {unitsData?.units.map((unit) => (
                <MenuItem key={unit.id} value={unit.id}>{unit.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </MainCard>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{
            p: 3,
            borderRadius: 3,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            height: '100%',
            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`
          }}>
            <Stack spacing={1}>
              <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500 }}>Total Team Members</Typography>
              <Typography variant="h2" sx={{ fontWeight: 800 }}>{totalInterns}</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.15)', fontSize: '0.75rem', fontWeight: 600 }}>
                  Active Now: {presentCount}
                </Box>
              </Stack>
            </Stack>
            <People size={90} variant="Bulk" style={{ position: 'absolute', right: -15, bottom: -15, opacity: 0.2 }} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{
            p: 3,
            borderRadius: 3,
            background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            height: '100%',
            boxShadow: `0 8px 24px ${alpha(theme.palette.success.main, 0.25)}`
          }}>
            <Stack spacing={1}>
              <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500 }}>Attendance Rate</Typography>
              <Typography variant="h2" sx={{ fontWeight: 800 }}>{attendanceRate}%</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.15)', fontSize: '0.75rem', fontWeight: 600 }}>
                  vs last week +2%
                </Box>
              </Stack>
            </Stack>
            <ChartIcon size={90} variant="Bulk" style={{ position: 'absolute', right: -15, bottom: -15, opacity: 0.2 }} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{
            p: 3,
            borderRadius: 3,
            background: `linear-gradient(45deg, ${theme.palette.warning.main}, #e67e22)`,
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            height: '100%',
            boxShadow: `0 8px 24px ${alpha(theme.palette.warning.main, 0.25)}`
          }}>
            <Stack spacing={1}>
              <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500 }}>Pending Actions</Typography>
              <Typography variant="h2" sx={{ fontWeight: 800 }}>{pendingRequests?.length || 0}</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.15)', fontSize: '0.75rem', fontWeight: 600 }}>
                  Awaiting Approval
                </Box>
              </Stack>
            </Stack>
            <Timer1 size={90} variant="Bulk" style={{ position: 'absolute', right: -15, bottom: -15, opacity: 0.2 }} />
          </Paper>
        </Grid>

        {/* LEFT COLUMN */}
        <Grid item xs={12} lg={8}>
          <Stack spacing={3}>
            {/* Attendance Trends */}
            <MainCard title="Weekly Attendance Trends">
              <Box sx={{ height: 250 }}>
                <Line data={lineData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
              </Box>
            </MainCard>

            {/* Recent Activity Map */}
            <MainCard title="Team Distribution (Today)" secondary={<Chip size="small" label="Live Tracking" color="error" variant="outlined" />}>
              <Box sx={{ height: 450, borderRadius: 2, overflow: 'hidden' }}>
                <MapComponent
                  position={[-6.974580, 107.630910]}
                  address="Unit Base"
                  radius={100}
                  markers={mapMarkers}
                />
              </Box>

              {/* Active Participants Cards (The "Gebrakan" part) */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700, px: 1 }}>Active Participants Currently on Duty</Typography>
                <Grid container spacing={2}>
                  {todayAttendances && todayAttendances.length > 0 ? (
                    todayAttendances.map((attendance: any) => {
                      const meta = attendance.activity_description ? (function () {
                        try { return JSON.parse(attendance.activity_description!); } catch (e) { return {}; }
                      })() : {};

                      return (
                        <Grid item xs={12} sm={6} key={attendance.id}>
                          <Paper elevation={0} sx={{
                            p: 2,
                            borderRadius: 2,
                            border: `1px solid ${theme.palette.divider}`,
                            bgcolor: alpha(theme.palette.primary.main, 0.02),
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-2px)', bgcolor: alpha(theme.palette.primary.main, 0.05) }
                          }}>
                            <Avatar sx={{
                              width: 48,
                              height: 48,
                              bgcolor: theme.palette.primary.main,
                              color: 'white',
                              mr: 2,
                              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                            }}>
                              {attendance.user?.name.charAt(0)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{attendance.user?.name}</Typography>
                              <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>{attendance.user?.unit?.name || 'Unknown Unit'}</Typography>
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                <Chip
                                  size="small"
                                  label={`In: ${attendance.check_in_time}`}
                                  variant="filled"
                                  color="success"
                                  sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
                                />
                                {meta.check_in_location ? (
                                  <Chip size="small" label="GPS Tracked" variant="outlined" color="primary" sx={{ height: 20, fontSize: '0.65rem' }} />
                                ) : (
                                  <Chip size="small" label="No GPS" variant="outlined" color="default" sx={{ height: 20, fontSize: '0.65rem' }} />
                                )}
                              </Stack>
                            </Box>
                          </Paper>
                        </Grid>
                      );
                    })
                  ) : (
                    <Grid item xs={12}>
                      <Box sx={{ py: 3, textAlign: 'center', bgcolor: alpha(theme.palette.grey[500], 0.05), borderRadius: 2 }}>
                        <Typography variant="body2" color="textSecondary">No active participants found for today.</Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </MainCard>
          </Stack>
        </Grid>

        {/* RIGHT COLUMN */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Out-Area Check-In Requests */}
            <MainCard
              title="Out-Area Check-In Requests"
              secondary={
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={`${pendingRequests?.length || 0} Pending`}
                    size="small"
                    color="warning"
                    variant="light"
                    sx={{ fontWeight: 600 }}
                  />
                  <Typography variant="caption" color="primary" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                    View All
                  </Typography>
                </Stack>
              }
            >
              <Box sx={{ minHeight: 100 }}>
                {requestsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                    <CircularProgress size={32} />
                  </Box>
                ) : pendingRequests && pendingRequests.length > 0 ? (
                  <Stack spacing={2}>
                    {pendingRequests.map((request) => (
                      <Paper
                        key={request.id}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.divider}`,
                          bgcolor: alpha(theme.palette.primary.main, 0.02),
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
                            bgcolor: alpha(theme.palette.primary.main, 0.04)
                          }
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          <Avatar
                            sx={{
                              width: 44,
                              height: 44,
                              bgcolor: theme.palette.primary.lighter,
                              color: theme.palette.primary.main,
                              fontSize: '1rem',
                              fontWeight: 700
                            }}
                          >
                            {request.user?.name.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                {request.user?.name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {new Date(request.request_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                            </Stack>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                              <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                                {request.location_name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">•</Typography>
                              <Typography variant="caption" color="textSecondary">
                                {request.user?.unit?.name || 'General'}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                px: 1.5,
                                py: 1,
                                bgcolor: 'white',
                                borderRadius: 1.5,
                                border: `1px dashed ${theme.palette.divider}`,
                                mb: 2
                              }}
                            >
                              <Typography variant="caption" color="textSecondary" sx={{ fontStyle: 'italic', display: 'block', lineHeight: 1.5 }}>
                                "{request.reason || 'No reason provided'}"
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={1.5}>
                              <Button
                                fullWidth
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={() => statusMutation.mutate({ id: request.id, status: 'approved' })}
                                disabled={statusMutation.isPending}
                                startIcon={<TickCircle variant="Bold" size={18} />}
                                sx={{
                                  borderRadius: 1.5,
                                  height: 38,
                                  boxShadow: 'none',
                                  '&:hover': { boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.2)}` }
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                fullWidth
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => statusMutation.mutate({ id: request.id, status: 'rejected' })}
                                disabled={statusMutation.isPending}
                                startIcon={<CloseCircle variant="Bold" size={18} />}
                                sx={{
                                  borderRadius: 1.5,
                                  height: 38,
                                  '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.05) }
                                }}
                              >
                                Reject
                              </Button>
                            </Stack>
                          </Box>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                      }}
                    >
                      <TickCircle size={32} color={theme.palette.success.main} variant="Bulk" />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>All Caught Up!</Typography>
                    <Typography variant="body2" color="textSecondary">No pending out-area check-in requests.</Typography>
                  </Box>
                )}
              </Box>
            </MainCard>

            {/* Presence Breakdown */}
            <MainCard title="Presence Breakdown">
              <Box sx={{ height: 200, display: 'flex', justifyContent: 'center' }}>
                <Doughnut data={doughnutData} options={{ cutout: '70%', plugins: { legend: { position: 'bottom' } } }} />
              </Box>
              <Stack spacing={1.5} sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="textSecondary">Present/On-site</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{presentCount}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="textSecondary">Absent/Remote</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{absentCount}</Typography>
                </Box>
              </Stack>
            </MainCard>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SupervisorDashboard;