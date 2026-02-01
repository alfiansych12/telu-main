'use client';

import React from 'react';

// MATERIAL - UI
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    Stack,
    Typography,
    Zoom
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

// PROJECT IMPORTS
import { useGetAlert, closeAlert } from 'api/alert';

// ASSETS
import { TickCircle, Danger, InfoCircle, Warning2 } from 'iconsax-react';

const alertIcons = {
    success: <TickCircle size={60} variant="Bulk" color="#2ecc71" />,
    error: <Danger size={60} variant="Bulk" color="#e74c3c" />,
    warning: <Warning2 size={60} variant="Bulk" color="#f1c40f" />,
    info: <InfoCircle size={60} variant="Bulk" color="#3498db" />
};

const CustomAlert = () => {
    const theme = useTheme();
    const { alert } = useGetAlert();

    const handleConfirm = () => {
        if (alert.onConfirm) alert.onConfirm();
        closeAlert();
    };

    const handleCancel = () => {
        if (alert.onCancel) alert.onCancel();
        closeAlert();
    };

    return (
        <Dialog
            open={alert.open}
            TransitionComponent={Zoom}
            onClose={handleCancel}
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    padding: 2,
                    maxWidth: 400,
                    width: '90%',
                    overflow: 'visible',
                    backdropFilter: 'blur(10px)',
                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.2)}`
                }
            }}
        >
            <DialogContent>
                <Stack alignItems="center" spacing={3} sx={{ py: 2 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            backgroundColor: alpha(
                                alert.variant === 'success' ? '#2ecc71' :
                                    alert.variant === 'error' ? '#e74c3c' :
                                        alert.variant === 'warning' ? '#f1c40f' : '#3498db',
                                0.1
                            ),
                            mb: 1
                        }}
                    >
                        {alertIcons[alert.variant]}
                    </Box>

                    <Stack spacing={1} alignItems="center">
                        {alert.title && (
                            <Typography variant="h3" sx={{ fontWeight: 700, textAlign: 'center' }}>
                                {alert.title}
                            </Typography>
                        )}
                        <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', fontSize: '1.1rem', whiteSpace: 'pre-line' }}>
                            {alert.message}
                        </Typography>
                    </Stack>

                    <Stack direction="row" spacing={2} sx={{ width: 1, mt: 2 }}>
                        {alert.showCancel && (
                            <Button
                                variant="outlined"
                                color="secondary"
                                fullWidth
                                size="large"
                                onClick={handleCancel}
                                sx={{ borderRadius: 2, py: 1.5 }}
                            >
                                {alert.cancelText || 'Cancel'}
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            onClick={handleConfirm}
                            sx={{
                                borderRadius: 2,
                                py: 1.5,
                                backgroundColor:
                                    alert.variant === 'success' ? '#2ecc71' :
                                        alert.variant === 'error' ? '#e74c3c' :
                                            alert.variant === 'warning' ? '#f1c40f' : '#3498db',
                                '&:hover': {
                                    backgroundColor:
                                        alert.variant === 'success' ? '#27ae60' :
                                            alert.variant === 'error' ? '#c0392b' :
                                                alert.variant === 'warning' ? '#f39c12' : '#2980b9',
                                },
                                boxShadow: `0 8px 16px ${alpha(
                                    alert.variant === 'success' ? '#2ecc71' :
                                        alert.variant === 'error' ? '#e74c3c' :
                                            alert.variant === 'warning' ? '#f1c40f' : '#3498db',
                                    0.3
                                )}`
                            }}
                        >
                            {alert.confirmText || 'OK'}
                        </Button>
                    </Stack>
                </Stack>
            </DialogContent>
        </Dialog>
    );
};

export default CustomAlert;
