'use client';

import React from 'react';
import {
    Grid,
    Typography,
    Stack,
    Paper
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Personalcard, Buildings, Activity } from 'iconsax-react';

import { FormattedMessage, useIntl } from 'react-intl';

interface ParticipantStatusCardsProps {
    userProfile: any;
    attendanceRate: number;
}

const ParticipantStatusCards = ({
    userProfile,
    attendanceRate
}: ParticipantStatusCardsProps) => {
    const theme = useTheme();
    const intl = useIntl();

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Card 1: My Supervisor */}
            <Grid item xs={12} sm={6} md={4}>
                <Paper elevation={0} sx={{
                    p: 2.5,
                    borderRadius: 4,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    color: '#fff',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '100%',
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 12px 28px -8px ${alpha(theme.palette.primary.main, 0.45)}, 0 4px 15px -5px rgba(0,0,0,0.2)`
                    }
                }}>
                    <Stack spacing={1}>
                        <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500 }}>
                            <FormattedMessage id="My Supervisor" />
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 800 }}>
                            {userProfile?.supervisor?.name || intl.formatMessage({ id: 'Not Assigned' })}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 600 }}>
                            <FormattedMessage id="Report directly to this person" />
                        </Typography>
                    </Stack>
                    <Personalcard size={70} variant="Bulk" style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.2 }} />
                </Paper>
            </Grid>

            {/* Card 2: Unit & Department */}
            <Grid item xs={12} sm={6} md={4}>
                <Paper elevation={0} sx={{
                    p: 2.5,
                    borderRadius: 4,
                    background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                    color: '#fff',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '100%',
                    boxShadow: `0 8px 24px ${alpha(theme.palette.success.main, 0.25)}`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 12px 28px -8px ${alpha(theme.palette.success.main, 0.45)}, 0 4px 15px -5px rgba(0,0,0,0.2)`
                    }
                }}>
                    <Stack spacing={1}>
                        <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500 }}>
                            <FormattedMessage id="Unit / Department" />
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 800 }}>
                            {userProfile?.unit?.name || intl.formatMessage({ id: 'General' })}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 600 }}>
                            {userProfile?.unit?.department || intl.formatMessage({ id: 'Department' })}
                        </Typography>
                    </Stack>
                    <Buildings size={70} variant="Bulk" style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.2 }} />
                </Paper>
            </Grid>

            {/* Card 3: Performance Info */}
            <Grid item xs={12} sm={6} md={4}>
                <Paper elevation={0} sx={{
                    p: 2.5,
                    borderRadius: 4,
                    background: `linear-gradient(45deg, ${theme.palette.warning.main}, #e67e22)`,
                    color: '#fff',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '100%',
                    boxShadow: `0 8px 24px ${alpha(theme.palette.warning.main, 0.25)}`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 12px 28px -8px ${alpha(theme.palette.warning.main, 0.45)}, 0 4px 15px -5px rgba(0,0,0,0.2)`
                    }
                }}>
                    <Stack spacing={1}>
                        <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500 }}>
                            <FormattedMessage id="Attendance Rate" />
                        </Typography>
                        <Typography variant="h2" sx={{ fontWeight: 800 }}>{attendanceRate}%</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 600 }}>
                            <FormattedMessage id="Based on last 30 recorded days" />
                        </Typography>
                    </Stack>
                    <Activity size={70} variant="Bulk" style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.2 }} />
                </Paper>
            </Grid>
        </Grid>
    );
};

export default ParticipantStatusCards;
