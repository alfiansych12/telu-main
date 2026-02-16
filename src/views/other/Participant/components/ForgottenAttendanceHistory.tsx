'use client';

import React, { useMemo } from 'react';
import {
    Typography,
    Box,
    Stack,
    Avatar,
    Chip
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { CalendarRemove, Clock, TickCircle, ArrowRight2 } from 'iconsax-react';
import MainCard from 'components/MainCard';
import { formatInJakarta } from 'utils/date-tz';
import { FormattedMessage, useIntl } from 'react-intl';
import { AttendanceWithRelations } from 'types/api';
import SimpleBar from 'components/third-party/SimpleBar';

interface ForgottenAttendanceHistoryProps {
    attendances: AttendanceWithRelations[];
}

const ForgottenAttendanceHistory = ({ attendances }: ForgottenAttendanceHistoryProps) => {
    const theme = useTheme();
    const intl = useIntl();
    const today = formatInJakarta(new Date(), 'yyyy-MM-dd');

    const forgottenDates = useMemo(() => {
        if (!attendances) return [];

        return attendances.filter((a) => {
            const attDate = formatInJakarta(a.date, 'yyyy-MM-dd');

            // Skip today
            if (attDate === today) return false;

            // Condition 1: Absent (Synthesized or real)
            if (a.status === 'absent') return true;

            // Condition 2: Forgot Check-out (Has check-in but no check-out)
            const hasCheckIn = !!a.check_in_time;
            const hasCheckOut = !!a.check_out_time;

            if (hasCheckIn && !hasCheckOut) return true;

            return false;
        }).slice(0, 5); // Show only top 5 recent forgotten dates
    }, [attendances, today]);

    if (forgottenDates.length === 0) {
        return (
            <MainCard
                sx={{
                    bgcolor: alpha(theme.palette.success.lighter, 0.2),
                    border: `1px solid ${alpha(theme.palette.success.light, 0.4)}`
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: theme.palette.success.main, color: '#fff', width: 32, height: 32 }}>
                        <TickCircle size={20} variant="Bold" />
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            <FormattedMessage id="dashboard.attendance.forgotten_empty" />
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            <FormattedMessage id="dashboard.attendance.forgotten_empty_msg" defaultMessage="Jaga kedisiplinan Anda, semua catatan kehadiran lengkap!" />
                        </Typography>
                    </Box>
                </Stack>
            </MainCard>
        );
    }

    return (
        <MainCard
            title={intl.formatMessage({ id: 'dashboard.attendance.forgotten_history' })}
            secondary={
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" color="error" sx={{ fontWeight: 700 }}>
                        {forgottenDates.length} <FormattedMessage id="Days" defaultMessage="Hari" />
                    </Typography>
                    <ArrowRight2 size={14} />
                </Stack>
            }
            content={false}
            sx={{
                overflow: 'hidden',
                '& .MuiCardHeader-root': { py: 1.5 }
            }}
        >
            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.error.lighter, 0.1) }}>
                <SimpleBar>
                    <Stack direction="row" spacing={2} sx={{ pb: 1.5, minWidth: 'max-content' }}>
                        {forgottenDates.map((item) => {
                            const isForgotCheckOut = !!item.check_in_time && !item.check_out_time;
                            const d = new Date(item.date);
                            const dayName = formatInJakarta(d, 'EEE').toUpperCase();
                            const dayNum = formatInJakarta(d, 'dd');
                            const monthYear = formatInJakarta(d, 'MMM yy');

                            return (
                                <Box
                                    key={item.id}
                                    sx={{
                                        width: 140,
                                        p: 1.5,
                                        borderRadius: 3,
                                        bgcolor: '#fff',
                                        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                                        position: 'relative',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: theme.customShadows.z1,
                                            borderColor: isForgotCheckOut ? theme.palette.warning.main : theme.palette.error.main,
                                        }
                                    }}
                                >
                                    <Stack spacing={1} alignItems="center">
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled', letterSpacing: 1 }}>
                                            {dayName}
                                        </Typography>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1, color: isForgotCheckOut ? theme.palette.warning.dark : theme.palette.error.dark }}>
                                                {dayNum}
                                            </Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.65rem' }}>
                                                {monthYear}
                                            </Typography>
                                        </Box>

                                        <Chip
                                            label={isForgotCheckOut ? 'MISSING OUT' : 'ABSENT'}
                                            size="small"
                                            sx={{
                                                height: 20,
                                                fontSize: '0.6rem',
                                                fontWeight: 800,
                                                bgcolor: isForgotCheckOut ? alpha(theme.palette.warning.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                                                color: isForgotCheckOut ? theme.palette.warning.dark : theme.palette.error.dark,
                                                border: 'none'
                                            }}
                                        />

                                        {isForgotCheckOut ? (
                                            <Clock size={16} variant="Bold" color={theme.palette.warning.main} />
                                        ) : (
                                            <CalendarRemove size={16} variant="Bold" color={theme.palette.error.main} />
                                        )}
                                    </Stack>
                                </Box>
                            );
                        })}
                    </Stack>
                </SimpleBar>
            </Box>
        </MainCard>
    );
};

export default ForgottenAttendanceHistory;
