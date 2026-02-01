'use client';

import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import MainCard from 'components/MainCard';

interface PresenceBreakdownProps {
    doughnutData: any;
    presentCount: number;
    absentCount: number;
}

import { FormattedMessage, useIntl } from 'react-intl';

const PresenceBreakdown = ({
    doughnutData,
    presentCount,
    absentCount
}: PresenceBreakdownProps) => {
    const intl = useIntl();

    return (
        <MainCard title={intl.formatMessage({ id: "monitoring.presence_breakdown" })}>
            <Box sx={{ height: 200, display: 'flex', justifyContent: 'center' }}>
                <Doughnut
                    data={doughnutData}
                    options={{
                        cutout: '70%',
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }}
                />
            </Box>
            <Stack spacing={1.5} sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">
                        <FormattedMessage id="monitoring.present_onsite" />
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{presentCount}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">
                        <FormattedMessage id="monitoring.absent_remote" />
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{absentCount}</Typography>
                </Box>
            </Stack>
        </MainCard>
    );
};

export default PresenceBreakdown;
