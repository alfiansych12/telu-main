'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Stack,
    Avatar,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    CircularProgress,
    Alert
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLeaveRequests, updateLeaveRequestStatus, getLeaveRequestById } from 'utils/api/leaves';
import { Eye, TickCircle, CloseCircle } from 'iconsax-react';
import { alpha, useTheme, keyframes } from '@mui/material/styles';
import { formatDate } from 'utils/format';
import { openAlert } from 'api/alert';
import { FormattedMessage, useIntl } from 'react-intl';
import { differenceInHours, differenceInDays } from 'date-fns';

const pulseEffect = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`;

interface LeaveRequestListProps {
    supervisorId?: string;
    unitId?: string;
}

const LeaveRequestList: React.FC<LeaveRequestListProps> = ({ supervisorId, unitId }) => {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const intl = useIntl();
    const requestIdParam = searchParams.get('requestId');

    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [notes, setNotes] = useState('');

    const { data: requestsData, isLoading, error } = useQuery({
        queryKey: ['leave-requests', supervisorId, unitId, 'pending'],
        queryFn: () => getLeaveRequests({
            supervisorId,
            unitId: unitId === 'all' ? undefined : unitId,
            status: 'pending',
            pageSize: 50
        }),
        refetchOnWindowFocus: true,
        staleTime: 10000
    });

    // Auto-open if requestId is in URL
    useEffect(() => {
        const fetchAndOpen = async () => {
            if (!requestIdParam) return;

            // First check if it's in the current list
            const list = Array.isArray(requestsData) ? requestsData : (requestsData?.data || []);
            const reqInList = list.find((r: any) => r.id === requestIdParam);

            if (reqInList) {
                setSelectedRequest(reqInList);
                setDetailDialogOpen(true);
                router.replace(pathname);
                return;
            }

            // If not in list, fetch it directly
            try {
                const req = await getLeaveRequestById(requestIdParam);
                if (req) {
                    setSelectedRequest(req);
                    setDetailDialogOpen(true);

                    // Clear the requestId from URL so it can be re-triggered if needed
                    // and to keep the URL clean
                    router.replace(pathname);
                }
            } catch (err) {
                console.error('Error fetching deep-linked request:', err);
            }
        };

        if (requestIdParam) {
            fetchAndOpen();
        }
    }, [requestIdParam, requestsData, pathname, router]);

    const mutation = useMutation({
        mutationFn: ({ id, status, notes }: { id: string, status: 'approved' | 'rejected', notes?: string }) =>
            updateLeaveRequestStatus(id, status, notes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
            queryClient.invalidateQueries({ queryKey: ['attendances'] });
            openAlert({
                title: 'Success!',
                message: 'Request status has been updated.',
                variant: 'success'
            });
            setDetailDialogOpen(false);
            setSelectedRequest(null);
            setNotes('');
        },
        onError: (err: any) => {
            openAlert({
                title: 'Error',
                message: 'Failed to update status: ' + err.message,
                variant: 'error'
            });
        }
    });

    const handleAction = (status: 'approved' | 'rejected') => {
        if (!selectedRequest) return;
        mutation.mutate({ id: selectedRequest.id, status, notes });
    };

    if (isLoading) return <CircularProgress size={20} />;
    if (error) return <Alert severity="error">Error loading requests</Alert>;

    const requests = Array.isArray(requestsData) ? requestsData : (requestsData?.data || []);

    return (
        <Box>
            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                <Table size="small">
                    <TableHead sx={{ bgcolor: theme.palette.grey[50] }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}><FormattedMessage id="Participant" defaultMessage="Peserta" /></TableCell>
                            <TableCell sx={{ fontWeight: 600 }}><FormattedMessage id="Type" defaultMessage="Tipe" /></TableCell>
                            <TableCell sx={{ fontWeight: 600 }}><FormattedMessage id="Dates" defaultMessage="Tanggal" /></TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}><FormattedMessage id="Action" defaultMessage="Aksi" /></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body2" color="textSecondary">No pending leave requests</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            requests.map((request: any) => {
                                const createdDate = new Date(request.created_at || new Date());
                                const hoursPending = differenceInHours(new Date(), createdDate);
                                const daysPending = differenceInDays(new Date(), createdDate);
                                const isOverdue = hoursPending >= 24;

                                return (
                                    <TableRow key={request.id} hover sx={{
                                        bgcolor: isOverdue ? alpha(theme.palette.error.lighter, 0.1) : 'inherit',
                                        transition: 'background-color 0.3s ease'
                                    }}>
                                        <TableCell>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Avatar sx={{
                                                    width: 28,
                                                    height: 28,
                                                    fontSize: '0.75rem',
                                                    border: isOverdue ? `2px solid ${theme.palette.error.main}` : 'none'
                                                }}>
                                                    {request.user?.name?.charAt(0) || 'U'}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{request.user?.name}</Typography>
                                                    {isOverdue && (
                                                        <Typography variant="caption" color="error" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <Box sx={{
                                                                width: 6,
                                                                height: 6,
                                                                bgcolor: 'error.main',
                                                                borderRadius: '50%',
                                                                animation: `${pulseEffect} 1.5s infinite ease-in-out`
                                                            }} />
                                                            <FormattedMessage id="monitoring.leave.overdue" />
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={request.type === 'forgot' ? intl.formatMessage({ id: 'dashboard.leave.type.forgot' }) : request.type}
                                                size="small"
                                                color={request.type === 'sick' ? 'error' : request.type === 'forgot' ? 'primary' : 'info'}
                                                variant="outlined"
                                                sx={{ textTransform: 'capitalize', height: 20, fontSize: '0.65rem' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Stack>
                                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                                    {formatDate(request.start_date)} - {formatDate(request.end_date)}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.65rem' }}>
                                                    <FormattedMessage id="monitoring.leave.waiting_time" />: {daysPending > 0 ? `${daysPending} ${intl.formatMessage({ id: 'monitoring.leave.days' })}` : `${hoursPending} ${intl.formatMessage({ id: 'monitoring.leave.hours' })}`}
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                size="small"
                                                color={isOverdue ? "error" : "primary"}
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setDetailDialogOpen(true);
                                                }}
                                                sx={{
                                                    bgcolor: isOverdue ? alpha(theme.palette.error.main, 0.1) : 'transparent',
                                                    '&:hover': { bgcolor: isOverdue ? alpha(theme.palette.error.main, 0.2) : alpha(theme.palette.primary.main, 0.1) }
                                                }}
                                            >
                                                <Eye size={16} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Request Detail Dialog */}
            <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Leave Request Details</DialogTitle>
                <DialogContent dividers>
                    {selectedRequest && (
                        <Stack spacing={3} sx={{ mt: 1 }}>
                            <Box>
                                <Typography variant="caption" color="textSecondary">Requested By</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedRequest.user?.name}</Typography>
                            </Box>
                            <Stack direction="row" spacing={4}>
                                <Box>
                                    <Typography variant="caption" color="textSecondary">Type</Typography>
                                    <Box><Chip label={selectedRequest.type} color={selectedRequest.type === 'sick' ? 'error' : 'info'} size="small" /></Box>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="textSecondary">Duration</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {formatDate(selectedRequest.start_date)} to {formatDate(selectedRequest.end_date)}
                                    </Typography>
                                </Box>
                            </Stack>
                            <Box>
                                <Typography variant="caption" color="textSecondary">Reason</Typography>
                                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.grey[500], 0.05), borderRadius: 2 }}>
                                    <Typography variant="body2">{selectedRequest.reason}</Typography>
                                </Paper>
                            </Box>
                            {selectedRequest.evidence && (
                                <Box>
                                    <Typography variant="caption" color="textSecondary">Evidence / Proof</Typography>
                                    <Box sx={{ mt: 1, borderRadius: 2, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
                                        <img src={selectedRequest.evidence} alt="Evidence" style={{ width: '100%', maxHeight: 300, objectFit: 'contain' }} />
                                    </Box>
                                </Box>
                            )}
                            <TextField
                                label="Review Notes (Optional)"
                                fullWidth
                                multiline
                                rows={2}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Explain why you approved or rejected..."
                            />
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setDetailDialogOpen(false)} color="inherit">Close</Button>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CloseCircle />}
                        onClick={() => handleAction('rejected')}
                        disabled={mutation.isPending}
                    >
                        Reject
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<TickCircle />}
                        onClick={() => handleAction('approved')}
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? 'Processing...' : 'Approve Request'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default LeaveRequestList;
