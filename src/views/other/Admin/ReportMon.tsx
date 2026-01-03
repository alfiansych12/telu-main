'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// MATERIAL - UI
import Typography from '@mui/material/Typography';
import { TextField, CircularProgress, Alert, Box, Grid } from '@mui/material';

// PROJECT IMPORTS
import MainCard from 'components/MainCard';
import { useTheme } from '@mui/material/styles';
import CustomBreadcrumbs from 'components/@extended/CustomBreadcrumbs';
import { getAttendances } from 'utils/api/attendances';

// ==============================|| REPORT MONITORING PAGE ||============================== //

const ReportMonitoringView = () => {
  const theme = useTheme();
  const [dateFilter, setDateFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Get date range for last 7 days
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const dateFrom = sevenDaysAgo.toISOString().split('T')[0];
  const dateTo = today.toISOString().split('T')[0];

  // Fetch attendances
  const { data: attendancesData, isLoading, error } = useQuery({
    queryKey: ['attendances', dateFrom, dateTo, roleFilter],
    queryFn: () => getAttendances({
      dateFrom: dateFilter || dateFrom,
      dateTo: dateFilter || dateTo,
      pageSize: 50,
    }),
  });

  // Calculate stats
  const stats = attendancesData?.attendances ? {
    totalPresent: attendancesData.attendances.filter(a => a.status === 'present').length,
    totalLate: attendancesData.attendances.filter(a => a.status === 'late').length,
    totalAbsent: attendancesData.attendances.filter(a => a.status === 'absent').length,
    totalExcused: attendancesData.attendances.filter(a => a.status === 'excused').length,
  } : null;

  return (
    <>
      <MainCard border={false} shadow={theme.customShadows.z1} sx={{ mb: 3, p: 0 }}>
        <CustomBreadcrumbs
          items={['Dashboard', 'Reports Monitoring']}
          showDate
          showExport
        />
      </MainCard>

      {/* Stats Cards */}
      {/* Stats Cards */}
      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={4} sm={4}>
          <MainCard border={false} shadow={theme.customShadows.z1} sx={{ height: '100%', p: { xs: 0.5, md: 2 } }}>
            <Typography variant='h6' sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '0.65rem', sm: '0.9rem', md: '1.25rem' } }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#4caf50' }}>check_circle</span>
              Present
            </Typography>
            {isLoading ? <CircularProgress size={16} sx={{ mt: 1 }} /> : (
              <Typography variant="h3" sx={{ mt: 0.5, fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2.5rem' }, fontWeight: 700 }}>{stats?.totalPresent || 0}</Typography>
            )}
          </MainCard>
        </Grid>
        <Grid item xs={4} sm={4}>
          <MainCard border={false} shadow={theme.customShadows.z1} sx={{ height: '100%', p: { xs: 0.5, md: 2 } }}>
            <Typography variant='h6' sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '0.65rem', sm: '0.9rem', md: '1.25rem' } }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#ff9800' }}>schedule</span>
              Late
            </Typography>
            {isLoading ? <CircularProgress size={16} sx={{ mt: 1 }} /> : (
              <Typography variant="h3" sx={{ mt: 0.5, fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2.5rem' }, fontWeight: 700 }}>{stats?.totalLate || 0}</Typography>
            )}
          </MainCard>
        </Grid>
        <Grid item xs={4} sm={4}>
          <MainCard border={false} shadow={theme.customShadows.z1} sx={{ height: '100%', p: { xs: 0.5, md: 2 } }}>
            <Typography variant='h6' sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '0.65rem', sm: '0.9rem', md: '1.25rem' } }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#2196f3' }}>info</span>
              Excused
            </Typography>
            {isLoading ? <CircularProgress size={16} sx={{ mt: 1 }} /> : (
              <Typography variant="h3" sx={{ mt: 0.5, fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2.5rem' }, fontWeight: 700 }}>{stats?.totalExcused || 0}</Typography>
            )}
          </MainCard>
        </Grid>
      </Grid>

      {/* Attendance Table */}
      {/* Attendance Table */}
      <MainCard border={false} shadow={theme.customShadows.z1} sx={{ mb: 3 }}>
        {/* Filter Bar */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 3 }}>
          <TextField
            label="Date"
            type="date"
            size="small"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={{ maxWidth: { xs: '100%', sm: 220 } }}
          />
          <TextField
            select
            label="Role"
            size="small"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            SelectProps={{ native: true }}
            fullWidth
            sx={{ maxWidth: { xs: '100%', sm: 200 } }}
          >
            <option value="all">All Roles</option>
            <option value="participant">Participants</option>
            <option value="supervisor">Supervisors</option>
          </TextField>

           <TextField
            select
            label="Unit"
            size="small"
             //value={unitFilter}
             //onChange={(e) => setUnitFilter(e.target.value)}
            // SelectProps={{ native: true }}
             fullWidth
             sx={{ maxWidth: { xs: '100%', sm: 200 } }}
          >
            <option value="all">All Unit</option>
            <option value="participant">Fakultas Teknik Informatika</option>
            <option value="supervisor">Fakultas Sistem Informasi</option>
          </TextField>

        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error loading attendances: {(error as Error).message}
          </Alert>
        )}

        {/* Data Table */}
        <Box sx={{ overflowX: 'auto', minHeight: 300 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
              <CircularProgress />
            </Box>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 650 }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: 16, textAlign: 'left' }}>Name</th>
                  <th style={{ padding: 16, textAlign: 'left' }}>Unit</th>
                  <th style={{ padding: 16, textAlign: 'left' }}>Date</th>
                  <th style={{ padding: 16, textAlign: 'left' }}>Check-in</th>
                  <th style={{ padding: 16, textAlign: 'left' }}>Activity</th>
                  <th style={{ padding: 16, textAlign: 'left' }}>Check-out</th>
                  <th style={{ padding: 16, textAlign: 'left' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendancesData?.attendances && attendancesData.attendances.length > 0 ? (
                  attendancesData.attendances.map((attendance) => (
                    <tr key={attendance.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: 16 }}>{attendance.user?.name || '-'}</td>
                      <td style={{ padding: 16 }}>{attendance.user?.unit?.name || '-'}</td>
                      <td style={{ padding: 16 }}>{attendance.date}</td>
                      <td style={{ padding: 16 }}>{attendance.check_in_time || '-'}</td>
                      <td style={{ padding: 16, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {attendance.activity_description || '-'}
                      </td>
                      <td style={{ padding: 16 }}>{attendance.check_out_time || '-'}</td>
                      <td style={{ padding: 16 }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: '0.75rem',
                          background:
                            attendance.status === 'present' ? '#4caf50' :
                              attendance.status === 'late' ? '#ff9800' :
                                attendance.status === 'excused' ? '#2196f3' : '#f44336',
                          color: 'white'
                        }}>
                          {attendance.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ padding: 24, textAlign: 'center' }}>
                      No attendance records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </Box>
      </MainCard>
    </>
  );
}

export default ReportMonitoringView;
