'use client';

import React from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Avatar,
    Chip,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    MenuItem,
    TextField
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { CalendarTick } from 'iconsax-react';
import MainCard from 'components/MainCard';
import { formatTime } from 'utils/format';
import { FormattedMessage, useIntl } from 'react-intl';

interface TodayAttendanceTableProps {
    todayAttendances: any[];
    isLoading: boolean;
    getStatusColor: (status: string) => string;
    getStatusBg: (status: string) => string;
    pageSize: number;
    setPageSize: (size: number) => void;
}

const TodayAttendanceTable = ({
    todayAttendances,
    isLoading,
    getStatusColor,
    getStatusBg,
    pageSize,
    setPageSize
}: TodayAttendanceTableProps) => {
    const theme = useTheme();
    const intl = useIntl();

    return (
        <MainCard
            title={
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                        <CalendarTick size={20} color={theme.palette.primary.main} variant="Bulk" />
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            <FormattedMessage id="admin.dashboard.attendance_today" />
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
                <TableContainer
                    sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 2.5,
                        overflow: 'hidden',
                        bgcolor: alpha(theme.palette.background.paper, 0.5),
                        // Enhanced shadow for depth
                        boxShadow: `0 2px 8px -2px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.06)'}, 
                                    0 4px 12px -4px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.04)'}`,
                        // Subtle gradient
                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.02)'
                            : 'rgba(0,0,0,0.01)'
                            } 100%)`,
                    }}
                >
                    <Table size="small">
                        <TableHead sx={{ bgcolor: theme.palette.grey[50] }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, py: 1.5 }}>
                                    <FormattedMessage id="User" />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, py: 1.5 }}>
                                    <FormattedMessage id="Time" />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, py: 1.5 }} align="right">
                                    <FormattedMessage id="Status" />
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {todayAttendances.map((attendance) => (
                                <TableRow
                                    key={attendance.id}
                                    hover
                                    sx={{
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        transition: 'background-color 0.2s',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <TableCell sx={{ py: 1.5 }}>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <Avatar
                                                src={attendance.user?.photo || undefined}
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    fontSize: '0.9rem',
                                                    bgcolor: attendance.user?.photo
                                                        ? 'transparent'
                                                        : alpha(theme.palette.primary.main, 0.1),
                                                    color: theme.palette.primary.main,
                                                    fontWeight: 700,
                                                    border: `2.5px solid ${theme.palette.background.paper}`,
                                                    boxShadow: `0 0 0 1.5px ${alpha(theme.palette.primary.main, 0.3)}, 
                                                                0 3px 8px -2px ${alpha(theme.palette.primary.main, 0.2)}`,
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    position: 'relative',
                                                    '&::before': attendance.user?.photo ? {
                                                        content: '""',
                                                        position: 'absolute',
                                                        inset: 0,
                                                        borderRadius: '50%',
                                                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 100%)`,
                                                        pointerEvents: 'none'
                                                    } : {},
                                                    '&:hover': {
                                                        transform: 'scale(1.15) rotate(5deg)',
                                                        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.5)}, 
                                                                    0 4px 12px -2px ${alpha(theme.palette.primary.main, 0.3)}`
                                                    }
                                                }}
                                            >
                                                {!attendance.user?.photo && (attendance.user?.name?.charAt(0).toUpperCase() || 'U')}
                                            </Avatar>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {attendance.user?.name || intl.formatMessage({ id: 'Unknown' })}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell sx={{ py: 1.5 }}>
                                        <Stack spacing={0.5}>
                                            <Box sx={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                                px: 1,
                                                py: 0.5,
                                                borderRadius: 1,
                                                bgcolor: alpha(theme.palette.success.main, 0.08),
                                                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                                width: 'fit-content'
                                            }}>
                                                <Typography variant="caption" sx={{
                                                    fontWeight: 700,
                                                    color: theme.palette.success.main,
                                                    fontSize: '0.7rem'
                                                }}>
                                                    IN:
                                                </Typography>
                                                <Typography variant="body2" sx={{
                                                    fontFamily: 'monospace',
                                                    fontWeight: 700,
                                                    color: theme.palette.success.dark,
                                                    fontSize: '0.8rem'
                                                }}>
                                                    {formatTime(attendance.check_in_time)}
                                                </Typography>
                                            </Box>
                                            {attendance.check_out_time && (
                                                <Box sx={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 0.5,
                                                    px: 1,
                                                    py: 0.5,
                                                    borderRadius: 1,
                                                    bgcolor: alpha(theme.palette.error.main, 0.08),
                                                    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                                                    width: 'fit-content'
                                                }}>
                                                    <Typography variant="caption" sx={{
                                                        fontWeight: 700,
                                                        color: theme.palette.error.main,
                                                        fontSize: '0.7rem'
                                                    }}>
                                                        OUT:
                                                    </Typography>
                                                    <Typography variant="body2" sx={{
                                                        fontFamily: 'monospace',
                                                        fontWeight: 700,
                                                        color: theme.palette.error.dark,
                                                        fontSize: '0.8rem'
                                                    }}>
                                                        {formatTime(attendance.check_out_time)}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Stack>
                                    </TableCell>
                                    <TableCell sx={{ py: 1.5 }} align="right">
                                        <Chip
                                            label={intl.formatMessage({ id: attendance.status || 'Unknown' })}
                                            size="small"
                                            sx={{
                                                height: 24,
                                                fontSize: '0.65rem',
                                                fontWeight: 900,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                borderRadius: '6px',
                                                bgcolor: getStatusBg(attendance.status),
                                                color: getStatusColor(attendance.status),
                                                border: `1.5px solid ${alpha(getStatusColor(attendance.status), 0.25)}`,
                                                boxShadow: `0 2px 6px -2px ${alpha(getStatusColor(attendance.status), 0.3)}, 
                                                            inset 0 1px 0 ${alpha('#fff', 0.1)}`,
                                                background: `linear-gradient(135deg, ${getStatusBg(attendance.status)} 0%, ${alpha(getStatusColor(attendance.status), 0.12)} 100%)`,
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    transform: 'scale(1.08)',
                                                    boxShadow: `0 4px 10px -2px ${alpha(getStatusColor(attendance.status), 0.4)}`
                                                }
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {todayAttendances.length === 0 && (
                        <Box sx={{ py: 6, textAlign: 'center' }}>
                            <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', fontWeight: 500 }}>
                                <FormattedMessage id="admin.dashboard.no_records" />
                            </Typography>
                        </Box>
                    )}
                </TableContainer>
            )}
        </MainCard>
    );
};

export default TodayAttendanceTable;
