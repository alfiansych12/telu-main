'use client';

import React from 'react';
import { Box } from '@mui/material';
import { Line } from 'react-chartjs-2';
import MainCard from 'components/MainCard';

import { FormattedMessage } from 'react-intl';

interface WeeklyTrendChartProps {
    lineData: any;
}

const WeeklyTrendChart = ({ lineData }: WeeklyTrendChartProps) => {
    return (
        <MainCard title={<FormattedMessage id="monitoring.weekly_trends" />}>
            <Box sx={{ height: 250 }}>
                <Line
                    data={lineData}
                    options={{
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }}
                />
            </Box>
        </MainCard>
    );
};

export default WeeklyTrendChart;
