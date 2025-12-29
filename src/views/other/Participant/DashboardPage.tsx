'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';
import { Button, Box, CircularProgress, Alert, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAttendances, createAttendance, updateAttendance } from 'utils/api/attendances';
import { supabase } from 'lib/supabase/client';

const MapComponent = dynamic(() => import('components/MapComponent'), {
  ssr: false,
  loading: () => <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}><CircularProgress /></Box>
});


const DashboardAttendance = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();

  // Koordinat lokasi Telkom University
  const position: [number, number] = [-6.974580, 107.630910];
  const address = 'Jl. Telekomunikasi No.1, Sukapura, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40257';

  const [activityPlan, setActivityPlan] = React.useState('');
  const [todayAttendanceId, setTodayAttendanceId] = React.useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  // Fetch user's attendance history
  const { data: attendanceData, isLoading: attendanceLoading, error: attendanceError } = useQuery({
    queryKey: ['user-attendances'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      return getAttendances({
        userId: user.id,
        pageSize: 30
      });
    }
  });

  // Check if user has checked in today
  const todayAttendance = React.useMemo(() => {
    const attendances = attendanceData?.attendances || [];
    const todayRecord = attendances.find(a => a.date === today);
    if (todayRecord) {
      setTodayAttendanceId(todayRecord.id);
    }
    return todayRecord;
  }, [attendanceData, today]);

  const checkedIn = !!todayAttendance?.check_in_time;
  const checkedOut = !!todayAttendance?.check_out_time;

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const now = new Date();
      const checkInTime = now.toTimeString().slice(0, 8);

      return createAttendance({
        user_id: user.id,
        date: today,
        check_in_time: checkInTime,
        status: 'present'
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-attendances'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setTodayAttendanceId(data.id);
    },
  });

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: async () => {
      if (!todayAttendanceId) throw new Error('No check-in record found');

      const now = new Date();
      const checkOutTime = now.toTimeString().slice(0, 8);

      return updateAttendance(todayAttendanceId, {
        check_out_time: checkOutTime,
        activity_description: activityPlan
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-attendances'] });
      setActivityPlan('');
    },
  });

  const handleCheckIn = () => {
    checkInMutation.mutate();
  };

  const handleCheckOut = () => {
    checkOutMutation.mutate();
  };

  // Calculate working hours
  const calculateWorkingHours = (checkIn?: string | null, checkOut?: string | null) => {
    if (!checkIn || !checkOut) return '-';
    const [h1, m1] = checkIn.split(':').map(Number);
    const [h2, m2] = checkOut.split(':').map(Number);
    const totalMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const getDayName = (dateStr: string) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(dateStr);
    return days[date.getDay()];
  };

  return (
    <>
      {(checkInMutation.isError || checkOutMutation.isError || attendanceError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error: {((checkInMutation.error || checkOutMutation.error || attendanceError) as Error)?.message}
        </Alert>
      )}

      <MainCard border={false} shadow={theme.customShadows.z1} sx={{ width: '100%', maxWidth: 1200, margin: '0 auto', mb: 3, p: { xs: 1, md: 2 } }}>
        <Typography variant="h4" sx={{ mb: 2, fontSize: { xs: '1.25rem', md: '1.75rem' } }}>
          Today's Attendance
        </Typography>
        {checkInMutation.isPending ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: { xs: 250, md: 320 }, mb: 2 }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="body1">Checking in...</Typography>
          </Box>
        ) : !checkedIn ? (
          <>
            <Box sx={{ width: '100%', height: { xs: 200, md: 320 }, mb: 2, borderRadius: 2, overflow: 'hidden' }}>
              <MapComponent position={position} address={address} />
            </Box>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              onClick={handleCheckIn}
              disabled={checkInMutation.isPending}
            >
              Check In Now
            </Button>
          </>
        ) : !checkedOut ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
            <Typography variant="body1" color="success.main" sx={{ fontWeight: 600 }}>
              ✓ Checked in at {todayAttendance?.check_in_time}
            </Typography>
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Today's Activity Plan</Typography>
              <textarea
                value={activityPlan}
                onChange={e => setActivityPlan(e.target.value)}
                placeholder="Describe your activity plan..."
                style={{ width: '100%', minHeight: 100, padding: 12, borderRadius: 8, border: '1px solid #ccc', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </Box>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={handleCheckOut}
              disabled={checkOutMutation.isPending}
              sx={{ py: 1.5 }}
            >
              {checkOutMutation.isPending ? 'Checking out...' : 'Check Out & Finish'}
            </Button>
          </Box>
        ) : (
          <Box sx={{ p: 2, bgcolor: theme.palette.success.lighter, borderRadius: 1, border: `1px solid ${theme.palette.success.light}` }}>
            <Typography variant="h6" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span className="material-symbols-outlined">check_circle</span>
              Attendance completed for today
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, fontWeight: 500 }}>
              Check-in: {todayAttendance?.check_in_time} | Check-out: {todayAttendance?.check_out_time}
            </Typography>
          </Box>
        )}
      </MainCard>

      <MainCard border={false} shadow={theme.customShadows.z1} sx={{ width: '100%', maxWidth: 1200, margin: '0 auto', p: { xs: 1, md: 2 } }}>
        <Typography variant="h4" sx={{ mb: 2, fontSize: { xs: '1.25rem', md: '1.75rem' } }}>
          Attendance History
        </Typography>
        {attendanceLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 650 }}>
              <thead style={{ background: theme.palette.grey[100] }}>
                <tr>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: `1px solid ${theme.palette.divider}` }}>Date</th>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: `1px solid ${theme.palette.divider}` }}>Day</th>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: `1px solid ${theme.palette.divider}` }}>Check-In</th>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: `1px solid ${theme.palette.divider}` }}>Check-Out</th>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: `1px solid ${theme.palette.divider}` }}>Working Hours</th>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: `1px solid ${theme.palette.divider}` }}>Status</th>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: `1px solid ${theme.palette.divider}` }}>Activity Plan</th>
                </tr>
              </thead>
              <tbody>
                {!attendanceData?.attendances?.length ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 24, textAlign: 'center' }}>No attendance records available.</td>
                  </tr>
                ) : (
                  attendanceData.attendances.map((row) => (
                    <tr key={row.id}>
                      <td style={{ padding: 12, borderBottom: `1px solid ${theme.palette.divider}` }}>{row.date}</td>
                      <td style={{ padding: 12, borderBottom: `1px solid ${theme.palette.divider}` }}>{getDayName(row.date)}</td>
                      <td style={{ padding: 12, borderBottom: `1px solid ${theme.palette.divider}` }}>{row.check_in_time || '-'}</td>
                      <td style={{ padding: 12, borderBottom: `1px solid ${theme.palette.divider}` }}>{row.check_out_time || '-'}</td>
                      <td style={{ padding: 12, borderBottom: `1px solid ${theme.palette.divider}` }}>{calculateWorkingHours(row.check_in_time, row.check_out_time)}</td>
                      <td style={{ padding: 12, borderBottom: `1px solid ${theme.palette.divider}` }}>
                        <Chip
                          label={row.status}
                          size="small"
                          color={row.status === 'present' ? 'success' : row.status === 'late' ? 'warning' : 'error'}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </td>
                      <td style={{ padding: 12, borderBottom: `1px solid ${theme.palette.divider}` }}>{row.activity_description || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Box>
        )}
      </MainCard>
    </>
  );
};

export default DashboardAttendance;
