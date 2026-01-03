

import React, { useState } from 'react';
import { Box, Grid, TextField, Chip, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import MainCard from 'components/MainCard';
import { useTheme } from '@mui/material/styles';
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
				<MainCard title={`Attendance for ${new Date(date).toLocaleDateString()}`}>
					{isLoading ? (
						<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
							<CircularProgress />
						</Box>
					) : (
						<Box sx={{ width: '100%', overflowX: 'auto' }}>
							<table style={{ width: '100%', borderCollapse: 'collapse' }}>
								<thead>
									<tr style={{ background: theme.palette.primary.lighter }}>
										<th style={{ padding: 8, textAlign: 'left' }}>Name</th>
										<th style={{ padding: 8, textAlign: 'left' }}>Email</th>
										<th style={{ padding: 8, textAlign: 'left' }}>Check-in</th>
										<th style={{ padding: 8, textAlign: 'left' }}>Check-out</th>
										<th style={{ padding: 8, textAlign: 'left' }}>Activity</th>
										<th style={{ padding: 8, textAlign: 'left' }}>Status</th>
									</tr>
								</thead>
								<tbody>
									{attendances.length === 0 ? (
										<tr>
											<td colSpan={6} style={{ padding: 16, textAlign: 'center' }}>
												No attendance records found for this date
											</td>
										</tr>
									) : (
										attendances.map((row: AttendanceWithUser) => (
											<tr key={row.id}>
												<td style={{ padding: 8 }}>{row.user?.name || 'N/A'}</td>
												<td style={{ padding: 8 }}>{row.user?.email || 'N/A'}</td>
												<td style={{ padding: 8 }}>{row.check_in_time || '-'}</td>
												<td style={{ padding: 8 }}>{row.check_out_time || '-'}</td>
												<td style={{ padding: 8 }}>{row.activity_description || '-'}</td>
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

export default Monitoring;
