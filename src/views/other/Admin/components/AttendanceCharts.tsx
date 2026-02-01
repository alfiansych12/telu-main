'use client';

import React from 'react';
import {
    Box,
    Typography,
    Stack,
    FormControl,
    Select,
    MenuItem
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    PointElement,
    LineElement,
    Filler
} from 'chart.js';
import { Doughnut, Bar, Pie, Line } from 'react-chartjs-2';
import MainCard from 'components/MainCard';
import { FormattedMessage, useIntl } from 'react-intl';

// Register ChartJS
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    PointElement,
    LineElement,
    Filler
);

interface AttendanceChartsProps {
    chartType: 'doughnut' | 'pie' | 'bar' | 'line';
    setChartType: (type: 'doughnut' | 'pie' | 'bar' | 'line') => void;
    doughnutData: any;
    attendancePercentage: number;
    todayPresent: number;
    totalParticipants: number;
    placementData: any;
}

const AttendanceCharts = ({
    chartType,
    setChartType,
    doughnutData,
    attendancePercentage,
    todayPresent,
    totalParticipants,
    placementData
}: AttendanceChartsProps) => {
    const theme = useTheme();
    const intl = useIntl();

    return (
        <Stack spacing={3}>
            {/* Card 4: Attendance Percentage Today */}
            <MainCard
                title={<FormattedMessage id="admin.dashboard.attendance_percentage" />}
                secondary={
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                            value={chartType}
                            onChange={(e) => setChartType(e.target.value as any)}
                            sx={{ fontSize: '0.875rem' }}
                        >
                            <MenuItem value="doughnut"><FormattedMessage id="admin.dashboard.chart.doughnut" /></MenuItem>
                            <MenuItem value="pie"><FormattedMessage id="admin.dashboard.chart.pie" /></MenuItem>
                            <MenuItem value="bar"><FormattedMessage id="admin.dashboard.chart.bar" /></MenuItem>
                            <MenuItem value="line"><FormattedMessage id="admin.dashboard.chart.line" /></MenuItem>
                        </Select>
                    </FormControl>
                }
                sx={{
                    overflow: 'visible',
                    '& .MuiCardContent-root': {
                        p: 3
                    }
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
                    <Box sx={{ width: '100%', maxWidth: chartType === 'bar' || chartType === 'line' ? 400 : 300, position: 'relative' }}>
                        {chartType === 'doughnut' && (
                            <>
                                <Doughnut
                                    data={doughnutData}
                                    options={{
                                        cutout: '70%',
                                        plugins: {
                                            legend: {
                                                display: false
                                            },
                                            tooltip: {
                                                enabled: true
                                            }
                                        },
                                        maintainAspectRatio: true
                                    }}
                                />
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        textAlign: 'center'
                                    }}
                                >
                                    <Typography variant="h2" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                                        {attendancePercentage}%
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        <FormattedMessage id="admin.dashboard.present_today" />
                                    </Typography>
                                </Box>
                            </>
                        )}

                        {chartType === 'pie' && (
                            <Pie
                                data={doughnutData}
                                options={{
                                    plugins: {
                                        legend: {
                                            display: true,
                                            position: 'bottom'
                                        },
                                        tooltip: {
                                            enabled: true
                                        }
                                    },
                                    maintainAspectRatio: true
                                }}
                            />
                        )}

                        {chartType === 'bar' && (
                            <Bar
                                data={{
                                    labels: [intl.formatMessage({ id: 'Present' }), intl.formatMessage({ id: 'Absent' })],
                                    datasets: [{
                                        label: intl.formatMessage({ id: 'Count' }),
                                        data: [todayPresent, totalParticipants - todayPresent],
                                        backgroundColor: ['#2ecc71', '#e74c3c'],
                                        borderRadius: 8,
                                    }]
                                }}
                                options={{
                                    plugins: {
                                        legend: {
                                            display: false
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true
                                        }
                                    },
                                    maintainAspectRatio: true
                                }}
                            />
                        )}

                        {chartType === 'line' && (
                            <Line
                                data={{
                                    labels: [intl.formatMessage({ id: 'Present' }), intl.formatMessage({ id: 'Absent' })],
                                    datasets: [{
                                        label: intl.formatMessage({ id: 'Attendance' }),
                                        data: [todayPresent, totalParticipants - todayPresent],
                                        borderColor: theme.palette.primary.main,
                                        backgroundColor: theme.palette.primary.lighter,
                                        fill: true,
                                        tension: 0.4
                                    }]
                                }}
                                options={{
                                    plugins: {
                                        legend: {
                                            display: false
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true
                                        }
                                    },
                                    maintainAspectRatio: true
                                }}
                            />
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontWeight: 600, color: '#2ecc71' }}>
                                {todayPresent}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                <FormattedMessage id="Present" />
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontWeight: 600, color: '#e74c3c' }}>
                                {totalParticipants - todayPresent}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                <FormattedMessage id="Absent" />
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontWeight: 600 }}>
                                {totalParticipants}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                <FormattedMessage id="Total" />
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </MainCard>

            {/* Card 5: Activity Placement */}
            <MainCard
                title={<FormattedMessage id="admin.dashboard.activity_placement" />}
                sx={{
                    overflow: 'visible',
                    '& .MuiCardContent-root': {
                        p: 3
                    }
                }}
            >
                <Box sx={{ py: 2 }}>
                    <Bar
                        data={placementData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: true,
                            plugins: {
                                legend: {
                                    display: false
                                },
                                title: {
                                    display: false
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        stepSize: 2
                                    }
                                }
                            }
                        }}
                    />
                </Box>
            </MainCard>
        </Stack>
    );
};

export default AttendanceCharts;
