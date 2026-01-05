

import React, { useState } from 'react';
import {
	Box,
	Grid,
	TextField,
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
	Avatar
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import MainCard from 'components/MainCard';
import CustomBreadcrumbs from 'components/@extended/CustomBreadcrumbs';
import { getAttendances, AttendanceWithUser } from 'utils/api/attendances';

const statusOptions = ['All', 'present', 'absent', 'late', 'excused'];

const Monitoring = () => {
	const [date, setDate] = useState(() => {
		const today = new Date();
		return today.toISOString().split('T')[0];
	});
	const [status, setStatus] = useState<string>('All');
	const theme = useTheme();

	// Fetch attendances from database
	const { data, isLoading, error } = useQuery({
		queryKey: ['attendances', date, status],
		queryFn: () => getAttendances({
			dateFrom: date,
			dateTo: date,
			status: status === 'All' ? undefined : status as any,
			pageSize: 100
		})
	});

	const attendances = data?.attendances || [];

	return (
		<>
			<MainCard border={false} shadow={theme.customShadows.z1} sx={{ mb: 3, p: 0 }}>
				<CustomBreadcrumbs
					items={['Dashboard', 'Monitoring']}
					showDate
					showExport
				/>
			</MainCard>
			<Box>
				{/* Card Filter Date & Status */}
				<MainCard sx={{ mb: 3 }} title="Filter">
					<Grid container spacing={2} alignItems="center">
						<Grid item xs={12} sm={6} md={4}>
							<TextField
								label="Date"
								type="date"
								value={date}
								onChange={(e) => setDate(e.target.value)}
								InputLabelProps={{ shrink: true }}
								fullWidth
								size="small"
							/>
						</Grid>
						<Grid item xs={12} sm={6} md={4}>
							<FormControl fullWidth size="small">
								<InputLabel id="status-label">Status</InputLabel>
								<Select
									labelId="status-label"
									value={status}
									label="Status"
									onChange={(e) => setStatus(e.target.value)}
								>
									{statusOptions.map((option) => (
										<MenuItem key={option} value={option}>
											{option.charAt(0).toUpperCase() + option.slice(1)}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>
					</Grid>
				</MainCard>

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
									</TableRow>
								</TableHead>
								<TableBody>
									{attendances.length === 0 ? (
										<TableRow>
											<TableCell colSpan={6} align="center" sx={{ py: 8 }}>
												<Typography variant="body2" color="textSecondary">
													No attendance records found for this date
												</Typography>
											</TableCell>
										</TableRow>
									) : (
										attendances.map((row: AttendanceWithUser) => (
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
														{row.check_in_time || '-'}
													</Typography>
												</TableCell>
												<TableCell>
													<Typography variant="body2" sx={{ fontWeight: 600, color: row.check_out_time ? theme.palette.error.main : 'text.secondary' }}>
														{row.check_out_time || '-'}
													</Typography>
												</TableCell>
												<TableCell>
													<Typography variant="body2" sx={{ maxWidth: 250, whiteSpace: 'normal', lineClamp: 2, display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical' }}>
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
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						)}
					</TableContainer>
				</MainCard>
			</Box>
		</>
	);
};

export default Monitoring;
