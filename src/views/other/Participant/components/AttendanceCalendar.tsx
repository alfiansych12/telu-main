'use client';

import React, { useMemo, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Stack,
    IconButton,
    Tooltip,
    useTheme,
    alpha
} from '@mui/material';
import {
    ArrowLeft2,
    ArrowRight2,
    Calendar,
    Menu,
    CloseCircle,
    TickCircle,
    Clock
} from 'iconsax-react';
import MainCard from 'components/MainCard';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths
} from 'date-fns';
import { formatInJakarta } from 'utils/date-tz';
import { AttendanceWithRelations } from 'types/api';

interface AttendanceCalendarProps {
    attendances: AttendanceWithRelations[];
}

const AttendanceCalendar = ({ attendances }: AttendanceCalendarProps) => {
    const theme = useTheme();
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Calculate calendar days
    const calendarDays = useMemo(() => {
        const startMonth = startOfMonth(currentMonth);
        const endMonth = endOfMonth(startMonth);
        const startWeek = startOfWeek(startMonth);
        const endWeek = endOfWeek(endMonth);

        return eachDayOfInterval({
            start: startWeek,
            end: endWeek,
        });
    }, [currentMonth]);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const getAttendanceStatus = (date: Date) => {
        const attDateStr = format(date, 'yyyy-MM-dd');
        const record = attendances.find(a => formatInJakarta(a.date, 'yyyy-MM-dd') === attDateStr);

        if (!record) return null;

        // Check if it's a "forgot check-out" record
        const isForgotCheckOut = !!record.check_in_time && !record.check_out_time && !isSameDay(date, new Date());

        return {
            status: record.status,
            isForgotCheckOut,
            record
        };
    };

    return (
        <MainCard
            title="Attendance History"
            content={false}
            secondary={
                <Stack direction="row" spacing={1}>
                    <IconButton size="small" sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main, borderRadius: 1.5 }}>
                        <Calendar size={18} variant="Bold" />
                    </IconButton>
                    <IconButton size="small" sx={{ bgcolor: alpha(theme.palette.grey[200], 0.5), color: theme.palette.grey[500], borderRadius: 1.5 }}>
                        <Menu size={18} />
                    </IconButton>
                </Stack>
            }
        >
            <Box sx={{ p: 3 }}>
                {/* Calendar Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        {format(currentMonth, 'MMMM yyyy')}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <IconButton onClick={prevMonth} size="small" sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5 }}>
                            <ArrowLeft2 size={16} />
                        </IconButton>
                        <IconButton onClick={nextMonth} size="small" sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5 }}>
                            <ArrowRight2 size={16} />
                        </IconButton>
                    </Stack>
                </Stack>

                {/* Week Days */}
                <Grid container spacing={1} sx={{ mb: 1 }}>
                    {days.map((day) => (
                        <Grid item xs={12 / 7} key={day} sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                {day}
                            </Typography>
                        </Grid>
                    ))}
                </Grid>

                {/* Calendar Grid */}
                <Grid container spacing={1}>
                    {calendarDays.map((date, index) => {
                        const isToday = isSameDay(date, new Date());
                        const isCurrentMonth = isSameMonth(date, currentMonth);
                        const attInfo = getAttendanceStatus(date);

                        return (
                            <Grid item xs={12 / 7} key={index}>
                                <Box
                                    sx={{
                                        minHeight: 80,
                                        p: 1,
                                        borderRadius: 2.5,
                                        border: `1px solid ${isToday ? theme.palette.primary.main : alpha(theme.palette.divider, 0.5)}`,
                                        bgcolor: isCurrentMonth ? '#fff' : alpha(theme.palette.grey[50], 0.5),
                                        position: 'relative',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            boxShadow: theme.customShadows.z1,
                                            borderColor: theme.palette.primary.light
                                        },
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            fontWeight: 700,
                                            color: isCurrentMonth ? 'text.primary' : 'text.disabled',
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        {format(date, 'd')}
                                    </Typography>

                                    <Box sx={{ display: 'flex', justifyContent: 'center', pb: 1 }}>
                                        {attInfo && (
                                            <Tooltip title={`${attInfo.status?.toUpperCase() || ''}${attInfo.isForgotCheckOut ? ' (Forgot Check-out)' : ''}`}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    {attInfo.status === 'absent' || attInfo.isForgotCheckOut ? (
                                                        <>
                                                            <CloseCircle size={14} color={theme.palette.error.main} variant="Bold" />
                                                            <Typography variant="caption" sx={{ color: theme.palette.error.main, fontWeight: 800, fontSize: '0.65rem' }}>
                                                                Missed
                                                            </Typography>
                                                        </>
                                                    ) : attInfo.status === 'late' ? (
                                                        <Clock size={14} color={theme.palette.warning.main} variant="Bold" />
                                                    ) : (
                                                        <TickCircle size={14} color={theme.palette.success.main} variant="Bold" />
                                                    )}
                                                </Box>
                                            </Tooltip>
                                        )}
                                    </Box>
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>
        </MainCard>
    );
};

export default AttendanceCalendar;
