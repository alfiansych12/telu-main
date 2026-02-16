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
    alpha,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    TablePagination
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
import { formatTime } from 'utils/format';
import { FormattedMessage } from 'react-intl';

interface AttendanceHistoryCardProps {
    attendances: AttendanceWithRelations[];
    onRequestLeave?: (date: Date) => void;
}

const AttendanceHistoryCard = ({ attendances, onRequestLeave }: AttendanceHistoryCardProps) => {
    const theme = useTheme();
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

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
                    <Tooltip title="Calendar View">
                        <IconButton
                            size="small"
                            onClick={() => setViewMode('calendar')}
                            sx={{
                                bgcolor: viewMode === 'calendar' ? alpha(theme.palette.error.main, 0.1) : 'transparent',
                                color: viewMode === 'calendar' ? theme.palette.error.main : theme.palette.grey[500],
                                borderRadius: 1.5,
                                border: viewMode === 'calendar' ? `1px solid ${alpha(theme.palette.error.main, 0.2)}` : 'none'
                            }}
                        >
                            <Calendar size={18} variant={viewMode === 'calendar' ? "Bold" : "Outline"} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="List View">
                        <IconButton
                            size="small"
                            onClick={() => setViewMode('list')}
                            sx={{
                                bgcolor: viewMode === 'list' ? alpha(theme.palette.error.main, 0.1) : 'transparent',
                                color: viewMode === 'list' ? theme.palette.error.main : theme.palette.grey[500],
                                borderRadius: 1.5,
                                border: viewMode === 'list' ? `1px solid ${alpha(theme.palette.error.main, 0.2)}` : 'none'
                            }}
                        >
                            <Menu size={18} variant={viewMode === 'list' ? "Bold" : "Outline"} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            }
        >
            {viewMode === 'calendar' ? (
                <Box sx={{ p: 3 }}>
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

                    <Grid container spacing={1} sx={{ mb: 1 }}>
                        {days.map((day) => (
                            <Grid item xs={12 / 7} key={day} sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    {day}
                                </Typography>
                            </Grid>
                        ))}
                    </Grid>

                    <Grid container spacing={1}>
                        {calendarDays.map((date, index) => {
                            const isToday = isSameDay(date, new Date());
                            const isCurrentMonth = isSameMonth(date, currentMonth);
                            const attInfo = getAttendanceStatus(date);

                            return (
                                <Grid item xs={12 / 7} key={index}>
                                    <Box
                                        onClick={() => onRequestLeave?.(date)}
                                        sx={{
                                            minHeight: 80,
                                            p: 1,
                                            borderRadius: 2.5,
                                            border: `1px solid ${isToday ? theme.palette.primary.main : alpha(theme.palette.divider, 0.5)}`,
                                            bgcolor: isCurrentMonth ? '#fff' : alpha(theme.palette.grey[50], 0.5),
                                            position: 'relative',
                                            cursor: 'pointer',
                                            transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&:hover': {
                                                boxShadow: theme.customShadows.z1,
                                                transform: 'translateY(-2px)',
                                                borderColor: theme.palette.primary.light,
                                                bgcolor: alpha(theme.palette.primary.lighter, 0.2)
                                            },
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontWeight: 800,
                                                color: isCurrentMonth ? 'text.primary' : 'text.disabled',
                                                fontSize: '0.7rem'
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
            ) : (
                <Box sx={{ p: 2 }}>
                    <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.8)}`, borderRadius: 3, overflow: 'hidden' }}>
                        <Table sx={{ minWidth: 450 }}>
                            <TableHead sx={{ bgcolor: alpha(theme.palette.grey[50], 0.8) }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 800, py: 1.5, borderRight: `1px solid ${alpha(theme.palette.divider, 0.5)}`, color: 'text.secondary', fontSize: '0.65rem', letterSpacing: 1 }}>DATE</TableCell>
                                    <TableCell sx={{ fontWeight: 800, py: 1.5, borderRight: `1px solid ${alpha(theme.palette.divider, 0.5)}`, color: 'text.secondary', fontSize: '0.65rem', letterSpacing: 1 }} align="center">CHECK IN</TableCell>
                                    <TableCell sx={{ fontWeight: 800, py: 1.5, borderRight: `1px solid ${alpha(theme.palette.divider, 0.5)}`, color: 'text.secondary', fontSize: '0.65rem', letterSpacing: 1 }} align="center">CHECK OUT</TableCell>
                                    <TableCell sx={{ fontWeight: 800, py: 1.5, color: 'text.secondary', fontSize: '0.65rem', letterSpacing: 1 }} align="center">STATUS</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {attendances.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                            <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
                                                <FormattedMessage id="No attendance history found" />
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    attendances.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((record) => {
                                        const isForgotCheckOut = !!record.check_in_time && !record.check_out_time && !isSameDay(new Date(record.date), new Date());
                                        return (
                                            <TableRow key={record.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                <TableCell sx={{ py: 1.5, fontWeight: 600 }}>
                                                    {format(new Date(record.date), 'dd MMM yyyy')}
                                                </TableCell>
                                                <TableCell align="center" sx={{ py: 1.5 }}>
                                                    {formatTime(record.check_in_time)}
                                                </TableCell>
                                                <TableCell align="center" sx={{ py: 1.5 }}>
                                                    {isForgotCheckOut ? (
                                                        <Typography variant="caption" color="error" sx={{ fontWeight: 800 }}>MISSING</Typography>
                                                    ) : (
                                                        formatTime(record.check_out_time)
                                                    )}
                                                </TableCell>
                                                <TableCell align="center" sx={{ py: 1.5 }}>
                                                    <Chip
                                                        label={isForgotCheckOut ? 'Lupa Checkout' : record.status}
                                                        size="small"
                                                        color={isForgotCheckOut ? 'error' : record.status === 'present' ? 'success' : record.status === 'late' ? 'warning' : 'error'}
                                                        sx={{ fontWeight: 700, textTransform: 'capitalize', px: 1 }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {attendances.length > 0 && (
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={attendances.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(e: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => setPage(newPage)}
                            onRowsPerPageChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                        />
                    )}
                </Box>
            )}
        </MainCard>
    );
};

export default AttendanceHistoryCard;
