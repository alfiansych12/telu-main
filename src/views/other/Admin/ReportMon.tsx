'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';

// MATERIAL - UI
import Typography from '@mui/material/Typography';
import {
  TextField,
  CircularProgress,
  Alert,
  Box,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider
} from '@mui/material';

// PROJECT IMPORTS
import MainCard from 'components/MainCard';
import { useTheme, alpha } from '@mui/material/styles';
const CustomBreadcrumbs = dynamic(() => import('components/@extended/CustomBreadcrumbs'), { ssr: false });
import { getAttendances } from 'utils/api/attendances';
import { getUnits } from 'utils/api/units';

// ICONS
import {
  TickCircle,
  Clock,
  InfoCircle,
  CloseCircle,
  Eye
} from 'iconsax-react';

// ==============================|| REPORT MONITORING PAGE ||============================== //

const ReportMonitoringView = () => {
  const theme = useTheme();
  const [dateFilter, setDateFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<any>(null);

  // Get date range for last 7 days
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const dateFrom = sevenDaysAgo.toISOString().split('T')[0];
  const dateTo = today.toISOString().split('T')[0];

  // Fetch units for dropdown
  const { data: unitsData } = useQuery({
    queryKey: ['units', 'all-for-selector'],
    queryFn: () => getUnits({ pageSize: 100 }),
  });

  // Fetch attendances
  const { data: attendancesData, isLoading, error } = useQuery({
    queryKey: ['attendances', dateFrom, dateTo, roleFilter, dateFilter, unitFilter],
    queryFn: () => getAttendances({
      dateFrom: dateFilter || dateFrom,
      dateTo: dateFilter || dateTo,
      unitId: unitFilter !== 'all' ? unitFilter : undefined,
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
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
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
              <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500 }}>Total Present</Typography>
              <Typography variant="h2" sx={{ fontWeight: 800 }}>{isLoading ? '...' : stats?.totalPresent || 0}</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.15)', fontSize: '0.75rem', fontWeight: 600 }}>
                  Today's Attendance
                </Box>
              </Stack>
            </Stack>
            <span
              className="material-symbols-outlined"
              style={{ position: 'absolute', right: -15, bottom: -15, fontSize: 100, opacity: 0.2, color: '#fff' }}
            >
              check_circle
            </span>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
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
              <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500 }}>Total Late</Typography>
              <Typography variant="h2" sx={{ fontWeight: 800 }}>{isLoading ? '...' : stats?.totalLate || 0}</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.15)', fontSize: '0.75rem', fontWeight: 600 }}>
                  Time Discipline
                </Box>
              </Stack>
            </Stack>
            <span
              className="material-symbols-outlined"
              style={{ position: 'absolute', right: -15, bottom: -15, fontSize: 100, opacity: 0.2, color: '#fff' }}
            >
              schedule
            </span>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper elevation={0} sx={{
            p: 3,
            borderRadius: 3,
            background: `linear-gradient(45deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            height: '100%',
            boxShadow: `0 8px 24px ${alpha(theme.palette.info.main, 0.25)}`
          }}>
            <Stack spacing={1}>
              <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500 }}>Total Excused</Typography>
              <Typography variant="h2" sx={{ fontWeight: 800 }}>{isLoading ? '...' : stats?.totalExcused || 0}</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.15)', fontSize: '0.75rem', fontWeight: 600 }}>
                  With Permission
                </Box>
              </Stack>
            </Stack>
            <InfoCircle
              variant="Bold"
              size={100}
              style={{ position: 'absolute', right: -15, bottom: -15, opacity: 0.2, color: '#fff' }}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Attendance Table */}
      {/* Attendance Table */}
      <MainCard border={false} shadow={theme.customShadows.z1} sx={{ mb: 3 }}>
        {/* Filter Bar */}
        <Grid container spacing={2} sx={{ mb: 3 }} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              label="Date Range"
              type="date"
              size="small"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilter}
                label="Role"
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="participant">Participants</MenuItem>
                <MenuItem value="supervisor">Supervisors</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Unit / Department</InputLabel>
              <Select
                value={unitFilter}
                label="Unit / Department"
                onChange={(e) => setUnitFilter(e.target.value)}
              >
                <MenuItem value="all">All Units</MenuItem>
                {unitsData?.units?.map((unit: any) => (
                  <MenuItem key={unit.id} value={unit.id}>{unit.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error loading attendances: {(error as Error).message}
          </Alert>
        )}

        <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
              <CircularProgress size={30} />
            </Box>
          ) : (
            <Table sx={{ minWidth: 700 }}>
              <TableHead sx={{ bgcolor: theme.palette.grey[50] }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Participant</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Unit</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Check In</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Check Out</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendancesData?.attendances && attendancesData.attendances.length > 0 ? (
                  attendancesData.attendances.map((attendance) => (
                    <TableRow key={attendance.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{
                            width: 36,
                            height: 36,
                            fontSize: '0.85rem',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            fontWeight: 600
                          }}>
                            {attendance.user?.name?.charAt(0) || 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{attendance.user?.name || '-'}</Typography>
                            <Typography variant="caption" color="textSecondary">{attendance.user?.email || '-'}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{attendance.user?.unit?.name || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{attendance.date}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{attendance.check_in_time || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{attendance.check_out_time || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={attendance.status}
                          size="small"
                          color={
                            attendance.status === 'present' ? 'success' :
                              attendance.status === 'late' ? 'warning' :
                                attendance.status === 'excused' ? 'info' : 'error'
                          }
                          variant="filled"
                          sx={{
                            px: 1,
                            height: 24,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            borderRadius: 1
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            sx={{ color: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.05) }}
                            onClick={() => {
                              setSelectedAttendance(attendance);
                              setDetailDialogOpen(true);
                            }}
                          >
                            <Eye size={18} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <Typography variant="body2" color="textSecondary">No attendance records found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </MainCard>

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{
              width: 48,
              height: 48,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontWeight: 600
            }}>
              {selectedAttendance?.user?.name?.charAt(0) || 'U'}
            </Avatar>
            <Box>
              <Typography variant="h6">{selectedAttendance?.user?.name || '-'}</Typography>
              <Typography variant="caption" color="textSecondary">
                {selectedAttendance?.user?.email || '-'}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Basic Info */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">Date</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedAttendance?.date || '-'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">Unit</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedAttendance?.user?.unit?.name || '-'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">Check In Time</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedAttendance?.check_in_time || '-'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="textSecondary">Check Out Time</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedAttendance?.check_out_time || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary">Status</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={selectedAttendance?.status}
                    size="small"
                    color={
                      selectedAttendance?.status === 'present' ? 'success' :
                        selectedAttendance?.status === 'late' ? 'warning' :
                          selectedAttendance?.status === 'excused' ? 'info' : 'error'
                    }
                    variant="filled"
                    sx={{ fontWeight: 700, textTransform: 'uppercase' }}
                  />
                </Box>
              </Grid>
            </Grid>

            <Divider />

            {/* Activity Description */}
            {selectedAttendance?.activity_description && (() => {
              try {
                const activityData = JSON.parse(selectedAttendance.activity_description);
                return (
                  <>
                    {activityData.plan && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                          Activity Plan / Summary
                        </Typography>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: theme.palette.grey[50], borderRadius: 2 }}>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {activityData.plan}
                          </Typography>
                        </Paper>
                      </Box>
                    )}

                    {activityData.photo && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                          Evidence Photo
                        </Typography>
                        <Box sx={{
                          borderRadius: 2,
                          overflow: 'hidden',
                          border: `1px solid ${theme.palette.divider}`,
                          maxHeight: 400
                        }}>
                          <img
                            src={activityData.photo}
                            alt="Activity evidence"
                            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                          />
                        </Box>
                      </Box>
                    )}

                    {activityData.check_in_location && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                          Check-in Location
                        </Typography>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: theme.palette.grey[50], borderRadius: 2 }}>
                          <Typography variant="body2">
                            Latitude: {activityData.check_in_location[0]?.toFixed(6) || '-'}
                          </Typography>
                          <Typography variant="body2">
                            Longitude: {activityData.check_in_location[1]?.toFixed(6) || '-'}
                          </Typography>
                        </Paper>
                      </Box>
                    )}
                  </>
                );
              } catch (e) {
                return (
                  <Alert severity="info">
                    No detailed activity information available
                  </Alert>
                );
              }
            })()}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDetailDialogOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ReportMonitoringView;
