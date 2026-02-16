'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Stack,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    IconButton,
    Alert
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createLeaveRequest } from 'utils/api/leaves';
import { openAlert } from 'api/alert';
import { GalleryAdd, Trash, CloseCircle, CalendarTick } from 'iconsax-react';
import { alpha, useTheme } from '@mui/material/styles';
import Dropzone from 'react-dropzone';
import { addDays, differenceInDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { FormattedMessage } from 'react-intl';

interface LeaveRequestDialogProps {
    open: boolean;
    onClose: () => void;
    userId: string;
    supervisorName?: string;
    initialDate?: Date | null;
}

const LeaveRequestDialog: React.FC<LeaveRequestDialogProps> = ({ open, onClose, userId, supervisorName, initialDate }) => {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const [type, setType] = useState<'sick' | 'permit' | 'forgot'>('permit');
    const [startDate, setStartDate] = useState<Date | null>(new Date());
    const [endDate, setEndDate] = useState<Date | null>(new Date());
    const [reason, setReason] = useState('');
    const [evidence, setEvidence] = useState<string | null>(null);

    React.useEffect(() => {
        if (open) {
            const date = initialDate || new Date();
            setStartDate(date);
            setEndDate(date);
        }
    }, [open, initialDate]);

    const { data: settings } = useQuery({
        queryKey: ['leave-settings'],
        queryFn: async () => {
            const { getLeaveSettings } = await import('utils/api/settings');
            return getLeaveSettings();
        }
    });

    const { data: leaveHistory } = useQuery({
        queryKey: ['leave-requests-current-month', userId],
        queryFn: async () => {
            const { getLeaveRequests } = await import('utils/api/leaves');
            return getLeaveRequests({ userId, status: 'approved' }); // or 'pending' as well
        },
        enabled: !!userId
    });

    // Calculate used quota for current month
    const usedQuota = React.useMemo(() => {
        if (!leaveHistory?.data) return 0;
        const now = new Date();
        const firstDay = startOfMonth(now);
        const lastDay = endOfMonth(now);

        let total = 0;
        leaveHistory.data.forEach(req => {
            const s = new Date(req.start_date);
            const e = new Date(req.end_date);

            // Simple overlap check
            if (isWithinInterval(s, { start: firstDay, end: lastDay }) || isWithinInterval(e, { start: firstDay, end: lastDay })) {
                const effectiveStart = s < firstDay ? firstDay : s;
                const effectiveEnd = e > lastDay ? lastDay : e;
                total += differenceInDays(effectiveEnd, effectiveStart) + 1;
            }
        });
        return total;
    }, [leaveHistory]);

    const mutation = useMutation({
        mutationFn: createLeaveRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
            queryClient.invalidateQueries({ queryKey: ['participant-dashboard-data'] });
            openAlert({
                title: 'Request Submitted!',
                message: 'Your leave request has been submitted for approval.',
                variant: 'success'
            });
            handleClose();
        },
        onError: (error: any) => {
            openAlert({
                title: 'Error',
                message: 'Failed to submit request: ' + error.message,
                variant: 'error'
            });
        }
    });

    const handleClose = () => {
        setType('permit');
        setStartDate(new Date());
        setEndDate(new Date());
        setReason('');
        setEvidence(null);
        onClose();
    };

    const handleSubmit = () => {
        if (!userId) return;
        if (!startDate || !endDate || !reason.trim()) {
            openAlert({
                title: 'Input Required',
                message: 'Please fill in all required fields.',
                variant: 'warning'
            });
            return;
        }

        const durationDays = differenceInDays(endDate, startDate) + 1;

        if (settings) {
            // Check Max Duration
            if (durationDays > settings.max_permit_duration) {
                openAlert({
                    title: 'Invalid Duration',
                    message: `Duration exceeds maximum allowed (${settings.max_permit_duration} days).`,
                    variant: 'error'
                });
                return;
            }

            // Check Monthly Quota
            if ((usedQuota + durationDays) > settings.max_monthly_quota) {
                openAlert({
                    title: 'Quota Exceeded',
                    message: `You have already used ${usedQuota} days this month. This request would exceed your monthly quota of ${settings.max_monthly_quota} days.`,
                    variant: 'error'
                });
                return;
            }

            // Check Sick Leave Evidence
            if (type === 'sick' && settings.require_evidence_for_sick && !evidence) {
                openAlert({
                    title: 'Evidence Required',
                    message: 'Please upload medical evidence for sick leave.',
                    variant: 'warning'
                });
                return;
            }
        }

        mutation.mutate({
            user_id: userId,
            type,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            reason,
            evidence
        });
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>Request Leave / Permit</Typography>
                <IconButton onClick={handleClose} size="small">
                    <CloseCircle />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                        Your request will be sent to your supervisor <strong>{supervisorName ? `(${supervisorName})` : ''}</strong> for approval.
                    </Alert>

                    <FormControl fullWidth>
                        <InputLabel>Leave Type</InputLabel>
                        <Select
                            value={type}
                            label="Leave Type"
                            onChange={(e) => setType(e.target.value as any)}
                            sx={{ borderRadius: 2 }}
                        >
                            <MenuItem value="sick">Sick Leave</MenuItem>
                            <MenuItem value="permit">Permit / Other</MenuItem>
                            <MenuItem value="forgot"><FormattedMessage id="dashboard.leave.type.forgot" /></MenuItem>
                        </Select>
                    </FormControl>

                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <DatePicker
                                label="Start Date"
                                value={startDate}
                                onChange={(newValue) => {
                                    setStartDate(newValue);
                                    // If end date is now before start date, or exceeds duration, reset it
                                    if (newValue && endDate && (newValue > endDate || differenceInDays(endDate, newValue) >= (settings?.max_permit_duration || 3))) {
                                        setEndDate(newValue);
                                    }
                                }}
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                            <DatePicker
                                label="End Date"
                                value={endDate}
                                minDate={startDate || undefined}
                                maxDate={startDate ? addDays(startDate, (settings?.max_permit_duration || 3) - 1) : undefined}
                                onChange={(newValue) => setEndDate(newValue)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        helperText: startDate && settings?.max_permit_duration ?
                                            `Max: ${addDays(startDate, settings.max_permit_duration - 1).toLocaleDateString()}` : ''
                                    }
                                }}
                            />
                        </Stack>
                    </LocalizationProvider>

                    {settings && (
                        <Box sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                        }}>
                            <Stack spacing={1}>
                                {type === 'sick' && settings.require_evidence_for_sick && (
                                    <Typography variant="caption" color="error" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <CloseCircle size={14} variant="Bold" />
                                        * Must attach a photo evidence (doctor's note/medicine) for sick leave.
                                    </Typography>
                                )}
                                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: theme.palette.text.secondary }}>
                                    <CalendarTick size={14} variant="Bold" />
                                    Maximum permit duration: <strong>{settings.max_permit_duration} consecutive days</strong>.
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: theme.palette.text.secondary }}>
                                    <CalendarTick size={14} variant="Bold" />
                                    Monthly quota: <strong>{usedQuota} / {settings.max_monthly_quota} days</strong> used.
                                </Typography>
                                {type === 'forgot' && (
                                    <Typography variant="caption" color="primary" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <CalendarTick size={14} variant="Bold" />
                                        <FormattedMessage id="dashboard.leave.forgot_desc" />
                                    </Typography>
                                )}
                            </Stack>
                        </Box>
                    )}

                    <TextField
                        label="Reason"
                        multiline
                        rows={3}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Explain your reason..."
                        fullWidth
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />

                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <GalleryAdd size={18} variant="Bulk" color={theme.palette.primary.main} />
                            Evidence / Proof (Optional)
                        </Typography>

                        {!evidence ? (
                            <Dropzone onDrop={(files: File[]) => {
                                const file = files[0];
                                if (file) {
                                    if (file.size > 2 * 1024 * 1024) {
                                        openAlert({ title: 'File Too Large', message: 'Maximum file size is 2MB.', variant: 'error' });
                                        return;
                                    }
                                    const reader = new FileReader();
                                    reader.onload = (e) => setEvidence(e.target?.result as string);
                                    reader.readAsDataURL(file);
                                }
                            }} accept={{ 'image/*': ['.jpeg', '.jpg', '.png'] }}>
                                {({ getRootProps, getInputProps, isDragActive }: any) => (
                                    <Box
                                        {...getRootProps()}
                                        sx={{
                                            border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
                                            borderRadius: 3,
                                            p: 4,
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease-in-out',
                                            bgcolor: isDragActive ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                                            '&:hover': {
                                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                borderColor: theme.palette.primary.main,
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        <input {...getInputProps()} />
                                        <Stack spacing={1} alignItems="center">
                                            <Box sx={{
                                                p: 1.5,
                                                borderRadius: '50%',
                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                color: theme.palette.primary.main,
                                                mb: 1
                                            }}>
                                                <GalleryAdd size={32} />
                                            </Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                {isDragActive ? 'Drop it here!' : 'Select or Drag Evidence'}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                JPG, PNG or JPEG (Max. 2MB)
                                            </Typography>
                                        </Stack>
                                    </Box>
                                )}
                            </Dropzone>
                        ) : (
                            <Box sx={{
                                position: 'relative',
                                borderRadius: 3,
                                overflow: 'hidden',
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: theme.customShadows?.z1 || '0 2px 8px rgba(0,0,0,0.05)'
                            }}>
                                <img
                                    src={evidence}
                                    alt="Leave evidence"
                                    style={{ width: '100%', maxHeight: 300, objectFit: 'contain', display: 'block' }}
                                />
                                <Box sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    bgcolor: 'rgba(0,0,0,0.1)',
                                    opacity: 0,
                                    transition: 'opacity 0.2s',
                                    '&:hover': { opacity: 1 },
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        startIcon={<Trash size={16} />}
                                        onClick={() => setEvidence(null)}
                                        size="small"
                                        sx={{ borderRadius: 2 }}
                                    >
                                        Remove Image
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={handleClose} color="inherit">Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    size="large"
                    disabled={mutation.isPending}
                    sx={{ borderRadius: 2, px: 4 }}
                >
                    {mutation.isPending ? 'Submitting...' : 'Submit Request'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default LeaveRequestDialog;
