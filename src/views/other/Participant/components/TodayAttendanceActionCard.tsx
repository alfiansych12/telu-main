'use client';

import React from 'react';
import {
    Typography,
    Box,
    Button,
    Stack,
    Avatar,
    CircularProgress,
    IconButton,
    Chip
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Timer1, Calendar, DirectNotification, GalleryAdd, Trash, CloseCircle, Award, Location, TickCircle } from 'iconsax-react';
import MainCard from 'components/MainCard';
import ParticipantLeaveHistory from 'components/ParticipantLeaveHistory';
import { formatTime } from 'utils/format';
import { FormattedMessage, useIntl } from 'react-intl';

// Local Alert Component
const Alert = ({ children, severity, icon }: { children: React.ReactNode, severity: 'success' | 'info' | 'warning' | 'error', icon?: React.ReactNode }) => {
    const theme = useTheme();
    const color = severity === 'success' ? theme.palette.success : severity === 'error' ? theme.palette.error : severity === 'warning' ? theme.palette.warning : theme.palette.info;
    return (
        <Box sx={{
            p: 1.5,
            bgcolor: color.lighter,
            color: color.main,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            border: `1px solid ${color.light}`,
            mb: 2
        }}>
            {icon}
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{children}</Typography>
        </Box>
    );
};

interface TodayAttendanceActionCardProps {
    userId: string;
    checkedIn: boolean;
    checkedOut: boolean;
    isPending: boolean;
    isRejected: boolean;
    isOutOfArea: boolean;
    latestRequest: any;
    checkInMutationPending: boolean;
    handleCheckIn: () => void;
    setOutAreaDialogOpen: (open: boolean) => void;
    setLeaveDialogOpen: (open: boolean) => void;
    todayAttendance: any;
    activityPlan: string;
    setActivityPlan: (plan: string) => void;
    attendancePhoto: string | null;
    setAttendancePhoto: (photo: string | null) => void;
    handleCheckOut: () => void;
    checkOutMutationPending: boolean;
    certLoading: boolean;
    onCheckCertificate: () => Promise<void>;
    locationSettings?: any;
}

const TodayAttendanceActionCard = ({
    userId,
    checkedIn,
    checkedOut,
    isPending,
    isRejected,
    isOutOfArea,
    latestRequest,
    checkInMutationPending,
    handleCheckIn,
    setOutAreaDialogOpen,
    setLeaveDialogOpen,
    todayAttendance,
    activityPlan,
    setActivityPlan,
    attendancePhoto,
    setAttendancePhoto,
    handleCheckOut,
    checkOutMutationPending,
    certLoading,
    onCheckCertificate,
    locationSettings
}: TodayAttendanceActionCardProps) => {
    const theme = useTheme();
    const intl = useIntl();

    const isPastAbsent = React.useMemo(() => {
        if (!locationSettings?.absent_threshold_time) return false;
        const now = new Date();
        const [abHours, abMinutes] = locationSettings.absent_threshold_time.split(':').map(Number);
        return now.getHours() > abHours || (now.getHours() === abHours && now.getMinutes() >= abMinutes);
    }, [locationSettings]);

    const isOnLeave = todayAttendance?.status === 'sick' || todayAttendance?.status === 'permit';

    return (
        <MainCard title={intl.formatMessage({ id: "dashboard.attendance.today" })}>
            {isOnLeave ? (
                <Box sx={{
                    py: 3,
                    px: 3,
                    textAlign: 'center',
                    background: alpha(theme.palette.info.lighter, 0.3),
                    borderRadius: 4,
                    border: `1px solid ${alpha(theme.palette.info.light, 0.5)}`,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 150,
                        height: 150,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.15)} 0%, transparent 100%)`,
                        zIndex: 0
                    }
                }}>
                    <Stack spacing={2} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                        <Box sx={{ position: 'relative' }}>
                            <Avatar sx={{
                                width: 70,
                                height: 70,
                                background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
                                color: '#fff',
                                boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.2)}`,
                                mb: 0.5
                            }}>
                                <Calendar size={36} variant="Bulk" />
                            </Avatar>
                            <Box sx={{
                                position: 'absolute',
                                bottom: 4,
                                right: -4,
                                bgcolor: 'white',
                                borderRadius: '50%',
                                p: 0.3,
                                boxShadow: theme.shadows[1]
                            }}>
                                <TickCircle size={20} color={theme.palette.success.main} variant="Bold" />
                            </Box>
                        </Box>

                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: theme.palette.info.dark, mb: 0.5, letterSpacing: '-0.5px' }}>
                                <FormattedMessage id="dashboard.attendance.time_to_rest" />
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500, maxWidth: 400, mx: 'auto', mb: 1.5 }}>
                                <FormattedMessage
                                    id="dashboard.attendance.on_leave"
                                    values={{
                                        status: <span style={{ color: theme.palette.info.main, fontWeight: 700 }}>
                                            {todayAttendance.status === 'sick' ? intl.formatMessage({ id: 'Sick Leave' }) : intl.formatMessage({ id: 'Permit' })}
                                        </span>
                                    }}
                                />
                            </Typography>
                            <Chip
                                label={intl.formatMessage({ id: "Attendance Auto-Recorded" })}
                                color="info"
                                variant="outlined"
                                size="small"
                                sx={{
                                    fontWeight: 700,
                                    bgcolor: '#fff',
                                    borderWidth: 2,
                                    px: 1,
                                    height: 32,
                                    borderRadius: 10,
                                    fontSize: '0.75rem'
                                }}
                            />
                        </Box>

                        <Alert severity="info" icon={<DirectNotification size={18} />}>
                            <FormattedMessage id="No check-in or check-out required today." />
                        </Alert>

                        <Box sx={{ width: '100%', mt: 2, pt: 2, borderTop: `1px dashed ${alpha(theme.palette.divider, 0.6)}` }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Timer1 size={18} variant="Bold" color={theme.palette.info.main} />
                                <FormattedMessage id="Recent Requests" />
                            </Typography>
                            <ParticipantLeaveHistory userId={userId} />
                        </Box>
                    </Stack>
                </Box>
            ) : !checkedIn ? (
                <Stack spacing={2}>
                    {isPending && (
                        <Alert severity="info" icon={<Timer1 size={20} />}>
                            <FormattedMessage id="dashboard.attendance.pending_approval" />
                        </Alert>
                    )}

                    {isRejected && (
                        <Alert severity="error" icon={<CloseCircle size={20} />}>
                            <FormattedMessage
                                id="dashboard.attendance.rejected"
                                values={{ reason: latestRequest?.notes || intl.formatMessage({ id: "Please provide a valid reason or move closer to the area." }) }}
                            />
                        </Alert>
                    )}

                    {!isPending && !isRejected && isOutOfArea && (
                        <Alert severity="warning" icon={<Location size={20} />}>
                            <FormattedMessage id="dashboard.attendance.out_area_warning" />
                        </Alert>
                    )}

                    {isPastAbsent && (
                        <Alert severity="error" icon={<CloseCircle size={20} />}>
                            <FormattedMessage id="dashboard.attendance.late_warning" values={{ time: locationSettings?.absent_threshold_time }} />
                        </Alert>
                    )}

                    <Typography variant="body2" color="textSecondary">
                        {isOutOfArea
                            ? intl.formatMessage({ id: "You are currently outside the designated check-in area. Please move closer or submit an out-area request." })
                            : isPastAbsent
                                ? intl.formatMessage({ id: "You are within the area but it is very late. If you check in now, your status will be recorded as 'Absent'." })
                                : intl.formatMessage({ id: "You are within the check-in area. Please record your attendance for today." })}
                    </Typography>
                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        color={isPastAbsent || (isRejected && isOutOfArea) ? "error" : "primary"}
                        startIcon={isRejected && isOutOfArea ? <CloseCircle /> : <Timer1 />}
                        onClick={handleCheckIn}
                        disabled={checkInMutationPending || isPending}
                    >
                        {checkInMutationPending
                            ? intl.formatMessage({ id: 'Processing...' })
                            : isPending
                                ? intl.formatMessage({ id: 'Waiting Approval...' })
                                : isRejected && isOutOfArea
                                    ? intl.formatMessage({ id: 'Resubmit Out-Area Request' })
                                    : isPastAbsent
                                        ? intl.formatMessage({ id: 'Check In as Absent' })
                                        : intl.formatMessage({ id: 'dashboard.attendance.checkin' })}
                    </Button>

                    {isOutOfArea && !isRejected && (
                        <Button
                            variant="outlined"
                            fullWidth
                            color="secondary"
                            onClick={() => setOutAreaDialogOpen(true)}
                            disabled={isPending}
                        >
                            <FormattedMessage id="dashboard.attendance.out_area_request" />
                        </Button>
                    )}

                    <Button
                        variant="outlined"
                        fullWidth
                        color="info"
                        startIcon={<Calendar />}
                        onClick={() => setLeaveDialogOpen(true)}
                        sx={{ mt: 1 }}
                    >
                        <FormattedMessage id="dashboard.attendance.leave_request" />
                    </Button>

                    {/* Leave History Section */}
                    <ParticipantLeaveHistory userId={userId} />

                    <MainCard sx={{ mt: 3, border: `1px dashed ${theme.palette.primary.main}`, bgcolor: alpha(theme.palette.primary.lighter, 0.1) }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar sx={{ bgcolor: theme.palette.primary.lighter, color: theme.palette.primary.main }}>
                                <Award variant="Bold" />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                    <FormattedMessage id="Completion Certificate" />
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    <FormattedMessage id="Download when finished" />
                                </Typography>
                            </Box>
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={onCheckCertificate}
                                disabled={certLoading}
                            >
                                {certLoading ? <CircularProgress size={16} /> : intl.formatMessage({ id: 'Check' })}
                            </Button>
                        </Stack>
                    </MainCard>
                </Stack>
            ) : !checkedOut ? (
                <Stack spacing={2}>
                    <Alert severity="success" icon={<DirectNotification />}>
                        <FormattedMessage id="Checked in at" /> {formatTime(todayAttendance?.check_in_time)}
                    </Alert>
                    <Typography variant="subtitle2">
                        <FormattedMessage id="dashboard.attendance.activity_plan" />
                    </Typography>
                    <textarea
                        value={activityPlan}
                        onChange={(e) => setActivityPlan(e.target.value)}
                        placeholder={intl.formatMessage({ id: "dashboard.attendance.activity_placeholder" })}
                        style={{
                            width: '100%',
                            minHeight: 100,
                            padding: 12,
                            borderRadius: 8,
                            border: `1px solid ${theme.palette.divider}`,
                            fontFamily: 'inherit',
                            fontSize: '0.875rem'
                        }}
                    />

                    <Typography variant="subtitle2">
                        <FormattedMessage id="dashboard.attendance.evidence_photo" />
                    </Typography>
                    {!attendancePhoto ? (
                        <Box
                            sx={{
                                border: `2px dashed ${theme.palette.divider}`,
                                borderRadius: 2,
                                p: 3,
                                textAlign: 'center',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05), borderColor: theme.palette.primary.main }
                            }}
                            onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*';
                                input.onchange = (e: any) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (readerEvent) => {
                                            setAttendancePhoto(readerEvent.target?.result as string);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                };
                                input.click();
                            }}
                        >
                            <GalleryAdd size={32} style={{ opacity: 0.5, marginBottom: 8 }} />
                            <Typography variant="caption" display="block" color="textSecondary">
                                <FormattedMessage id="dashboard.attendance.click_upload" />
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', height: 150 }}>
                            <img
                                src={attendancePhoto}
                                alt="Attendance evidence"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <IconButton
                                size="small"
                                sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: '#fff' } }}
                                onClick={() => setAttendancePhoto(null)}
                            >
                                <Trash size={16} color={theme.palette.error.main} />
                            </IconButton>
                        </Box>
                    )}
                    <Button
                        variant="contained"
                        color="error"
                        fullWidth
                        size="large"
                        onClick={handleCheckOut}
                        disabled={checkOutMutationPending}
                    >
                        {checkOutMutationPending ? intl.formatMessage({ id: 'Processing...' }) : intl.formatMessage({ id: 'dashboard.attendance.checkout' })}
                    </Button>
                </Stack>
            ) : (
                <Stack spacing={2} alignItems="center" sx={{ py: 2 }}>
                    <Avatar sx={{ width: 64, height: 64, bgcolor: theme.palette.success.lighter, color: theme.palette.success.main, mb: 1 }}>
                        <Calendar variant="Bold" />
                    </Avatar>
                    <Typography variant="h5">
                        <FormattedMessage id="dashboard.attendance.all_done" />
                    </Typography>
                    <Typography variant="body2" color="textSecondary" textAlign="center">
                        <FormattedMessage id="dashboard.attendance.completed_msg" />
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ width: '100%', mt: 1 }}>
                        <Box sx={{ flex: 1, p: 2, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}>
                            <Typography variant="caption" color="textSecondary">IN</Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{formatTime(todayAttendance?.check_in_time)}</Typography>
                        </Box>
                        <Box sx={{ flex: 1, p: 2, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}>
                            <Typography variant="caption" color="textSecondary">OUT</Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{formatTime(todayAttendance?.check_out_time)}</Typography>
                        </Box>
                    </Stack>
                </Stack>
            )}
        </MainCard>
    );
};

export default TodayAttendanceActionCard;
