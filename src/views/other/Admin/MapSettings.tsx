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
    Slider
} from '@mui/material';

// PROJECT IMPORTS
import MainCard from 'components/MainCard';
import { getCheckInLocation, updateCheckInLocation, CheckInLocation } from 'utils/api/settings';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { openAlert } from 'api/alert';

const MapPickerComponent = dynamic(() => import('components/MapPickerComponent'), {
    ssr: false,
    loading: () => (
        <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <CircularProgress />
        </Box>
    )
});

const MapSettingsView = () => {
    const queryClient = useQueryClient();
    const [localSettings, setLocalSettings] = useState<CheckInLocation | null>(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ['checkin-location'],
        queryFn: getCheckInLocation
    });

    useEffect(() => {
        if (data) {
            setLocalSettings(data);
        }
    }, [data]);

    const mutation = useMutation({
        mutationFn: updateCheckInLocation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['checkin-location'] });
            openAlert({
                title: 'Success!',
                message: 'Settings updated successfully!',
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

    if (isLoading || !localSettings) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    const handleSave = () => {
        if (localSettings) {
            mutation.mutate(localSettings);
        }
    };

    return (
        <Grid container spacing={3}>
            {error && (
                <Grid item xs={12}>
                    <Alert severity="error">Error loading settings: {(error as Error).message}</Alert>
                </Grid>
            )}

            <Grid item xs={12} md={8}>
                <MainCard title="Coordinate Picker">
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Click on the map to set the new check-in center point.
                    </Typography>
                    <MapPickerComponent
                        position={[localSettings.latitude, localSettings.longitude]}
                        radius={localSettings.radius}
                        onPositionChange={(lat, lng) => setLocalSettings(prev => prev ? { ...prev, latitude: lat, longitude: lng } : null)}
                    />
                </MainCard>
            </Grid>

            <Grid item xs={12} md={4}>
                <Stack spacing={3}>
                    <MainCard title="Location Details">
                        <Stack spacing={2.5}>
                            <TextField
                                label="Latitude"
                                value={localSettings.latitude}
                                onChange={(e) => setLocalSettings(prev => prev ? { ...prev, latitude: Number(e.target.value) } : null)}
                                fullWidth
                                type="number"
                                inputProps={{ step: "any" }}
                            />
                            <TextField
                                label="Longitude"
                                value={localSettings.longitude}
                                onChange={(e) => setLocalSettings(prev => prev ? { ...prev, longitude: Number(e.target.value) } : null)}
                                fullWidth
                                type="number"
                                inputProps={{ step: "any" }}
                            />
                            <TextField
                                label="Full Address (Display)"
                                value={localSettings.address}
                                onChange={(e) => setLocalSettings(prev => prev ? { ...prev, address: e.target.value } : null)}
                                fullWidth
                                multiline
                                rows={3}
                            />
                        </Stack>
                    </MainCard>

                    <MainCard title="Check-in Radius">
                        <Typography gutterBottom>Radius (meters): {localSettings.radius}m</Typography>
                        <Slider
                            value={localSettings.radius}
                            min={10}
                            max={1000}
                            step={10}
                            onChange={(_, value) => setLocalSettings(prev => prev ? { ...prev, radius: value as number } : null)}
                            valueLabelDisplay="auto"
                        />
                        <Typography variant="caption" color="textSecondary">
                            Determines how far users can be from the center point to allow check-in.
                        </Typography>
                    </MainCard>

                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                        onClick={handleSave}
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? 'Saving...' : 'Save Configuration'}
                    </Button>
                </Stack>
            </Grid>
        </Grid>
    );
};

export default MapSettingsView;
