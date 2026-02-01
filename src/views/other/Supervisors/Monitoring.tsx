'use client';

import React, { useState } from 'react';
import {
	Box,
	Chip,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	CircularProgress,
	Alert,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Stack,
	Avatar,
	InputAdornment,
	IconButton,
	Tooltip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Divider,
	Grid
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parseISO } from 'date-fns';
import { useTheme, alpha } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import MainCard from 'components/MainCard';
import { getAttendances } from 'utils/api/attendances';
import { AttendanceWithRelations } from 'types/api';
import LeaveRequestList from 'components/LeaveRequestList';
import { CalendarSearch, Filter, Eye, DocumentDownload } from 'iconsax-react';
import ReportGenerationDialog from 'components/ReportGenerationDialog';
import { formatTime, formatDate } from 'utils/format';
import { useSession } from 'next-auth/react';

const statusOptions = ['All', 'present', 'absent', 'late', 'permit'];

const Monitoring = () => {
	const [date, setDate] = useState(() => {
		const today = new Date();
		return today.toISOString().split('T')[0];
	});
	const [status, setStatus] = useState<string>('All');
	const [selectedAttendance, setSelectedAttendance] = useState<AttendanceWithRelations | null>(null);
	const [detailDialogOpen, setDetailDialogOpen] = useState(false);
	const [reportDialogOpen, setReportDialogOpen] = useState(false);
	const theme = useTheme();
	const { data: session } = useSession();
	const supervisorId = (session?.user as any)?.id;

	// Fetch attendances from database
	const { data, isLoading, error } = useQuery({
		queryKey: ['attendances', date, status, supervisorId],
		queryFn: () => getAttendances({
			dateFrom: date,
			dateTo: date,
			status: status === 'All' ? undefined : status as any,
			supervisorId,
			pageSize: 100
		}),
		enabled: !!supervisorId
	});

	const attendances = Array.isArray(data) ? data : (data?.data || []);

	return (
		<Box sx={{ px: 1 }}>
			<Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
				<Typography variant="h4" sx={{ fontWeight: 700 }}>Monitoring Attendance</Typography>
				<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
					<LocalizationProvider dateAdapter={AdapterDateFns}>
						<DatePicker
							label="Select Date"
							value={date ? parseISO(date) : null}
							onChange={(newValue) => {
								if (newValue) {
									setDate(format(newValue, 'yyyy-MM-dd'));
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
										minWidth: { sm: 180 },
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
										}
									}
								}
							}}
						/>
					</LocalizationProvider>
					<FormControl size="small" sx={{ minWidth: { sm: 160 }, bgcolor: 'white' }}>
						<InputLabel id="status-label">Status</InputLabel>
						<Select
							labelId="status-label"
							value={status}
							label="Status"
							onChange={(e) => setStatus(e.target.value)}
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
							{statusOptions.map((option) => (
								<MenuItem key={option} value={option}>
									{option.charAt(0).toUpperCase() + option.slice(1)}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<Button
						variant="contained"
						startIcon={<DocumentDownload />}
						onClick={() => setReportDialogOpen(true)}
						sx={{
							borderRadius: 2,
							whiteSpace: 'nowrap',
							px: 3
						}}
					>
						Export Report
					</Button>
				</Stack>
			</Box>

			{/* Error Alert */}
			{error && (
				<Alert severity="error" sx={{ mb: 3 }}>
					Error loading attendances: {(error as Error).message}
				</Alert>
			)}

			{/* Attendance Table */}
			<MainCard border={false} shadow={theme.customShadows.z1}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
					<span className="material-symbols-outlined" style={{ fontSize: 28, color: theme.palette.primary.main }}>event_note</span>
					<Typography variant="h5">
						Attendance for {new Date(date).toLocaleDateString('en-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
					</Typography>
				</Box>

				<TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
					{isLoading ? (
						<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
							<CircularProgress size={30} />
						</Box>
					) : (
						<Table sx={{ minWidth: 700 }}>
							<TableHead sx={{ bgcolor: theme.palette.grey[50] }}>
								<TableRow>
									<TableCell sx={{ fontWeight: 600 }}>User Profile</TableCell>
									<TableCell sx={{ fontWeight: 600 }}>Username / Email</TableCell>
									<TableCell sx={{ fontWeight: 600 }}>Check-in</TableCell>
									<TableCell sx={{ fontWeight: 600 }}>Check-out</TableCell>
									<TableCell sx={{ fontWeight: 600 }}>Activity Plan</TableCell>
									<TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
									<TableCell align="center" sx={{ fontWeight: 600 }}>Action</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{attendances.length === 0 ? (
									<TableRow>
										<TableCell colSpan={7} align="center" sx={{ py: 8 }}>
											<Typography variant="body2" color="textSecondary">
												No attendance records found for this date
											</Typography>
										</TableCell>
									</TableRow>
								) : (
									attendances.map((row: AttendanceWithRelations) => {
										// Parse activity meta to check for photo
										let hasPhoto = false;
										try {
											const meta = JSON.parse(row.activity_description || '{}');
											hasPhoto = !!meta.photo;
										} catch (e) { }

										return (
											<TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
												<TableCell>
													<Stack direction="row" spacing={1.5} alignItems="center">
														<Avatar sx={{
															width: 36,
															height: 36,
															fontSize: '0.85rem',
															fontWeight: 600,
															bgcolor: alpha(theme.palette.primary.main, 0.1),
															color: theme.palette.primary.main,
															border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
														}}>
															{row.user?.name?.charAt(0).toUpperCase() || 'U'}
														</Avatar>
														<Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{row.user?.name || 'N/A'}</Typography>
													</Stack>
												</TableCell>
												<TableCell>
													<Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>{row.user?.email || 'N/A'}</Typography>
												</TableCell>
												<TableCell>
													<Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
														{formatTime(row.check_in_time)}
													</Typography>
												</TableCell>
												<TableCell>
													<Stack direction="row" spacing={1} alignItems="center">
														<Typography variant="body2" sx={{ fontWeight: 600, color: row.check_out_time ? theme.palette.error.main : 'text.secondary' }}>
															{formatTime(row.check_out_time)}
														</Typography>
														{hasPhoto && (
															<Box sx={{ color: theme.palette.primary.main, display: 'flex' }}>
																<span className="material-symbols-outlined" style={{ fontSize: 18 }}>photo_camera</span>
															</Box>
														)}
													</Stack>
												</TableCell>
												<TableCell>
													<Typography variant="body2" sx={{ maxWidth: 200, whiteSpace: 'normal', lineClamp: 1, display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical' }}>
														{(() => {
															try {
																const activity = JSON.parse(row.activity_description || '{}');
																return activity.plan || (row.activity_description && !row.activity_description.startsWith('{') ? row.activity_description : '-');
															} catch (e) {
																return row.activity_description || '-';
															}
														})()}
													</Typography>
												</TableCell>
												<TableCell>
													<Chip
														label={row.status}
														color={row.status === 'present' ? 'success' : row.status === 'late' ? 'warning' : 'error'}
														variant="filled"
														size="small"
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
													<Tooltip title="View Detailed Record">
														<IconButton
															size="small"
															sx={{ color: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.05) }}
															onClick={() => {
																setSelectedAttendance(row);
																setDetailDialogOpen(true);
															}}
														>
															<Eye size={18} />
														</IconButton>
													</Tooltip>
												</TableCell>
											</TableRow>
										);
									})
								)}
							</TableBody>
						</Table>
					)}
				</TableContainer>
			</MainCard>

			<Grid container spacing={3} sx={{ mt: 3 }}>
				<Grid item xs={12} lg={5}>
					<MainCard title="Pending Leave Requests">
						<React.Suspense fallback={<CircularProgress size={20} />}>
							<LeaveRequestList supervisorId={supervisorId} />
						</React.Suspense>
					</MainCard>
				</Grid>
				<Grid item xs={12} lg={7}>
					<Alert severity="info" sx={{ borderRadius: 3, height: '100%', display: 'flex', alignItems: 'center' }}>
						<Box>
							<Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Supervisor Tip:</Typography>
							<Typography variant="body2">
								Approving a leave request will automatically mark the participant's attendance as
								<strong> "Sick"</strong> or <strong>"Permit"</strong> for the selected dates.
								This helps in maintaining accurate attendance reports without manual entry.
							</Typography>
						</Box>
					</Alert>
				</Grid>
			</Grid>

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
											</Box>
										) : (
											<Box sx={{ p: 2, bgcolor: alpha(theme.palette.grey[500], 0.05), borderRadius: 2, textAlign: 'center' }}>
												<Typography variant="body2" color="textSecondary">No evidence photo uploaded.</Typography>
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
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button onClick={() => setDetailDialogOpen(false)} variant="contained">
						Close
					</Button>
				</DialogActions>
			</Dialog>

			<ReportGenerationDialog
				open={reportDialogOpen}
				onClose={() => setReportDialogOpen(false)}
				supervisorId={supervisorId}
			/>
		</Box>
	);
};

export default Monitoring;
