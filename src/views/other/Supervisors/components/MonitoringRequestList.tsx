'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Typography,
    Box,
    CircularProgress,
    Stack,
    Avatar,
    Chip,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    useMediaQuery
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { TickCircle, CloseCircle, CloseSquare, ArrowRight } from 'iconsax-react';
import MainCard from 'components/MainCard';
import { formatTime } from 'utils/format';

import { FormattedMessage, useIntl } from 'react-intl';

interface MonitoringRequestListProps {
    pendingRequests: any[];
    requestsLoading: boolean;
    onStatusUpdate: (id: string, status: 'approved' | 'rejected') => void;
    statusMutationIsPending: boolean;
}

const MonitoringRequestList = ({
    pendingRequests,
    requestsLoading,
    onStatusUpdate,
    statusMutationIsPending
}: MonitoringRequestListProps) => {
    const theme = useTheme();
    const router = useRouter();
    const intl = useIntl();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [openOverlay, setOpenOverlay] = useState(false);

    const handleOpenOverlay = () => setOpenOverlay(true);
    const handleCloseOverlay = () => setOpenOverlay(false);

    // Limit display to 2 items in the dashboard card
    const displayItems = pendingRequests?.slice(0, 2) || [];

    const renderRequestItem = (request: any, isOverlay = false) => {
        const isVeryRecent = request.created_at && (new Date().getTime() - new Date(request.created_at).getTime()) < 5 * 60 * 1000;

        return (
            <Paper
                key={request.id}
                elevation={0}
                sx={{
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: isVeryRecent ? alpha(theme.palette.warning.lighter || theme.palette.warning.light, 0.4) : alpha(theme.palette.primary.main, 0.02),
                    position: 'relative',
                    transition: 'all 0.2s',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
                        bgcolor: isVeryRecent ? alpha(theme.palette.warning.lighter || theme.palette.warning.light, 0.6) : alpha(theme.palette.primary.main, 0.04)
                    }
                }}
            >
                {isVeryRecent && (
                    <Chip
                        label={intl.formatMessage({ id: "NEW" })}
                        color="warning"
                        size="small"
                        sx={{
                            position: 'absolute',
                            top: -10,
                            right: 10,
                            height: 20,
                            fontSize: '0.65rem',
                            fontWeight: 900,
                            border: '2px solid white'
                        }}
                    />
                )}
                <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Avatar
                        sx={{
                            width: 44,
                            height: 44,
                            bgcolor: theme.palette.primary.lighter || theme.palette.primary.light,
                            color: theme.palette.primary.main,
                            fontSize: '1rem',
                            fontWeight: 700
                        }}
                    >
                        {request.user?.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                {request.user?.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                                {formatTime(request.created_at || request.request_date)}
                            </Typography>
                        </Stack>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                                {request.location_name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">•</Typography>
                            <Typography variant="caption" color="textSecondary">
                                {request.user?.unit?.name || intl.formatMessage({ id: 'General' })}
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                px: 1.5,
                                py: 1,
                                bgcolor: 'white',
                                borderRadius: 1.5,
                                border: `1px dashed ${theme.palette.divider}`,
                                mb: 2
                            }}
                        >
                            <Typography variant="caption" color="textSecondary" sx={{ fontStyle: 'italic', display: 'block', lineHeight: 1.5 }}>
                                "{request.reason || intl.formatMessage({ id: 'monitoring.no_reason' })}"
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={1.5}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={() => onStatusUpdate(request.id, 'approved')}
                                disabled={statusMutationIsPending}
                                startIcon={<TickCircle variant="Bold" size={18} />}
                                sx={{
                                    borderRadius: 1.5,
                                    height: 38,
                                    boxShadow: 'none',
                                    '&:hover': { boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.2)}` }
                                }}
                            >
                                <FormattedMessage id="monitoring.approve" />
                            </Button>
                            <Button
                                fullWidth
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => onStatusUpdate(request.id, 'rejected')}
                                disabled={statusMutationIsPending}
                                startIcon={<CloseCircle variant="Bold" size={18} />}
                                sx={{
                                    borderRadius: 1.5,
                                    height: 38,
                                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.05) }
                                }}
                            >
                                <FormattedMessage id="monitoring.reject" />
                            </Button>
                        </Stack>
                    </Box>
                </Stack>
            </Paper>
        );
    };

    return (
        <>
            <MainCard
                title={intl.formatMessage({ id: "monitoring.out_area_requests" })}
                secondary={
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                            label={intl.formatMessage({ id: "monitoring.pending_count" }, { count: pendingRequests?.length || 0 })}
                            size="small"
                            color="warning"
                            variant="filled"
                            sx={{ borderRadius: 1, fontWeight: 700, px: 0.5 }}
                        />
                    </Stack>
                }
            >
                <Box sx={{ minHeight: 100 }}>
                    {requestsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                            <CircularProgress size={32} />
                        </Box>
                    ) : pendingRequests && pendingRequests.length > 0 ? (
                        <Stack spacing={2}>
                            {displayItems.map((request) => renderRequestItem(request))}

                            {pendingRequests.length > 2 && (
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    color="primary"
                                    onClick={handleOpenOverlay}
                                    endIcon={<ArrowRight size={18} />}
                                    sx={{
                                        borderRadius: 2,
                                        py: 1.2,
                                        borderStyle: 'dashed',
                                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                                        fontWeight: 700
                                    }}
                                >
                                    <FormattedMessage id="monitoring.view_all" /> ({pendingRequests.length})
                                </Button>
                            )}
                        </Stack>
                    ) : (
                        <Box sx={{ py: 6, textAlign: 'center' }}>
                            <Box
                                sx={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: '50%',
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px'
                                }}
                            >
                                <TickCircle size={32} color={theme.palette.success.main} variant="Bulk" />
                            </Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                <FormattedMessage id="monitoring.all_caught_up" />
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                <FormattedMessage id="monitoring.no_pending" />
                            </Typography>
                        </Box>
                    )}
                </Box>
            </MainCard>

            {/* Overlay Dialog for All Requests */}
            <Dialog
                open={openOverlay}
                onClose={handleCloseOverlay}
                maxWidth="sm"
                fullWidth
                fullScreen={isMobile}
                PaperProps={{
                    sx: {
                        borderRadius: isMobile ? 0 : 4,
                        maxHeight: '85vh',
                        boxShadow: `0 24px 48px ${alpha(theme.palette.common.black, 0.15)}`
                    }
                }}
            >
                <DialogTitle sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    bgcolor: alpha(theme.palette.primary.main, 0.02)
                }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>
                            <FormattedMessage id="monitoring.out_area_requests" />
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                            Showing all pending check-in requests
                        </Typography>
                    </Box>
                    <IconButton onClick={handleCloseOverlay} color="error" sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}>
                        <CloseSquare variant="Bold" />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 3, bgcolor: '#fbfbfb' }}>
                    <Stack spacing={2} sx={{ py: 1 }}>
                        {pendingRequests.map((request) => renderRequestItem(request, true))}
                    </Stack>
                </DialogContent>
                <Box sx={{ p: 2.5, borderTop: `1px solid ${theme.palette.divider}`, textAlign: 'center', bgcolor: 'white' }}>
                    <Button
                        variant="text"
                        color="primary"
                        onClick={() => {
                            handleCloseOverlay();
                            router.push('/Monitoringsuper');
                        }}
                        sx={{ fontWeight: 700 }}
                    >
                        Go to Full Monitoring View
                    </Button>
                </Box>
            </Dialog>
        </>
    );
};

export default MonitoringRequestList;
