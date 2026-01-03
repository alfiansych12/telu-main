'use client';
import React from 'react';

// MATERIAL - UI
import Typography from '@mui/material/Typography';

// PROJECT IMPORTS
import MainCard from 'components/MainCard';
import { Button, Box, CircularProgress, Chip, Avatar, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CustomBreadcrumbs from 'components/@extended/CustomBreadcrumbs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMonitoringRequests, updateMonitoringRequest } from 'utils/api/monitoring';
import { getAttendances, AttendanceWithUser } from 'utils/api/attendances';
import { getUsers } from 'utils/api/users';

// ==============================|| DASHBOARD VIEW ||============================== //

const DashboardView = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  // Fetch monitoring requests (check-in requests)
  const { data: monitoringRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['monitoring-requests', 'pending'],
    queryFn: () => getMonitoringRequests({ status: 'pending' })
  });

  // Fetch today's attendance
  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['today-attendance', today],
    queryFn: () => getAttendances({
      dateFrom: today,
      dateTo: today,
      pageSize: 100
    })
  });

  // Fetch all interns (participants)
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['interns'],
    queryFn: () => getUsers({ role: 'participant', pageSize: 100 })
  });

  // Approve request mutation
  const approveMutation = useMutation({
    mutationFn: (id: string) => updateMonitoringRequest(id, 'approved'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-requests'] });
    }
  });

  // Reject request mutation
  const rejectMutation = useMutation({
    mutationFn: (id: string) => updateMonitoringRequest(id, 'rejected', 'Request denied'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitoring-requests'] });
    }
  });

  const pendingRequests = monitoringRequests || [];
  const attendances = attendanceData?.attendances || [];
  const interns = usersData?.users || [];
  const activeInterns = interns.filter(u => u.status === 'active').length;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getTimeAgo = (dateStr: string) => {
    const now = new Date();
    const created = new Date(dateStr);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <>
      <MainCard border={false} shadow={theme.customShadows.z1} sx={{ mb: 3, p: 0 }}>
        <CustomBreadcrumbs
          items={['Dashboard',]}
          showDate
          showExport
        />
      </MainCard>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={4} sm={6} md={4}>
          <MainCard border={false} shadow={theme.customShadows.z1} sx={{ height: '100%', p: { xs: 0.5, md: 2 } }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '0.65rem', sm: '0.9rem', md: '1.1rem' } }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>groups</span>
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>My</Box> Interns
            </Typography>
            {usersLoading ? (
              <CircularProgress size={16} sx={{ mt: 1 }} />
            ) : (
              <Typography variant="h4" sx={{ mt: 0.5, fontSize: { xs: '1.1rem', sm: '1.75rem', md: '2.25rem' }, fontWeight: 700 }}>{interns.length}</Typography>
            )}
          </MainCard>
        </Grid>

        <Grid item xs={4} sm={6} md={4}>
          <MainCard border={false} shadow={theme.customShadows.z1} sx={{ height: '100%', p: { xs: 0.5, md: 2 } }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '0.65rem', sm: '0.9rem', md: '1.1rem' } }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
              Active<Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}> Internship</Box>
            </Typography>
            {usersLoading ? (
              <CircularProgress size={16} sx={{ mt: 1 }} />
            ) : (
              <Typography variant="h4" sx={{ mt: 0.5, fontSize: { xs: '1.1rem', sm: '1.75rem', md: '2.25rem' }, fontWeight: 700 }}>{activeInterns}</Typography>
            )}
          </MainCard>
        </Grid>

        <Grid item xs={4} sm={6} md={4}>
          <MainCard border={false} shadow={theme.customShadows.z1} sx={{ height: '100%', p: { xs: 0.5, md: 2 } }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '0.65rem', sm: '0.9rem', md: '1.1rem' } }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>schedule</span>
              Request<Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}> Check-in</Box>
            </Typography>
            {requestsLoading ? (
              <CircularProgress size={16} sx={{ mt: 1 }} />
            ) : (
              <Typography variant="h4" sx={{ mt: 0.5, fontSize: { xs: '1.1rem', sm: '1.75rem', md: '2.25rem' }, fontWeight: 700 }}>{pendingRequests.length}</Typography>
            )}
          </MainCard>
        </Grid>
      </Grid>

      {/* Main Content - Request Check-in and Attendance */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3, mb: 3 }}>
        {/* Card Request Check-in - Only show if there are requests */}
        {pendingRequests.length > 0 && (
          <MainCard border={false} shadow={theme.customShadows.z1} sx={{ flex: 1, maxWidth: { lg: 400 }, p: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>schedule</span>
              Request Check-in
            </Typography>

            {requestsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* First request */}
                {pendingRequests[0] && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ width: 56, height: 56 }}>
                        {pendingRequests[0].user?.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {pendingRequests[0].user?.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {pendingRequests[0].user?.unit?.name || 'No Unit'} • Check-in Request
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatTime(pendingRequests[0].created_at)} • {getTimeAgo(pendingRequests[0].created_at)}
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                          Location: {pendingRequests[0].location_name}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        color="success"
                        fullWidth
                        onClick={() => approveMutation.mutate(pendingRequests[0].id)}
                        disabled={approveMutation.isPending}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        fullWidth
                        onClick={() => rejectMutation.mutate(pendingRequests[0].id)}
                        disabled={rejectMutation.isPending}
                      >
                        Reject
                      </Button>
                    </Box>
                  </Box>
                )}

                {/* Show other pending requests count */}
                {pendingRequests.length > 1 && (
                  <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                      Other Pending Requests
                    </Typography>
                    <Typography variant="body2">
                      {pendingRequests.length - 1} more check-in request{pendingRequests.length > 2 ? 's' : ''}
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </MainCard>
        )}

        {/* Attendance For Today */}
        <MainCard border={false} shadow={theme.customShadows.z1} sx={{ flex: 2, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Attendance For Today
          </Typography>

          {attendanceLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Name</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Unit</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Check-in</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Check-out</th>
                    <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendances.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: 16, textAlign: 'center' }}>
                        No attendance records for today
                      </td>
                    </tr>
                  ) : (
                    attendances.map((row: AttendanceWithUser) => (
                      <tr key={row.id}>
                        <td style={{ padding: 8 }}>{row.user?.name || 'N/A'}</td>
                        <td style={{ padding: 8 }}>{row.user?.unit?.name || 'N/A'}</td>
                        <td style={{ padding: 8 }}>{row.check_in_time || '-'}</td>
                        <td style={{ padding: 8 }}>{row.check_out_time || '-'}</td>
                        <td style={{ padding: 8 }}>
                          <Chip
                            label={row.status}
                            color={row.status === 'present' ? 'success' : row.status === 'late' ? 'warning' : 'error'}
                            size="small"
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Box>
          )}
        </MainCard>
      </Box>
    </>
  );
};

export default DashboardView;