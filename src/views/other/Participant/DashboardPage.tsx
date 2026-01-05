'use client';

import React, { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// MATERIAL - UI
import {
  Grid,
  Typography,
  Box,
  Button,
  CircularProgress,
  Stack,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

// PROJECT IMPORTS
import MainCard from 'components/MainCard';
import { getAttendances, createAttendance, updateAttendance } from 'utils/api/attendances';
import { getCheckInLocation } from 'utils/api/settings';
import { getMonitoringRequests } from 'utils/api/monitoring';
import { getUserById } from 'utils/api/users';
import { openAlert } from 'api/alert';
import OutAreaRequestDialog from 'components/OutAreaRequestDialog';

// ICONS
import { Location, Timer1, Calendar, DirectNotification, GalleryAdd, Trash, Personalcard, Buildings, Activity } from 'iconsax-react';

const MapComponent = dynamic(() => import('components/MapComponent'), {
  ssr: false,
  loading: () => (
    <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}>
      <CircularProgress />
    </Box>
  )
});

const Alert = ({ children, severity, icon }: { children: React.ReactNode, severity: 'success' | 'info' | 'warning' | 'error', icon?: React.ReactNode }) => {
  const theme = useTheme();
  const color = severity === 'success' ? theme.palette.success : theme.palette.info;
  return (
    <Box sx={{
      p: 1.5,
      bgcolor: color.lighter,
      color: color.main,
      borderRadius: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      border: `1px solid ${color.light}`,
      mb: 2
    }}>
      {icon}
      <Typography variant="body2" sx={{ fontWeight: 600 }}>{children}</Typography>
    </Box>
  );
};

const DashboardAttendance = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [outAreaDialogOpen, setOutAreaDialogOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [activityPlan, setActivityPlan] = useState('');
  const [attendancePhoto, setAttendancePhoto] = useState<string | null>(null);
  const [todayAttendanceId, setTodayAttendanceId] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  // Fetch full user profile for supervisor info
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId
  });

  // Fetch admin settings for check-in location
  const { data: locationSettings } = useQuery({
    queryKey: ['check-in-location'],
    queryFn: getCheckInLocation
  });

  const adminPosition: [number, number] = locationSettings ? [locationSettings.latitude, locationSettings.longitude] : [-6.974580, 107.630910];
  const adminAddress = locationSettings?.address || 'Jl. Telekomunikasi No.1, Sukapura, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257';
  const adminRadius = locationSettings?.radius || 100;

  // Fetch approved monitoring requests for today
  const { data: approvedRequests } = useQuery({
    queryKey: ['approved-monitoring-requests', userId, today],
    queryFn: () => getMonitoringRequests({ userId: userId, status: 'approved' }),
    enabled: !!userId
  });

  // Get user's current location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          console.log('📍 User Current Location Detected:', [position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Fetch user's attendance history
  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['user-attendances', userId],
    queryFn: () => getAttendances({ userId: userId, pageSize: 30 }),
    enabled: !!userId
  });

  // Check if user has checked in today
  const todayAttendance = useMemo(() => {
    const attendances = attendanceData?.attendances || [];
    return attendances.find(a => a.date === today);
  }, [attendanceData, today]);

  useEffect(() => {
    if (todayAttendance) {
      setTodayAttendanceId(todayAttendance.id);
    }
  }, [todayAttendance]);

  // Calculate attendance rate from history
  const calcAttendanceRate = useMemo(() => {
    const records = attendanceData?.attendances || [];
    if (records.length === 0) return 0;
    const presentCount = records.filter(p => p.status === 'present' || p.status === 'late').length;
    return Math.round((presentCount / records.length) * 100);
  }, [attendanceData]);

  const checkedIn = !!todayAttendance?.check_in_time;
  const checkedOut = !!todayAttendance?.check_out_time;

  // Haversine formula to calculate distance in meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const dPhi = (lat2 - lat1) * Math.PI / 180;
    const dLambda = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dPhi / 2) * Math.sin(dPhi / 2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) * Math.sin(dLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Determine if user is currently out of area
  const isOutOfArea = useMemo(() => {
    if (!userLocation) return false;

    const distanceToAdmin = calculateDistance(userLocation[0], userLocation[1], adminPosition[0], adminPosition[1]);
    const isInApprovedArea = approvedRequests?.some(req => {
      const dist = calculateDistance(userLocation[0], userLocation[1], req.latitude || 0, req.longitude || 0);
      return dist <= 100;
    });

    return distanceToAdmin > adminRadius && !isInApprovedArea;
  }, [userLocation, adminPosition, adminRadius, approvedRequests]);

  const handleCheckIn = () => {
    if (!userId || todayAttendance || checkInMutation.isPending) return;

    if (!userLocation) {
      openAlert({
        title: 'Location Required',
        message: 'Please enable GPS/Location access to check in.',
        variant: 'warning'
      });
      return;
    }

    if (isOutOfArea) {
      openAlert({
        title: 'Outside Check-in Area',
        message: `You are outside the designated area. Do you want to submit a check-in request for your current location instead?`,
        variant: 'info',
        showCancel: true,
        confirmText: 'Yes, Submit Request',
        onConfirm: () => setOutAreaDialogOpen(true)
      });
      return;
    }

    checkInMutation.mutate();
  };

  const checkInMutation = useMutation({
    mutationFn: async () => {
      const now = new Date();
      return createAttendance({
        user_id: userId,
        date: today,
        check_in_time: now.toTimeString().slice(0, 8),
        status: 'present',
        activity_description: JSON.stringify({
          check_in_location: userLocation
        })
      } as any);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-attendances'] });
      setTodayAttendanceId(data.id);
      openAlert({ title: 'Checked In!', message: 'You have successfully checked in.', variant: 'success' });
    }
  });

  const handleCheckOut = () => {
    if (!todayAttendanceId) return;

    openAlert({
      title: 'Confirm Check-out',
      message: 'Are you sure you want to check-out now? Please make sure you have filled in your activity plan.',
      variant: 'warning',
      showCancel: true,
      confirmText: 'Yes, Check-out',
      onConfirm: () => checkOutMutation.mutate()
    });
  };

  const checkOutMutation = useMutation({
    mutationFn: async () => {
      const now = new Date();

      // Get existing data to preserve check_in_location
      const existingData = todayAttendance?.activity_description ? JSON.parse(todayAttendance.activity_description) : {};

      return updateAttendance(todayAttendanceId!, {
        check_out_time: now.toTimeString().slice(0, 8),
        activity_description: JSON.stringify({
          ...existingData,
          plan: activityPlan,
          photo: attendancePhoto
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-attendances'] });
      setActivityPlan('');
      setAttendancePhoto(null);
      openAlert({ title: 'Checked Out!', message: 'You have completed your attendance.', variant: 'success' });
    }
  });

  const getStatusColor = (status: any) => {
    switch (status) {
      case 'present': return 'success';
      case 'late': return 'warning';
      case 'absent': return 'error';
      default: return 'default';
    }
  };

  if (attendanceLoading || profileLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Card 1: My Supervisor */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={0} sx={{
            p: 2.5,
            borderRadius: 4,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            height: '100%',
            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`
          }}>
            <Stack spacing={1}>
              <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500 }}>My Supervisor</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800 }}>{userProfile?.supervisor?.name || 'Not Assigned'}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 600 }}>Report directly to this person</Typography>
            </Stack>
            <Personalcard size={70} variant="Bulk" style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.2 }} />
          </Paper>
        </Grid>

        {/* Card 2: Unit & Department */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={0} sx={{
            p: 2.5,
            borderRadius: 4,
            background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            height: '100%',
            boxShadow: `0 8px 24px ${alpha(theme.palette.success.main, 0.25)}`
          }}>
            <Stack spacing={1}>
              <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500 }}>Unit / Department</Typography>
              <Typography variant="h3" sx={{ fontWeight: 800 }}>{userProfile?.unit?.name || 'General'}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 600 }}>{userProfile?.unit?.department || 'Department'}</Typography>
            </Stack>
            <Buildings size={70} variant="Bulk" style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.2 }} />
          </Paper>
        </Grid>

        {/* Card 3: Performance Info */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={0} sx={{
            p: 2.5,
            borderRadius: 4,
            background: `linear-gradient(45deg, ${theme.palette.warning.main}, #e67e22)`,
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            height: '100%',
            boxShadow: `0 8px 24px ${alpha(theme.palette.warning.main, 0.25)}`
          }}>
            <Stack spacing={1}>
              <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500 }}>Attendance Rate</Typography>
              <Typography variant="h2" sx={{ fontWeight: 800 }}>{calcAttendanceRate}%</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 600 }}>Based on last 30 recorded days</Typography>
            </Stack>
            <Activity size={70} variant="Bulk" style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.2 }} />
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            <MainCard title="Attendance Map" secondary={<Chip icon={<Location size={16} />} label={adminAddress} variant="outlined" size="small" />}>
              <Box sx={{ height: 400, width: '100%', borderRadius: 2, overflow: 'hidden' }}>
                <MapComponent
                  position={adminPosition}
                  address={adminAddress}
                  userPosition={userLocation}
                  radius={adminRadius}
                />
              </Box>
            </MainCard>

            <MainCard title="Attendance History">
              <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: theme.palette.grey[50] }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Check In</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Check Out</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendanceData?.attendances?.map((record) => (
                      <TableRow key={record.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{record.date}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{record.check_in_time || '-'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{record.check_out_time || '-'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={record.status}
                            size="small"
                            color={getStatusColor(record.status)}
                            sx={{ textTransform: 'capitalize', fontWeight: 600, px: 1 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!attendanceData?.attendances || attendanceData.attendances.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="textSecondary">No attendance history found</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </MainCard>
          </Stack>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <MainCard title="Today's Attendance">
              {!checkedIn ? (
                <Stack spacing={2}>
                  <Typography variant="body2" color="textSecondary">
                    You haven't checked in yet today. Please make sure you are within the designated area.
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<Timer1 />}
                    onClick={handleCheckIn}
                    disabled={checkInMutation.isPending}
                  >
                    {checkInMutation.isPending ? 'Processing...' : 'Check In Now'}
                  </Button>

                  {isOutOfArea && (
                    <Button variant="outlined" fullWidth color="secondary" onClick={() => setOutAreaDialogOpen(true)}>
                      Request Out-Area Check-In
                    </Button>
                  )}
                </Stack>
              ) : !checkedOut ? (
                <Stack spacing={2}>
                  <Alert severity="success" icon={<DirectNotification />}>
                    Checked in at {todayAttendance?.check_in_time}
                  </Alert>
                  <Typography variant="subtitle2">Activity Plan / Summary</Typography>
                  <textarea
                    value={activityPlan}
                    onChange={(e) => setActivityPlan(e.target.value)}
                    placeholder="What are you working on today?"
                    style={{
                      width: '100%',
                      minHeight: 100,
                      padding: 12,
                      borderRadius: 8,
                      border: `1px solid ${theme.palette.divider}`,
                      fontFamily: 'inherit',
                      fontSize: '0.875rem'
                    }}
                  />

                  <Typography variant="subtitle2">Evidence Photo (Optional)</Typography>
                  {!attendancePhoto ? (
                    <Box
                      sx={{
                        border: `2px dashed ${theme.palette.divider}`,
                        borderRadius: 2,
                        p: 3,
                        textAlign: 'center',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05), borderColor: theme.palette.primary.main }
                      }}
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e: any) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (readerEvent) => {
                              setAttendancePhoto(readerEvent.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        };
                        input.click();
                      }}
                    >
                      <GalleryAdd size={32} style={{ opacity: 0.5, marginBottom: 8 }} />
                      <Typography variant="caption" display="block" color="textSecondary">
                        Click to upload or take a photo
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', height: 150 }}>
                      <img
                        src={attendancePhoto}
                        alt="Attendance evidence"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <IconButton
                        size="small"
                        sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: '#fff' } }}
                        onClick={() => setAttendancePhoto(null)}
                      >
                        <Trash size={16} color={theme.palette.error.main} />
                      </IconButton>
                    </Box>
                  )}
                  <Button
                    variant="contained"
                    color="error"
                    fullWidth
                    size="large"
                    onClick={handleCheckOut}
                    disabled={checkOutMutation.isPending}
                  >
                    {checkOutMutation.isPending ? 'Processing...' : 'Check Out Now'}
                  </Button>
                </Stack>
              ) : (
                <Stack spacing={2} alignItems="center" sx={{ py: 2 }}>
                  <Avatar sx={{ width: 64, height: 64, bgcolor: theme.palette.success.lighter, color: theme.palette.success.main, mb: 1 }}>
                    <Calendar variant="Bold" />
                  </Avatar>
                  <Typography variant="h5">All Done!</Typography>
                  <Typography variant="body2" color="textSecondary" textAlign="center">
                    You have completed your attendance and activity record for today.
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ width: '100%', mt: 1 }}>
                    <Box sx={{ flex: 1, p: 2, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}>
                      <Typography variant="caption" color="textSecondary">IN</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{todayAttendance?.check_in_time}</Typography>
                    </Box>
                    <Box sx={{ flex: 1, p: 2, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}>
                      <Typography variant="caption" color="textSecondary">OUT</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{todayAttendance?.check_out_time}</Typography>
                    </Box>
                  </Stack>
                </Stack>
              )}
            </MainCard>
          </Stack>
        </Grid>

        <OutAreaRequestDialog
          open={outAreaDialogOpen}
          onClose={() => setOutAreaDialogOpen(false)}
          userId={userId || ''}
        />
      </Grid>
    </Box>
  );
};

export default DashboardAttendance;
