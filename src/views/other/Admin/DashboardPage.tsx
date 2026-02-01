'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// MATERIAL - UI
import {
  Box,
  Grid,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

// PROJECT IMPORTS
import { getAttendances } from 'utils/api/attendances';

// ICONS
import { Clock, TickCircle, CloseCircle, Warning2 } from 'iconsax-react';

// LOCAL COMPONENTS
import DashboardFilters from './components/DashboardFilters';
import RecentActivityTimeline from './components/RecentActivityTimeline';
import TodayAttendanceTable from './components/TodayAttendanceTable';
import AttendanceCharts from './components/AttendanceCharts';

import { useIntl, FormattedMessage } from 'react-intl';

const AdminDashboard = () => {
  const theme = useTheme();
  const intl = useIntl();
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [chartType, setChartType] = useState<'doughnut' | 'pie' | 'bar' | 'line'>('doughnut');

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) {
        throw new Error(intl.formatMessage({ id: 'admin.dashboard.stats_fetch_failed' }));
      }
      return response.json();
    },
    staleTime: 0,
    refetchOnMount: 'always'
  });

  const { data: recentAttendancesData, isLoading: activityLoading } = useQuery({
    queryKey: ['recent-attendances', selectedDate],
    queryFn: () => getAttendances({
      dateFrom: selectedDate,
      dateTo: selectedDate,
      pageSize: 10
    }),
  });

  const { data: todayAttendancesData, isLoading: todayLoading } = useQuery({
    queryKey: ['today-attendances', selectedDate],
    queryFn: () => getAttendances({ dateFrom: selectedDate, dateTo: selectedDate, pageSize: 10 }),
  });

  // Derived values - safely handle null/undefined
  const totalParticipants = stats?.totalParticipants || 0;
  const todayPresent = stats?.todayPresent || 0;
  const attendancePercentage = totalParticipants > 0
    ? Math.round((todayPresent / totalParticipants) * 100)
    : 0;

  const doughnutData = {
    labels: [intl.formatMessage({ id: 'Present' }), intl.formatMessage({ id: 'Absent' })],
    datasets: [{
      data: [todayPresent, totalParticipants - todayPresent],
      backgroundColor: ['#2ecc71', '#e74c3c'],
      borderWidth: 0,
    }]
  };

  const placementData = {
    labels: stats?.unitDistribution?.map((u: any) => u.name) || [],
    datasets: [{
      label: intl.formatMessage({ id: 'admin.dashboard.participants' }),
      data: stats?.unitDistribution?.map((u: any) => u.count) || [],
      backgroundColor: theme.palette.primary.main,
      borderRadius: 8,
    }]
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <TickCircle size={20} variant="Bold" color="#2ecc71" />;
      case 'late': return <Clock size={20} variant="Bold" color="#f39c12" />;
      case 'absent': return <CloseCircle size={20} variant="Bold" color="#e74c3c" />;
      default: return <Warning2 size={20} variant="Bold" color="#95a5a6" />;
    }
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case 'present': return theme.palette.success.main;
      case 'late': return theme.palette.warning.main;
      case 'absent': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusBg = (status: any) => {
    switch (status) {
      case 'present': return alpha(theme.palette.success.main, 0.1);
      case 'late': return alpha(theme.palette.warning.main, 0.1);
      case 'absent': return alpha(theme.palette.error.main, 0.1);
      default: return alpha(theme.palette.grey[500], 0.1);
    }
  };

  const recentAttendances = recentAttendancesData?.data || [];
  const todayAttendances = todayAttendancesData?.data || [];

  return (
    <Box sx={{ px: 1 }}>
      <DashboardFilters
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      {statsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      ) : !stats ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Typography color="error" variant="h6">
            <FormattedMessage id="admin.dashboard.stats_fetch_failed" />
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} lg={5}>
            <Stack spacing={4}>
              <RecentActivityTimeline
                recentAttendances={recentAttendances}
                isLoading={activityLoading}
                getStatusColor={getStatusColor}
                getStatusBg={getStatusBg}
                getStatusIcon={getStatusIcon}
              />

              <TodayAttendanceTable
                todayAttendances={todayAttendances}
                isLoading={todayLoading}
                getStatusColor={getStatusColor}
                getStatusBg={getStatusBg}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} lg={7}>
            <AttendanceCharts
              chartType={chartType}
              setChartType={setChartType}
              doughnutData={doughnutData}
              attendancePercentage={attendancePercentage}
              todayPresent={todayPresent}
              totalParticipants={totalParticipants}
              placementData={placementData}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AdminDashboard;
