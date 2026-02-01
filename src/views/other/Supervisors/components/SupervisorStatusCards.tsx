'use client';

import React from 'react';
import {
    Grid,
    Typography,
    Box,
    Stack,
    Paper
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { People, Chart as ChartIcon, Timer1 } from 'iconsax-react';

import { FormattedMessage } from 'react-intl';

interface SupervisorStatusCardsProps {
    totalInterns: number;
    presentCount: number;
    attendanceRate: number;
    pendingRequestsCount: number;
}

const SupervisorStatusCards = ({
    totalInterns,
    presentCount,
    attendanceRate,
    pendingRequestsCount
}: SupervisorStatusCardsProps) => {
    const theme = useTheme();

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{
                    p: 3,
                    borderRadius: 3,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    color: '#fff',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '100%',
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 4px 16px -2px rgba(0,0,0,0.12), 0 8px 32px -4px rgba(0,0,0,0.1), 0 16px 48px -8px rgba(0,0,0,0.08), 0 0 0 1px ${theme.palette.primary.main}20`,
                        borderColor: alpha(theme.palette.primary.main, 0.4)
                    }
                }}>
                    <Stack spacing={1}>
                        <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500 }}>
                            <FormattedMessage id="monitoring.total_team_members" />
                        </Typography>
                        <Typography variant="h2" sx={{ fontWeight: 800 }}>{totalInterns}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.15)', fontSize: '0.75rem', fontWeight: 600 }}>
                                <FormattedMessage id="monitoring.active_now" values={{ count: presentCount }} />
                            </Box>
                        </Stack>
                    </Stack>
                    <People size={90} variant="Bulk" style={{ position: 'absolute', right: -15, bottom: -15, opacity: 0.2 }} />
                </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{
                    p: 3,
                    borderRadius: 3,
                    background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                    color: '#fff',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '100%',
                    boxShadow: `0 8px 24px ${alpha(theme.palette.success.main, 0.25)}`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 4px 16px -2px rgba(0,0,0,0.12), 0 8px 32px -4px rgba(0,0,0,0.1), 0 16px 48px -8px rgba(0,0,0,0.08), 0 0 0 1px ${theme.palette.success.main}20`,
                        borderColor: alpha(theme.palette.success.main, 0.4)
                    }
                }}>
                    <Stack spacing={1}>
                        <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500 }}>
                            <FormattedMessage id="Attendance Rate" />
                        </Typography>
                        <Typography variant="h2" sx={{ fontWeight: 800 }}>{attendanceRate}%</Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.15)', fontSize: '0.75rem', fontWeight: 600 }}>
                                <FormattedMessage id="monitoring.vs_last_week" values={{ value: '+2%' }} />
                            </Box>
                        </Stack>
                    </Stack>
                    <ChartIcon size={90} variant="Bulk" style={{ position: 'absolute', right: -15, bottom: -15, opacity: 0.2 }} />
                </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{
                    p: 3,
                    borderRadius: 3,
                    background: `linear-gradient(45deg, ${theme.palette.warning.main}, #e67e22)`,
                    color: '#fff',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '100%',
                    boxShadow: `0 8px 24px ${alpha(theme.palette.warning.main, 0.25)}`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 4px 16px -2px rgba(0,0,0,0.12), 0 8px 32px -4px rgba(0,0,0,0.1), 0 16px 48px -8px rgba(0,0,0,0.08), 0 0 0 1px ${theme.palette.warning.main}20`,
                        borderColor: alpha(theme.palette.warning.main, 0.4)
                    }
                }}>
                    <Stack spacing={1}>
                        <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500 }}>
                            <FormattedMessage id="monitoring.pending_actions" />
                        </Typography>
                        <Typography variant="h2" sx={{ fontWeight: 800 }}>{pendingRequestsCount}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.15)', fontSize: '0.75rem', fontWeight: 600 }}>
                                <FormattedMessage id="monitoring.awaiting_approval" />
                            </Box>
                        </Stack>
                    </Stack>
                    <Timer1 size={90} variant="Bulk" style={{ position: 'absolute', right: -15, bottom: -15, opacity: 0.2 }} />
                </Paper>
            </Grid>
        </Grid>
    );
};

export default SupervisorStatusCards;
