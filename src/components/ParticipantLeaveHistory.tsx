'use client';

import React from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    Stack,
    CircularProgress
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getLeaveRequests } from 'utils/api/leaves';
import { formatDate } from 'utils/format';
import { useTheme, alpha } from '@mui/material/styles';
import { Clock, TickCircle, CloseCircle, Information } from 'iconsax-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { differenceInHours } from 'date-fns';

interface ParticipantLeaveHistoryProps {
    userId: string;
}

const ParticipantLeaveHistory: React.FC<ParticipantLeaveHistoryProps> = ({ userId }) => {
    const theme = useTheme();
    const intl = useIntl();

    const { data, isLoading, error } = useQuery({
        queryKey: ['my-leave-requests', userId],
        queryFn: () => getLeaveRequests({ userId, pageSize: 5 }),
    });

    if (isLoading) return <CircularProgress size={20} />;

    // If no requests or error, hide the section or show simplified view
    if (error || !data?.data || data.data.length === 0) return null;

    return (
        <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                <FormattedMessage id="Recent Requests" defaultMessage="Permintaan Terbaru" />
            </Typography>
            <Stack spacing={2}>
                {data.data.map((request: any) => {
                    const hoursPending = differenceInHours(new Date(), new Date(request.created_at || new Date()));
                    const isOverdue = request.status === 'pending' && hoursPending >= 24;

                    return (
                        <Card key={request.id} sx={{
                            borderRadius: 2,
                            boxShadow: 'none',
                            border: `1px solid ${isOverdue ? theme.palette.error.light : theme.palette.divider}`,
                            bgcolor: isOverdue ? alpha(theme.palette.error.lighter, 0.1) : 'background.paper',
                            transition: 'all 0.3s ease'
                        }}>
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Box sx={{ flex: 1 }}>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                                {request.type === 'sick' ? intl.formatMessage({ id: 'Sick Leave' }) : request.type === 'forgot' ? intl.formatMessage({ id: 'dashboard.leave.type.forgot' }) : intl.formatMessage({ id: 'Permit' })}
                                            </Typography>
                                            <Chip
                                                label={request.status}
                                                size="small"
                                                color={
                                                    request.status === 'approved' ? 'success' :
                                                        request.status === 'rejected' ? 'error' : 'warning'
                                                }
                                                variant="filled"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.65rem',
                                                    textTransform: 'capitalize'
                                                }}
                                            />
                                        </Stack>
                                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                                            {formatDate(request.start_date)} - {formatDate(request.end_date)}
                                        </Typography>

                                        {isOverdue && (
                                            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1, color: 'error.main' }}>
                                                <Information size={14} variant="Bold" />
                                                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                                    <FormattedMessage id="dashboard.leave.overdue_msg" />
                                                </Typography>
                                            </Stack>
                                        )}

                                        {request.notes && (
                                            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: theme.palette.text.secondary, bgcolor: alpha(theme.palette.grey[500], 0.05), p: 1, borderRadius: 1 }}>
                                                Note: {request.notes}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box sx={{ ml: 1 }}>
                                        {request.status === 'approved' && <TickCircle size={20} color={theme.palette.success.main} variant="Bold" />}
                                        {request.status === 'rejected' && <CloseCircle size={20} color={theme.palette.error.main} variant="Bold" />}
                                        {request.status === 'pending' && <Clock size={20} color={isOverdue ? theme.palette.error.main : theme.palette.warning.main} variant="Bold" />}
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    );
                })}
            </Stack>
        </Box>
    );
};

export default ParticipantLeaveHistory;
