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

// DIALOGS
import UserDialog from './components/UserDialog';
import UnitDialog from './components/UnitDialog';

// API & UTILS
import { createUser } from 'utils/api/users';
import { createUnit } from 'utils/api/units';
import { getManagementPageData } from 'utils/api/batch';
import { openAlert } from 'api/alert';
import { format } from 'date-fns';

import { useIntl, FormattedMessage } from 'react-intl';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const AdminDashboard = () => {
  const theme = useTheme();
  const intl = useIntl();
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [chartType, setChartType] = useState<'doughnut' | 'pie' | 'bar' | 'line'>('doughnut');

  const queryClient = useQueryClient();

  // Dialog State
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [unitDialogOpen, setUnitDialogOpen] = useState(false);

  // Reference Data for UserDialog
  const { data: referenceData } = useQuery({
    queryKey: ['management-reference-data'],
    queryFn: () => getManagementPageData({ fetchOnlyReference: true }),
    staleTime: 300000,
  });

  const allUnitsData = referenceData?.allUnitsData;
  const allSupervisorsData = referenceData?.allSupervisorsData;

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (newUser: any) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setUserDialogOpen(false);
      openAlert({
        variant: 'success',
        title: 'User Created',
        message: `User ${newUser.name} has been successfully added.`
      });
    },
    onError: (error: any) => {
      openAlert({
        variant: 'error',
        title: 'Creation Failed',
        message: error.message || 'Failed to create user.'
      });
    }
  });

  const createUnitMutation = useMutation({
    mutationFn: createUnit,
    onSuccess: (newUnit: any) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setUnitDialogOpen(false);
      openAlert({
        variant: 'success',
        title: 'Unit Created',
        message: `Unit ${newUnit.name} has been successfully created.`
      });
    },
    onError: (error: any) => {
      openAlert({
        variant: 'error',
        title: 'Creation Failed',
        message: error.message || 'Failed to create unit.'
      });
    }
  });

  const handleUserSubmit = (values: any) => {
    const data = {
      ...values,
      unit_id: values.unit_id || null,
      supervisor_id: values.role === 'participant' ? values.supervisor_id : null,
      internship_start: values.internship_start ? format(new Date(values.internship_start), 'yyyy-MM-dd') : null,
      internship_end: values.internship_end ? format(new Date(values.internship_end), 'yyyy-MM-dd') : null
    };
    createUserMutation.mutate(data);
  };

  const handleUnitSubmit = (data: any) => {
    createUnitMutation.mutate(data);
  };

  const [activityPageSize, setActivityPageSize] = useState(5);
  const [todayPageSize, setTodayPageSize] = useState(5);

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
    queryKey: ['recent-attendances', selectedDate, activityPageSize],
    queryFn: () => getAttendances({
      dateFrom: selectedDate,
      dateTo: selectedDate,
      pageSize: activityPageSize,
      page: 1 // Always first page for dashboard overview, just changing the limit
    }),
  });

  const { data: todayAttendancesData, isLoading: todayLoading } = useQuery({
    queryKey: ['today-attendances', selectedDate, todayPageSize],
    queryFn: () => getAttendances({
      dateFrom: selectedDate,
      dateTo: selectedDate,
      pageSize: todayPageSize,
      page: 1
    }),
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
                pageSize={activityPageSize}
                setPageSize={setActivityPageSize}
              />

              <TodayAttendanceTable
                todayAttendances={todayAttendances}
                isLoading={todayLoading}
                getStatusColor={getStatusColor}
                getStatusBg={getStatusBg}
                pageSize={todayPageSize}
                setPageSize={setTodayPageSize}
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

      {/* Dialogs */}
      <UserDialog
        open={userDialogOpen}
        onClose={() => setUserDialogOpen(false)}
        mode="create"
        user={null}
        onSubmit={handleUserSubmit}
        error={createUserMutation.error}
        isLoading={createUserMutation.isPending}
        allUnitsData={allUnitsData}
        allSupervisorsData={allSupervisorsData}
      />

      <UnitDialog
        open={unitDialogOpen}
        onClose={() => setUnitDialogOpen(false)}
        mode="create"
        unit={null}
        onSubmit={handleUnitSubmit}
        error={createUnitMutation.error}
        isLoading={createUnitMutation.isPending}
      />
    </Box>
  );
};

export default AdminDashboard;
