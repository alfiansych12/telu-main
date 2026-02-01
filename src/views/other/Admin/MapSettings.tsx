'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// MATERIAL - UI
import {
    Box,
    Button,
    Grid,
    Stack,
    TextField,
    Typography,
    CircularProgress,
    Alert,
    Slider,
    Chip,
    Switch
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { CalendarTick, TickCircle } from 'iconsax-react';

// PROJECT IMPORTS
import MainCard from 'components/MainCard';
import { getCheckInLocation, updateCheckInLocation, getLeaveSettings, updateLeaveSettings, CheckInLocation, LeaveSettings } from 'utils/api/settings';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { openAlert } from 'api/alert';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { format } from 'date-fns';

const MapPickerComponent = dynamic(() => import('components/MapPickerComponent'), {
    ssr: false,
    loading: () => (
        <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <CircularProgress />
        </Box>
    )
});

interface CombinedSettings extends CheckInLocation, LeaveSettings { }

const MapSettingsView = () => {
    const queryClient = useQueryClient();
    const theme = useTheme();
    const [localSettings, setLocalSettings] = useState<CombinedSettings | null>(null);

    const { data: remoteSettings, isLoading, error, refetch } = useQuery({
        queryKey: ['system-settings-combined'],
        queryFn: async () => {
            const [checkin, leave] = await Promise.all([
                getCheckInLocation(),
                getLeaveSettings()
            ]);
            return { ...checkin, ...leave };
        },
        retry: 1
    });

    // Initialize local state once data is fetched
    useEffect(() => {
        if (remoteSettings && !localSettings) {
            setLocalSettings(remoteSettings);
        }
    }, [remoteSettings, localSettings]);

    const mutation = useMutation({
        mutationFn: async (settings: CombinedSettings) => {
            // Split settings back to their respective APIs
            const checkinData: CheckInLocation = {
                latitude: settings.latitude,
                longitude: settings.longitude,
                address: settings.address,
                radius: settings.radius,
                late_threshold_time: settings.late_threshold_time,
                earliest_checkout_time: settings.earliest_checkout_time,
                absent_threshold_time: settings.absent_threshold_time
            };

            const leaveData: LeaveSettings = {
                max_permit_duration: settings.max_permit_duration,
                max_monthly_quota: settings.max_monthly_quota,
                require_evidence_for_sick: settings.require_evidence_for_sick
            };

            await Promise.all([
                updateCheckInLocation(checkinData),
                updateLeaveSettings(leaveData)
            ]);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['system-settings-combined'] });
            openAlert({
                title: 'Success!',
                message: 'All settings updated successfully!',
                variant: 'success'
            });
        },
        onError: (err: any) => {
            openAlert({
                title: 'Error',
                message: 'Error updating settings: ' + err.message,
                variant: 'error'
            });
        }
    });

    const currentSettings = localSettings || remoteSettings;

    if (isLoading && !currentSettings) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
                <CircularProgress size={48} thickness={4} />
                <Typography color="textSecondary" variant="h6">Synchronizing Map Data...</Typography>
            </Box>
        );
    }

    if (!currentSettings) {
        return (
            <Box sx={{ p: 4, height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Alert
                    severity={error ? "error" : "warning"}
                    sx={{ borderRadius: 3, maxWidth: 500 }}
                    action={
                        <Button color="inherit" size="small" onClick={() => refetch()}>
                            RETRY
                        </Button>
                    }
                >
                    <Typography variant="h6">{error ? "Database Connection Failed" : "Establishing Connection"}</Typography>
                    <Typography variant="body2">
                        {error ? (error as Error).message : "Almost ready, synchronizing location data..."}
                    </Typography>
                </Alert>
            </Box>
        );
    }

    const handleSave = () => {
        mutation.mutate(currentSettings);
    };

    return (
        <Box sx={{ px: { xs: 0, sm: 2 } }}>
            <Box sx={{
                mb: 4,
                p: 3,
                borderRadius: 4,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white',
                boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                gap: 2
            }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 0.5 }}>Map Control Center</Typography>
                    <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>Configure your organization's geofencing and check-in parameters.</Typography>
                </Box>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    bgcolor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    px: 3,
                    py: 1.5,
                    borderRadius: 3,
                    border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    <CalendarTick size={24} color="white" variant="Bulk" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={4}>
                {error && (
                    <Grid item xs={12}>
                        <Alert severity="error" sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            Error connecting to database: {(error as Error).message}
                        </Alert>
                    </Grid>
                )}

                <Grid item xs={12} lg={8}>
                    <MainCard
                        title="Interactive Boundary Map"
                        subheader="Click anywhere on the map to redefine the check-in epicenter."
                        sx={{
                            borderRadius: 4,
                            border: 'none',
                            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
                            overflow: 'hidden'
                        }}
                    >
                        <Box sx={{
                            position: 'relative',
                            borderRadius: 3,
                            overflow: 'hidden',
                            border: `1px solid ${theme.palette.divider}`
                        }}>
                            <MapPickerComponent
                                position={[currentSettings.latitude, currentSettings.longitude]}
                                radius={currentSettings.radius}
                                onPositionChange={(lat, lng) => setLocalSettings({ ...currentSettings, latitude: lat, longitude: lng })}
                            />
                        </Box>
                    </MainCard>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Stack spacing={4}>
                        <MainCard
                            title="Coordinate Precision"
                            sx={{ borderRadius: 4, border: 'none', boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}` }}
                        >
                            <Stack spacing={3}>
                                <TextField
                                    label="Latitude"
                                    value={currentSettings.latitude}
                                    onChange={(e) => setLocalSettings({ ...currentSettings, latitude: Number(e.target.value) })}
                                    fullWidth
                                    type="number"
                                    inputProps={{ step: "any" }}
                                    variant="filled"
                                    sx={{ '& .MuiFilledInput-root': { borderRadius: 2, bgcolor: alpha(theme.palette.primary.lighter, 0.1) } }}
                                />
                                <TextField
                                    label="Longitude"
                                    value={currentSettings.longitude}
                                    onChange={(e) => setLocalSettings({ ...currentSettings, longitude: Number(e.target.value) })}
                                    fullWidth
                                    type="number"
                                    inputProps={{ step: "any" }}
                                    variant="filled"
                                    sx={{ '& .MuiFilledInput-root': { borderRadius: 2, bgcolor: alpha(theme.palette.primary.lighter, 0.1) } }}
                                />
                                <TextField
                                    label="Reference Address"
                                    placeholder="Enter physical location name..."
                                    value={currentSettings.address}
                                    onChange={(e) => setLocalSettings({ ...currentSettings, address: e.target.value })}
                                    fullWidth
                                    multiline
                                    rows={4}
                                    variant="filled"
                                    sx={{ '& .MuiFilledInput-root': { borderRadius: 2, bgcolor: alpha(theme.palette.primary.lighter, 0.1) } }}
                                />
                            </Stack>
                        </MainCard>

                        <MainCard
                            title="Security Geofence"
                            sx={{ borderRadius: 4, border: 'none', boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}` }}
                        >
                            <Box sx={{ px: 1 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 700 }}>Radius</Typography>
                                    <Chip
                                        label={`${currentSettings.radius} Meters`}
                                        color="primary"
                                        sx={{ fontWeight: 800, borderRadius: 1.5 }}
                                    />
                                </Stack>
                                <Slider
                                    value={currentSettings.radius}
                                    min={50}
                                    max={2000}
                                    step={10}
                                    onChange={(_, value) => setLocalSettings({ ...currentSettings, radius: value as number })}
                                    valueLabelDisplay="auto"
                                    sx={{
                                        height: 8,
                                        '& .MuiSlider-thumb': {
                                            width: 24,
                                            height: 24,
                                            backgroundColor: '#fff',
                                            border: `2px solid ${theme.palette.primary.main}`,
                                            '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                                                boxShadow: 'inherit',
                                            },
                                        },
                                    }}
                                />
                                <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block', lineHeight: 1.4 }}>
                                    Adjusting this boundary will affect all participant check-ins. A wider radius is more lenient, while a tighter radius ensures on-site presence.
                                </Typography>
                            </Box>
                        </MainCard>

                        <MainCard
                            title="Attendance Time Rules"
                            sx={{ borderRadius: 4, border: 'none', boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}` }}
                        >
                            <Stack spacing={3}>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <Box>
                                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                            Late Threshold Time
                                        </Typography>
                                        <TimePicker
                                            value={(() => {
                                                const timeStr = currentSettings.late_threshold_time || "08:15";
                                                const [hours, minutes] = timeStr.split(':').map(Number);
                                                const date = new Date();
                                                date.setHours(hours, minutes, 0, 0);
                                                return date;
                                            })()}
                                            onChange={(newValue: Date | null) => {
                                                if (newValue) {
                                                    setLocalSettings({ ...currentSettings, late_threshold_time: format(newValue, 'HH:mm') });
                                                }
                                            }}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    variant: 'filled',
                                                    helperText: "Check-ins after this time will be marked as 'Late'",
                                                    sx: { '& .MuiFilledInput-root': { borderRadius: 2, bgcolor: alpha(theme.palette.primary.lighter, 0.1) } }
                                                }
                                            }}
                                            ampm={false}
                                        />
                                    </Box>

                                    <Box>
                                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                            Absent Threshold Time
                                        </Typography>
                                        <TimePicker
                                            value={(() => {
                                                const timeStr = currentSettings.absent_threshold_time || "12:00";
                                                const [hours, minutes] = timeStr.split(':').map(Number);
                                                const date = new Date();
                                                date.setHours(hours, minutes, 0, 0);
                                                return date;
                                            })()}
                                            onChange={(newValue: Date | null) => {
                                                if (newValue) {
                                                    setLocalSettings({ ...currentSettings, absent_threshold_time: format(newValue, 'HH:mm') });
                                                }
                                            }}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    variant: 'filled',
                                                    helperText: "Participants not checked in by this time will be marked as 'Absent'",
                                                    sx: { '& .MuiFilledInput-root': { borderRadius: 2, bgcolor: alpha(theme.palette.primary.lighter, 0.1) } }
                                                }
                                            }}
                                            ampm={false}
                                        />
                                    </Box>

                                    <Box>
                                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                            Earliest Checkout Time
                                        </Typography>
                                        <TimePicker
                                            value={(() => {
                                                const timeStr = currentSettings.earliest_checkout_time || "17:00";
                                                const [hours, minutes] = timeStr.split(':').map(Number);
                                                const date = new Date();
                                                date.setHours(hours, minutes, 0, 0);
                                                return date;
                                            })()}
                                            onChange={(newValue: Date | null) => {
                                                if (newValue) {
                                                    setLocalSettings({ ...currentSettings, earliest_checkout_time: format(newValue, 'HH:mm') });
                                                }
                                            }}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    variant: 'filled',
                                                    helperText: "Participants cannot check out before this time",
                                                    sx: { '& .MuiFilledInput-root': { borderRadius: 2, bgcolor: alpha(theme.palette.primary.lighter, 0.1) } }
                                                }
                                            }}
                                            ampm={false}
                                        />
                                    </Box>
                                </LocalizationProvider>
                            </Stack>
                        </MainCard>

                        <MainCard
                            title="Leave Management Rules"
                            sx={{ borderRadius: 4, border: 'none', boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}` }}
                        >
                            <Stack spacing={3}>
                                <TextField
                                    label="Max Days per Permit"
                                    value={currentSettings.max_permit_duration || 3}
                                    onChange={(e) => setLocalSettings({ ...currentSettings, max_permit_duration: Number(e.target.value) })}
                                    fullWidth
                                    type="number"
                                    helperText="Maximum duration limit for a single permit request."
                                    variant="filled"
                                    sx={{ '& .MuiFilledInput-root': { borderRadius: 2, bgcolor: alpha(theme.palette.primary.lighter, 0.1) } }}
                                />
                                <TextField
                                    label="Monthly Permit Quota (Days)"
                                    value={currentSettings.max_monthly_quota || 5}
                                    onChange={(e) => setLocalSettings({ ...currentSettings, max_monthly_quota: Number(e.target.value) })}
                                    fullWidth
                                    type="number"
                                    helperText="Total permit days allowed within a single month."
                                    variant="filled"
                                    sx={{ '& .MuiFilledInput-root': { borderRadius: 2, bgcolor: alpha(theme.palette.primary.lighter, 0.1) } }}
                                />

                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, bgcolor: alpha(theme.palette.primary.lighter, 0.1), borderRadius: 2 }}>
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Require Sick Evidence</Typography>
                                        <Typography variant="caption" color="textSecondary">Must upload a photo of doctor's note/medicine</Typography>
                                    </Box>
                                    <Switch
                                        checked={currentSettings.require_evidence_for_sick !== false}
                                        onChange={(e) => setLocalSettings({ ...currentSettings, require_evidence_for_sick: e.target.checked })}
                                    />
                                </Box>
                            </Stack>
                        </MainCard>

                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            onClick={handleSave}
                            disabled={mutation.isPending}
                            startIcon={mutation.isPending ? <CircularProgress size={20} color="inherit" /> : <TickCircle variant="Bold" />}
                            sx={{
                                py: 2,
                                borderRadius: 3,
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                textTransform: 'none',
                                boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                                '&:hover': {
                                    boxShadow: `0 16px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                                    transform: 'translateY(-2px)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {mutation.isPending ? 'Deploying Changes...' : 'Sync to Global System'}
                        </Button>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default MapSettingsView;
