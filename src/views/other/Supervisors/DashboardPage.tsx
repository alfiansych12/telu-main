'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

// MATERIAL - UI
import {
  Grid,
  Box,
  CircularProgress,
  Stack,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler } from 'chart.js';

// PROJECT IMPORTS
import { getMonitoringRequests, updateMonitoringRequest } from 'utils/api/monitoring';
import { getAttendances, getWeeklyAttendanceTrend } from 'utils/api/attendances';
import { getUsers } from 'utils/api/users';
import { getUnits } from 'utils/api/units';
import { getCheckInLocation } from 'utils/api/settings';
import MainCard from 'components/MainCard';
import LeaveRequestList from 'components/LeaveRequestList';
import { openAlert } from 'api/alert';
import { formatTime } from 'utils/format';
import { AttendanceWithRelations } from 'types/api';

// LOCAL COMPONENTS
import SupervisorDashboardFilters from './components/SupervisorDashboardFilters';
import SupervisorStatusCards from './components/SupervisorStatusCards';
import WeeklyTrendChart from './components/WeeklyTrendChart';
import TeamDistributionMap from './components/TeamDistributionMap';
import MonitoringRequestList from './components/MonitoringRequestList';
import PresenceBreakdown from './components/PresenceBreakdown';

import { FormattedMessage, useIntl } from 'react-intl';

// Register ChartJS
ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, Filler);

const SupervisorDashboard = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const intl = useIntl();
  const today = new Date().toISOString().split('T')[0];
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(today);

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
      unitId: selectedUnit === 'all' ? undefined : selectedUnit,
    }),
    enabled: !!userId,
    refetchOnWindowFocus: true,
    staleTime: 10000
  });

  // 2. Fetch Today's Attendances
  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance-data', selectedDate, userId, selectedUnit],
    queryFn: () => getAttendances({
      dateFrom: selectedDate,
      dateTo: selectedDate,
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

  // 4. Fetch Weekly Trend for Chart
  const { data: trendData } = useQuery({
    queryKey: ['weekly-trend', userId, selectedUnit],
    queryFn: () => getWeeklyAttendanceTrend(
      userId,
      selectedUnit === 'all' ? undefined : selectedUnit
    ),
    enabled: !!userId
  });

  // 5. Fetch Check-in Settings for Map
  const { data: locationSettings } = useQuery({
    queryKey: ['system-checkin-location'],
    queryFn: () => getCheckInLocation()
  });

  // Mutations
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'approved' | 'rejected' }) =>
      updateMonitoringRequest(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-requests'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-data'] });
      openAlert({
        title: intl.formatMessage({ id: 'Success' }),
        message: intl.formatMessage({ id: 'monitoring.request_updated' }, { status: variables.status }),
        variant: 'success'
      });
    },
    onError: (error: any) => {
      openAlert({
        title: intl.formatMessage({ id: 'Error' }),
        message: intl.formatMessage({ id: 'monitoring.update_failed' }) + ': ' + error.message,
        variant: 'error'
      });
    }
  });

  // 4. Data processing
  const memoizedData = useMemo(() => {
    const interns = Array.isArray(teamData) ? teamData : (teamData?.data || []);
    const totalInterns = interns.length;
    const todayAttendances = Array.isArray(attendanceData) ? attendanceData : (attendanceData?.data || []);
    const presentCount = todayAttendances.filter((a: AttendanceWithRelations) => a.status === 'present' || a.status === 'late').length;
    const absentCount = Math.max(0, totalInterns - presentCount);
    const attendanceRate = totalInterns > 0 ? Math.round((presentCount / totalInterns) * 100) : 0;

    // Chart Data
    const doughnutData = {
      labels: [intl.formatMessage({ id: 'Present' }), intl.formatMessage({ id: 'Absent' })],
      datasets: [{
        data: [presentCount, absentCount],
        backgroundColor: [theme.palette.success.main, theme.palette.error.light],
        hoverOffset: 4,
        borderWidth: 0,
      }]
    };

    const displayTrend = Array.isArray(trendData) ? trendData : ((trendData as any)?.data || []);
    const lineLabels = displayTrend.map((t: any) => t.day) || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const lineCounts = displayTrend.map((t: any) => t.count) || [0, 0, 0, 0, 0, 0, 0];

    const lineData = {
      labels: lineLabels,
      datasets: [{
        label: intl.formatMessage({ id: 'monitoring.team_presence' }),
        data: lineCounts,
        fill: true,
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        tension: 0.4
      }]
    };

    const markers: any[] = [
      {
        position: locationSettings ? [locationSettings.latitude, locationSettings.longitude] : [-6.974580, 107.630910],
        title: locationSettings ? `Unit Base (${locationSettings.address.substring(0, 20)}...)` : intl.formatMessage({ id: 'monitoring.unit_base' }),
        type: 'admin'
      }
    ];

    todayAttendances.forEach((attendance: AttendanceWithRelations) => {
      try {
        const meta = attendance.activity_description ? JSON.parse(attendance.activity_description) : null;
        if (meta && meta.check_in_location) {
          markers.push({
            position: meta.check_in_location,
            title: attendance.user?.name || intl.formatMessage({ id: 'Unknown User' }),
            subtitle: intl.formatMessage({ id: 'monitoring.checked_in_at' }, { time: formatTime(attendance.check_in_time) }),
            type: 'user'
          });
        }
      } catch (e) {
        // Silently skip if not parsable
      }
    });

    // Add Pending Requests to Map
    const displayRequests = Array.isArray(pendingRequests) ? pendingRequests : ((pendingRequests as any)?.data || []);
    displayRequests.forEach((request: any) => {
      if (request.latitude && request.longitude) {
        markers.push({
          position: [Number(request.latitude), Number(request.longitude)],
          title: intl.formatMessage({ id: 'monitoring.request_label' }, { name: request.user?.name }),
          subtitle: intl.formatMessage({ id: 'monitoring.reason_label' }, { reason: request.reason }),
          type: 'request'
        });
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
      todayAttendances,
      displayRequests,
      adminPosition: locationSettings ? [locationSettings.latitude, locationSettings.longitude] as [number, number] : [-6.974580, 107.630910] as [number, number],
      adminAddress: locationSettings?.address || intl.formatMessage({ id: 'monitoring.unit_base' }),
      adminRadius: locationSettings?.radius || 100
    };
  }, [teamData, attendanceData, trendData, locationSettings, theme, pendingRequests, intl]);

  const {
    totalInterns,
    presentCount,
    absentCount,
    attendanceRate,
    doughnutData,
    lineData,
    mapMarkers,
    todayAttendances,
    adminPosition,
    adminAddress,
    adminRadius,
    displayRequests
  } = memoizedData;

  const handleStatusUpdate = (id: string, status: 'approved' | 'rejected') => {
    statusMutation.mutate({ id, status });
  };

  return (
    <Box sx={{ px: 1 }}>
      <SupervisorDashboardFilters
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedUnit={selectedUnit}
        setSelectedUnit={setSelectedUnit}
        unitsData={unitsData}
      />

      {teamLoading || attendanceLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <SupervisorStatusCards
            totalInterns={totalInterns}
            presentCount={presentCount}
            attendanceRate={attendanceRate}
            pendingRequestsCount={displayRequests.length}
          />

          <Grid container spacing={3} sx={{ mt: 0 }}>
            {/* LEFT COLUMN */}
            <Grid item xs={12} lg={8}>
              <Stack spacing={3}>
                <WeeklyTrendChart lineData={lineData} />
                <TeamDistributionMap
                  adminPosition={adminPosition}
                  adminAddress={adminAddress}
                  adminRadius={adminRadius}
                  mapMarkers={mapMarkers}
                  todayAttendances={todayAttendances}
                />
              </Stack>
            </Grid>

            {/* RIGHT COLUMN */}
            <Grid item xs={12} lg={4}>
              <Stack spacing={3}>
                <MonitoringRequestList
                  pendingRequests={displayRequests}
                  requestsLoading={requestsLoading}
                  onStatusUpdate={handleStatusUpdate}
                  statusMutationIsPending={statusMutation.isPending}
                />

                <MainCard title={<FormattedMessage id="monitoring.leave_sick_requests" />}>
                  <LeaveRequestList supervisorId={userId} unitId={selectedUnit} />
                </MainCard>

                <PresenceBreakdown
                  doughnutData={doughnutData}
                  presentCount={presentCount}
                  absentCount={absentCount}
                />
              </Stack>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default SupervisorDashboard;