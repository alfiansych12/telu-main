'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// MATERIAL - UI
import Typography from '@mui/material/Typography';
import {
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
  Divider,
  InputAdornment
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parseISO } from 'date-fns';

// PROJECT IMPORTS
import MainCard from 'components/MainCard';
import { useTheme, alpha } from '@mui/material/styles';
import { getAttendances } from 'utils/api/attendances';
import { getUnits } from 'utils/api/units';
import { formatDate, formatTime } from 'utils/format';
import { AttendanceWithRelations } from 'types/api';

// ICONS
import {
  InfoCircle,
  Eye,
  CalendarSearch,
  Filter
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

  // Use stats from backend (which covers all pages, not just the current 50 records)
  const stats = (attendancesData as any)?.stats || null;

  return (
    <>
      <Box>
        <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Reports Monitoring</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date Filter"
                value={dateFilter ? parseISO(dateFilter) : null}
                onChange={(newValue) => {
                  if (newValue) {
                    setDateFilter(format(newValue, 'yyyy-MM-dd'));
                  } else {
                    setDateFilter('');
                  }
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    InputProps: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarSearch size={18} color={theme.palette.primary.main} />
                        </InputAdornment>
                      ),
                    },
                    sx: {
                      minWidth: { sm: 200 },
                      bgcolor: 'white',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        boxShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.1)}`,
                        bgcolor: alpha(theme.palette.primary.lighter, 0.1),
                        '& fieldset': { borderColor: alpha(theme.palette.primary.main, 0.4) },
                        '&:hover fieldset': { borderColor: alpha(theme.palette.primary.main, 0.6) },
                        '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: 1 }
                      },
                      '& .MuiInputLabel-root': { color: theme.palette.primary.main, fontWeight: 500 },
                      '& .MuiOutlinedInput-input': { color: theme.palette.primary.main, fontWeight: 600 }
                    }
                  },
                  popper: {
                    sx: {
                      '& .MuiPaper-root': {
                        borderRadius: 3,
                        boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.15)}`,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        mt: 1
                      },
                      '& .MuiPickersDay-root.Mui-selected': {
                        bgcolor: theme.palette.primary.main,
                        boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
                        '&:hover': { bgcolor: theme.palette.primary.dark }
                      },
                      '& .MuiPickersDay-today': {
                        borderColor: theme.palette.primary.main,
                        borderWidth: 1
                      }
                    }
                  }
                }}
              />
            </LocalizationProvider>
            <FormControl size="small" sx={{ minWidth: { sm: 160 }, bgcolor: 'white' }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilter}
                label="Role"
                onChange={(e) => setRoleFilter(e.target.value)}
                startAdornment={
                  <InputAdornment position="start" sx={{ mr: 1 }}>
                    <Filter size={18} color={theme.palette.primary.main} />
                  </InputAdornment>
                }
                sx={{
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.lighter, 0.2),
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="participant">Participants</MenuItem>
                <MenuItem value="supervisor">Supervisors</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: { sm: 200 }, bgcolor: 'white' }}>
              <InputLabel>Unit / Department</InputLabel>
              <Select
                value={unitFilter}
                label="Unit / Department"
                onChange={(e) => setUnitFilter(e.target.value)}
                startAdornment={
                  <InputAdornment position="start" sx={{ mr: 1 }}>
                    <Filter size={18} color={theme.palette.primary.main} />
                  </InputAdornment>
                }
                sx={{
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.lighter, 0.2),
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <MenuItem value="all">All Units</MenuItem>
                {unitsData?.data?.map((unit: any) => (
                  <MenuItem key={unit.id} value={unit.id}>{unit.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Box>

        {/* Stats Cards */}
        {/* Stats Cards */}
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={0} sx={{
              p: 3,
              borderRadius: 3,
              background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
              height: '100%',
              boxShadow: `0 12px 28px -8px ${alpha(theme.palette.success.main, 0.45)}, 0 4px 15px -5px rgba(0,0,0,0.2)`
            }}>
              <Stack spacing={1}>
                <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500 }}>Total Present</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800 }}>{isLoading ? '...' : stats?.present || 0}</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.15)', fontSize: '0.75rem', fontWeight: 600 }}>
                    On Time Attendance
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

          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={0} sx={{
              p: 3,
              borderRadius: 3,
              background: `linear-gradient(45deg, ${theme.palette.warning.main}, #e67e22)`,
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
              height: '100%',
              boxShadow: `0 12px 28px -8px ${alpha(theme.palette.warning.main, 0.45)}, 0 4px 15px -5px rgba(0,0,0,0.2)`
            }}>
              <Stack spacing={1}>
                <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500 }}>Total Late</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800 }}>{isLoading ? '...' : stats?.late || 0}</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.15)', fontSize: '0.75rem', fontWeight: 600 }}>
                    Needs Improvement
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

          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={0} sx={{
              p: 3,
              borderRadius: 3,
              background: `linear-gradient(45deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
              height: '100%',
              boxShadow: `0 12px 28px -8px ${alpha(theme.palette.info.main, 0.45)}, 0 4px 15px -5px rgba(0,0,0,0.2)`
            }}>
              <Stack spacing={1}>
                <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500 }}>Total Excused</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800 }}>{isLoading ? '...' : stats?.excused || 0}</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.15)', fontSize: '0.75rem', fontWeight: 600 }}>
                    Permit / Sick
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

          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={0} sx={{
              p: 3,
              borderRadius: 3,
              background: `linear-gradient(45deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
              height: '100%',
              boxShadow: `0 12px 28px -8px ${alpha(theme.palette.error.main, 0.45)}, 0 4px 15px -5px rgba(0,0,0,0.2)`
            }}>
              <Stack spacing={1}>
                <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500 }}>Total Absent</Typography>
                <Typography variant="h2" sx={{ fontWeight: 800 }}>{isLoading ? '...' : stats?.absent || 0}</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.15)', fontSize: '0.75rem', fontWeight: 600 }}>
                    Check-in Missing
                  </Box>
                </Stack>
              </Stack>
              <span
                className="material-symbols-outlined"
                style={{ position: 'absolute', right: -15, bottom: -15, fontSize: 100, opacity: 0.2, color: '#fff' }}
              >
                block
              </span>
            </Paper>
          </Grid>
        </Grid>

        {/* Attendance Table */}
        {/* Attendance Table */}
        <MainCard border={false} shadow={theme.customShadows.z1} sx={{ mb: 3 }}>

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
                  {attendancesData?.data && attendancesData.data.length > 0 ? (
                    attendancesData.data.map((attendance: AttendanceWithRelations) => (
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
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{formatDate(attendance.date)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{formatTime(attendance.check_in_time)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2">{formatTime(attendance.check_out_time)}</Typography>
                            {(() => {
                              try {
                                const activity = JSON.parse(attendance.activity_description || '{}');
                                return activity.photo ? (
                                  <Tooltip title="Has Evidence Photo">
                                    <Box sx={{ color: theme.palette.primary.main, display: 'flex' }}>
                                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>photo_camera</span>
                                    </Box>
                                  </Tooltip>
                                ) : null;
                              } catch (e) { return null; }
                            })()}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={attendance.status}
                            size="small"
                            color={
                              attendance.status === 'present' ? 'success' :
                                attendance.status === 'late' ? 'warning' :
                                  (attendance.status === 'permit' || attendance.status === 'sick') ? 'info' : 'error'
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
                    {formatDate(selectedAttendance?.date)}
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
                    {formatTime(selectedAttendance?.check_in_time)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="textSecondary">Check Out Time</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {formatTime(selectedAttendance?.check_out_time)}
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
                            (selectedAttendance?.status === 'permit' || selectedAttendance?.status === 'sick') ? 'info' : 'error'
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

                      {activityData.photo ? (
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>image</span>
                            Evidence Photo
                          </Typography>
                          <Box sx={{
                            borderRadius: 3,
                            overflow: 'hidden',
                            border: `2px solid ${theme.palette.divider}`,
                            bgcolor: '#000',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            maxHeight: 500,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}>
                            <img
                              src={activityData.photo}
                              alt="Activity evidence"
                              style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
                              onError={(e) => {
                                (e.target as any).src = 'https://placehold.co/600x400?text=Image+Load+Error';
                              }}
                            />
                          </Box>
                          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                            * This image was uploaded as proof of activity during check-out.
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ p: 2, bgcolor: alpha(theme.palette.grey[500], 0.05), borderRadius: 2, textAlign: 'center' }}>
                          <Typography variant="body2" color="textSecondary">No evidence photo was uploaded for this record.</Typography>
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
      </Box>
    </>
  );
};

export default ReportMonitoringView;
