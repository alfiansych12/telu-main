'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import {
    Box,
    Typography,
    Grid,
    CircularProgress,
    Stack,
    Avatar,
    Chip,
    Paper
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import MainCard from 'components/MainCard';
import { formatTime } from 'utils/format';

// Dynamic Map Component
const MapComponent = dynamic(() => import('components/MapComponent'), {
    ssr: false,
    loading: () => (
        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <CircularProgress />
        </Box>
    )
});

interface TeamDistributionMapProps {
    adminPosition: [number, number];
    adminAddress: string;
    adminRadius: number;
    mapMarkers: any[];
    todayAttendances: any[];
}

const TeamDistributionMap = ({
    adminPosition,
    adminAddress,
    adminRadius,
    mapMarkers,
    todayAttendances
}: TeamDistributionMapProps) => {
    const theme = useTheme();

    return (
        <MainCard title="Team Distribution (Today)" secondary={<Chip size="small" label="Live Tracking" color="error" variant="outlined" />}>
            <Box sx={{ height: 450, borderRadius: 2, overflow: 'hidden' }}>
                <MapComponent
                    position={adminPosition}
                    address={adminAddress}
                    radius={adminRadius}
                    markers={mapMarkers}
                />
            </Box>

            {/* Active Participants Cards */}
            <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700, px: 1 }}>Active Participants Currently on Duty</Typography>
                <Grid container spacing={2}>
                    {todayAttendances && todayAttendances.length > 0 ? (
                        todayAttendances.map((attendance: any) => {
                            const meta = attendance.activity_description ? (function () {
                                try { return JSON.parse(attendance.activity_description); } catch (e) { return {}; }
                            })() : {};

                            return (
                                <Grid item xs={12} sm={6} key={attendance.id}>
                                    <Paper elevation={0} sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        border: `1px solid ${theme.palette.divider}`,
                                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                                        display: 'flex',
                                        alignItems: 'center',
                                        transition: 'transform 0.2s',
                                        '&:hover': { transform: 'translateY(-2px)', bgcolor: alpha(theme.palette.primary.main, 0.05) }
                                    }}>
                                        <Avatar sx={{
                                            width: 48,
                                            height: 48,
                                            bgcolor: theme.palette.primary.main,
                                            color: 'white',
                                            mr: 2,
                                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                                        }}>
                                            {attendance.user?.name.charAt(0)}
                                        </Avatar>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{attendance.user?.name}</Typography>
                                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>{attendance.user?.unit?.name || 'Unknown Unit'}</Typography>
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                                <Chip
                                                    size="small"
                                                    label={`In: ${formatTime(attendance.check_in_time)}`}
                                                    variant="filled"
                                                    color="success"
                                                    sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
                                                />
                                                {attendance.check_out_time && (
                                                    <Chip
                                                        size="small"
                                                        label={`Out: ${formatTime(attendance.check_out_time)}`}
                                                        variant="filled"
                                                        color="error"
                                                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
                                                    />
                                                )}
                                                {meta.check_in_location ? (
                                                    <Chip size="small" label="GPS Tracked" variant="outlined" color="primary" sx={{ height: 20, fontSize: '0.65rem' }} />
                                                ) : (
                                                    <Chip size="small" label="No GPS" variant="outlined" color="default" sx={{ height: 20, fontSize: '0.65rem' }} />
                                                )}
                                            </Stack>
                                        </Box>
                                    </Paper>
                                </Grid>
                            );
                        })
                    ) : (
                        <Grid item xs={12}>
                            <Box sx={{ py: 3, textAlign: 'center', bgcolor: alpha(theme.palette.grey[500], 0.05), borderRadius: 2 }}>
                                <Typography variant="body2" color="textSecondary">No active participants found for today.</Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </Box>
        </MainCard>
    );
};

export default TeamDistributionMap;
