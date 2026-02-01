'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    CircularProgress,
    Stack
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createMonitoringRequest } from 'utils/api/monitoring';
import { openAlert } from 'api/alert';

import { signOut } from 'next-auth/react';

const MapPickerComponent = dynamic(() => import('components/MapPickerComponent'), {
    ssr: false,
    loading: () => (
        <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <CircularProgress />
        </Box>
    )
});

interface OutAreaRequestDialogProps {
    open: boolean;
    onClose: () => void;
    userId: string;
}

const OutAreaRequestDialog: React.FC<OutAreaRequestDialogProps> = ({ open, onClose, userId }) => {
    const queryClient = useQueryClient();
    const [reason, setReason] = useState('');
    const [latitude, setLatitude] = useState(-6.974580);
    const [longitude, setLongitude] = useState(107.630910);

    // Set initial position to current location if available
    useEffect(() => {
        if (open && "geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);
            });
        }
    }, [open]);

    const mutation = useMutation({
        mutationFn: createMonitoringRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['monitoring-requests'] });
            queryClient.invalidateQueries({ queryKey: ['today-monitoring-requests'] });
            queryClient.invalidateQueries({ queryKey: ['user-attendances'] });
            queryClient.invalidateQueries({ queryKey: ['participant-dashboard-data'] });
            openAlert({
                title: 'Request Submitted!',
                message: 'Your out-area check-in request has been submitted for approval.',
                variant: 'success'
            });
            handleClose();
        },
        onError: (error: any) => {
            console.error('Submission error:', error);

            if (error.message && (error.message.includes('Foreign key constraint violated') || error.message.includes('monitoring_locations_user_id'))) {
                openAlert({
                    title: 'Authentication Error',
                    message: 'Your user session is invalid. Please log in again to fix this issue.',
                    variant: 'error',
                    confirmText: 'Log Out Now',
                    onConfirm: () => signOut({ callbackUrl: '/login' })
                });
            } else {
                openAlert({
                    title: 'Error',
                    message: 'Failed to submit request: ' + error.message,
                    variant: 'error'
                });
            }
        }
    });

    const handleClose = () => {
        setReason('');
        setLatitude(-6.974580);
        setLongitude(107.630910);
        onClose();
    };

    const handleSubmit = () => {
        if (!userId) {
            openAlert({
                title: 'Authentication Missing',
                message: 'User ID is missing. Please log in again.',
                variant: 'error',
                confirmText: 'Log Out & Retry',
                onConfirm: () => signOut({ callbackUrl: '/login' })
            });
            return;
        }

        if (!reason.trim()) {
            openAlert({
                title: 'Validation Error',
                message: 'Please provide a reason for your request',
                variant: 'warning'
            });
            return;
        }

        mutation.mutate({
            user_id: userId,
            location_name: `Out-Area Request (${reason.substring(0, 20)}...)`,
            latitude,
            longitude,
            request_date: new Date().toISOString().split('T')[0],
            reason,
            status: 'pending'
        });
    };

    const handlePositionChange = (lat: number, lng: number) => {
        setLatitude(lat);
        setLongitude(lng);
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>Request Out-Area Check-In</DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                        If you need to check-in from a location outside the designated area, please submit a request with the details below.
                    </Typography>

                    <TextField
                        label="Reason for Out-Area Check-In"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Explain why you need to check-in from this location..."
                        helperText="Provide a reason for your supervisor to review"
                    />

                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Select Location on Map
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
                            Click on the map to set your desired check-in location
                        </Typography>
                        <MapPickerComponent
                            position={[latitude, longitude]}
                            radius={100}
                            onPositionChange={handlePositionChange}
                        />
                    </Box>

                    <Stack direction="row" spacing={2}>
                        <TextField
                            label="Latitude"
                            value={latitude.toFixed(6)}
                            InputProps={{ readOnly: true }}
                            size="small"
                            fullWidth
                        />
                        <TextField
                            label="Longitude"
                            value={longitude.toFixed(6)}
                            InputProps={{ readOnly: true }}
                            size="small"
                            fullWidth
                        />
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={handleClose} color="secondary">
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? 'Submitting...' : 'Submit Request'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default OutAreaRequestDialog;
