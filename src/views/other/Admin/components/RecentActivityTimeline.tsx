'use client';

import React from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Avatar,
    Chip,
    Stack,
    MenuItem,
    TextField
} from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot
} from '@mui/lab';
import { useTheme, alpha } from '@mui/material/styles';
import { Clock, Activity } from 'iconsax-react';
import { motion, AnimatePresence } from 'framer-motion';
import MainCard from 'components/MainCard';
import { formatTime } from 'utils/format';

interface RecentActivityTimelineProps {
    recentAttendances: any[];
    isLoading: boolean;
    getStatusColor: (status: string) => string;
    getStatusBg: (status: string) => string;
    getStatusIcon: (status: string) => React.ReactNode;
    pageSize: number;
    setPageSize: (size: number) => void;
}

const RecentActivityTimeline = ({
    recentAttendances,
    isLoading,
    getStatusColor,
    getStatusBg,
    getStatusIcon,
    pageSize,
    setPageSize
}: RecentActivityTimelineProps) => {
    const theme = useTheme();
    const intl = useIntl();

    return (
        <MainCard
            title={
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                        <Activity size={20} color={theme.palette.primary.main} variant="Bulk" />
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            <FormattedMessage id="admin.dashboard.attendance_activity" />
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="caption" color="textSecondary">Rows:</Typography>
                        <TextField
                            select
                            size="small"
                            value={pageSize}
                            onChange={(e) => setPageSize(Number(e.target.value))}
                            sx={{
                                width: 70,
                                '& .MuiOutlinedInput-root': {
                                    height: 30,
                                    fontSize: '0.875rem'
                                }
                            }}
                        >
                            <MenuItem value={5}>5</MenuItem>
                            <MenuItem value={10}>10</MenuItem>
                            <MenuItem value={25}>25</MenuItem>
                        </TextField>
                    </Stack>
                </Stack>
            }
            sx={{
                overflow: 'visible',
                '& .MuiCardContent-root': {
                    p: 2.5
                }
            }}
        >
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                    <CircularProgress size={32} thickness={5} sx={{ color: theme.palette.primary.main }} />
                </Box>
            ) : (
                <Timeline
                    sx={{
                        m: 0,
                        p: 0,
                        [`& .MuiTimelineItem-root:before`]: {
                            flex: 0,
                            padding: 0,
                        },
                    }}
                >
                    <AnimatePresence>
                        {recentAttendances.map((attendance, index) => (
                            <motion.div
                                key={attendance.id || index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <TimelineItem
                                    sx={{
                                        '&:hover': {
                                            '& .activity-card': {
                                                bgcolor: alpha(theme.palette.primary.lighter, 0.3),
                                                transform: 'translateX(8px) scale(1.02)',
                                                boxShadow: `0 4px 16px -2px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)'}, 
                                                            0 8px 24px -4px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)'}, 
                                                            0 0 0 1px ${alpha(theme.palette.primary.main, 0.15)}`,
                                                borderColor: alpha(theme.palette.primary.main, 0.3),
                                            },
                                        },
                                    }}
                                >
                                    <TimelineSeparator>
                                        <TimelineDot
                                            sx={{
                                                p: 0,
                                                m: 0,
                                                boxShadow: 'none',
                                                bgcolor: 'transparent',
                                                border: 'none',
                                            }}
                                        >
                                            <Avatar
                                                src={attendance.user?.photo || undefined}
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    bgcolor: attendance.user?.photo
                                                        ? 'transparent'
                                                        : alpha(getStatusColor(attendance.status), 0.1),
                                                    color: getStatusColor(attendance.status),
                                                    border: `3px solid ${theme.palette.background.paper}`,
                                                    boxShadow: `0 0 0 2px ${getStatusColor(attendance.status)}40, 
                                                                0 4px 12px -2px ${alpha(getStatusColor(attendance.status), 0.3)}`,
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    fontSize: '1rem',
                                                    fontWeight: 700,
                                                    position: 'relative',
                                                    '&::before': attendance.user?.photo ? {
                                                        content: '""',
                                                        position: 'absolute',
                                                        inset: 0,
                                                        borderRadius: '50%',
                                                        background: `linear-gradient(135deg, ${alpha(getStatusColor(attendance.status), 0.1)} 0%, transparent 100%)`,
                                                        pointerEvents: 'none'
                                                    } : {},
                                                    '&:hover': {
                                                        transform: 'scale(1.1)',
                                                        boxShadow: `0 0 0 3px ${getStatusColor(attendance.status)}60, 
                                                                    0 6px 16px -2px ${alpha(getStatusColor(attendance.status), 0.4)}`
                                                    }
                                                }}
                                            >
                                                {!attendance.user?.photo && (attendance.user?.name?.charAt(0).toUpperCase() || 'U')}
                                            </Avatar>
                                        </TimelineDot>
                                        {index !== recentAttendances.length - 1 && (
                                            <TimelineConnector sx={{ bgcolor: theme.palette.divider, width: 2, my: 0.5 }} />
                                        )}
                                    </TimelineSeparator>
                                    <TimelineContent sx={{ pr: 0, pb: 2, pt: 0.5 }}>
                                        <Box
                                            className="activity-card"
                                            sx={{
                                                p: 2,
                                                ml: 1.5,
                                                borderRadius: 2.5,
                                                border: `1px solid ${theme.palette.divider}`,
                                                bgcolor: theme.palette.background.paper,
                                                // Enhanced shadow for depth
                                                boxShadow: `0 2px 8px -2px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.06)'}, 
                                                            0 4px 12px -4px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.04)'}`,
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                position: 'relative',
                                                // Subtle gradient overlay
                                                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.mode === 'dark'
                                                    ? 'rgba(255,255,255,0.01)'
                                                    : 'rgba(0,0,0,0.005)'
                                                    } 100%)`,
                                            }}
                                        >
                                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                                                <Stack spacing={0.5}>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                                                        {attendance.user?.name || intl.formatMessage({ id: 'Unknown User' })}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <Clock size={12} />
                                                        <FormattedMessage id="monitoring.checked_in_at" values={{ time: formatTime(attendance.check_in_time) }} />
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 500 }}>
                                                        {attendance.user?.unit?.name || intl.formatMessage({ id: 'General' })}
                                                    </Typography>
                                                </Stack>
                                                <Chip
                                                    icon={getStatusIcon(attendance.status || '') as any}
                                                    label={intl.formatMessage({ id: attendance.status || 'Unknown' })}
                                                    size="small"
                                                    sx={{
                                                        height: 26,
                                                        fontSize: '0.7rem',
                                                        fontWeight: 800,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        borderRadius: '8px',
                                                        bgcolor: getStatusBg(attendance.status),
                                                        color: getStatusColor(attendance.status),
                                                        border: `1.5px solid ${alpha(getStatusColor(attendance.status), 0.3)}`,
                                                        boxShadow: `0 2px 8px -2px ${alpha(getStatusColor(attendance.status), 0.3)}, 
                                                                    inset 0 1px 0 ${alpha('#fff', 0.1)}`,
                                                        background: `linear-gradient(135deg, ${getStatusBg(attendance.status)} 0%, ${alpha(getStatusColor(attendance.status), 0.15)} 100%)`,
                                                        transition: 'all 0.2s',
                                                        '& .MuiChip-label': {
                                                            px: 1.5,
                                                            py: 0.25
                                                        },
                                                        '& .MuiChip-icon': {
                                                            fontSize: '16px',
                                                            ml: '6px',
                                                            color: 'inherit',
                                                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                                                        },
                                                        '&:hover': {
                                                            transform: 'scale(1.05)',
                                                            boxShadow: `0 4px 12px -2px ${alpha(getStatusColor(attendance.status), 0.4)}`
                                                        }
                                                    }}
                                                />
                                            </Stack>
                                        </Box>
                                    </TimelineContent>
                                </TimelineItem>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {recentAttendances.length === 0 && (
                        <Box sx={{ py: 6, textAlign: 'center' }}>
                            <Stack spacing={1} alignItems="center">
                                <Box sx={{ p: 2, borderRadius: '50%', bgcolor: theme.palette.grey[50] }}>
                                    <Activity size={32} color={theme.palette.grey[400]} />
                                </Box>
                                <Typography variant="body1" color="textSecondary" sx={{ fontWeight: 500 }}>
                                    <FormattedMessage id="admin.dashboard.no_activity" />
                                </Typography>
                            </Stack>
                        </Box>
                    )}
                </Timeline>
            )}
        </MainCard>
    );
};

export default RecentActivityTimeline;
