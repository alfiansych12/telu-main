

import React, { useState } from 'react';
import { Box, Grid, TextField,Chip, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import MainCard from 'components/MainCard';
import { useTheme } from '@mui/material/styles';
import CustomBreadcrumbs from 'components/@extended/CustomBreadcrumbs';


// Dummy data for attendance
const attendanceData = [
	{ id: 1, name: 'John Doe', checkIn: '08:00', checkOut: '17:00', activity: 'Meeting', status: 'Present' },
	{ id: 2, name: 'Jane Smith', checkIn: '08:10', checkOut: '17:05', activity: 'Site Visit', status: 'Present' },
	{ id: 3, name: 'Bob Lee', checkIn: '-', checkOut: '-', activity: '-', status: 'Absent' },
];
const statusOptions = ['All', 'Present', 'Absent'];

const Monitoring = () => {
	const [date, setDate] = useState(() => {
		const today = new Date();
		return today.toISOString().split('T')[0];
	});
	const [status, setStatus] = useState('All');
	const theme = useTheme();

	// In real app, filter attendanceData by date and status here
	const filteredData = status === 'All' ? attendanceData : attendanceData.filter((row) => row.status === status);

	return (
		<>
      <MainCard border={false} shadow={theme.customShadows.z1} sx={{ mb: 3, p: 0 }}>
        <CustomBreadcrumbs
          items={['Dashboard', 'Report']}
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
									<MenuItem key={option} value={option}>{option}</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>
				</Grid>
			</MainCard>

			{/* Attendance Table */}
			<MainCard title="Attendance for Today">
				<Box sx={{ width: '100%', overflowX: 'auto' }}>
					<table style={{ width: '100%', borderCollapse: 'collapse' }}>
						<thead>
							<tr style={{ background: theme.palette.primary.lighter }}>
								<th style={{ padding: 8, textAlign: 'left' }}>Name</th>
								<th style={{ padding: 8, textAlign: 'left' }}>Check-in</th>
								<th style={{ padding: 8, textAlign: 'left' }}>Check-out</th>
								<th style={{ padding: 8, textAlign: 'left' }}>Activity</th>
								<th style={{ padding: 8, textAlign: 'left' }}>Status</th>
								<th style={{ padding: 8, textAlign: 'left' }}>Details</th>
							</tr>
						</thead>
						<tbody>
							{filteredData.map((row) => (
								<tr key={row.id}>
									<td style={{ padding: 8 }}>{row.name}</td>
									<td style={{ padding: 8 }}>{row.checkIn}</td>
									<td style={{ padding: 8 }}>{row.checkOut}</td>
									<td style={{ padding: 8 }}>{row.activity}</td>
									<td style={{ padding: 8 }}>
										<Chip label={row.status} color={row.status === 'Present' ? 'success' : 'error'} size="small" />
									</td>
									<td style={{ padding: 8 }}>
										<Button variant="outlined" size="small">Details</Button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</Box>
			</MainCard>
		</Box>
		</>
	);
};

export default Monitoring;
