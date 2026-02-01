'use client';

import React from 'react';
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
    CircularProgress,
    Avatar,
    Stack,
    Chip
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { formatDate, formatTime } from 'utils/format';
import { NoteText } from 'iconsax-react';

interface AttendanceReportTableProps {
    filteredAttendances: any[];
    isLoading: boolean;
}

const AttendanceReportTable = ({ filteredAttendances, isLoading }: AttendanceReportTableProps) => {
    const theme = useTheme();

    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case 'present':
                return {
                    color: theme.palette.success.main,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    label: 'PRESENT'
                };
            case 'late':
                return {
                    color: theme.palette.warning.main,
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    label: 'LATE'
                };
            case 'absent':
                return {
                    color: theme.palette.error.main,
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    label: 'ABSENT'
                };
            case 'permit':
            case 'sick':
                return {
                    color: theme.palette.info.main,
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    label: status.toUpperCase()
                };
            default:
                return {
                    color: theme.palette.grey[600],
                    bgcolor: alpha(theme.palette.grey[600], 0.1),
                    label: status.toUpperCase()
                };
        }
    };

    return (
        <TableContainer component={Paper} elevation={0} sx={{
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: 4,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflow: 'hidden',
            boxShadow: `0 8px 24px -12px rgba(0,0,0,0.1)`,
            '&:hover': {
                boxShadow: `0 20px 40px -20px rgba(0,0,0,0.15)`,
                borderColor: alpha(theme.palette.primary.main, 0.2),
            }
        }}>
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <Stack spacing={2} alignItems="center">
                        <CircularProgress size={40} thickness={4} color="primary" />
                        <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>Generating analytics...</Typography>
                    </Stack>
                </Box>
            ) : (
                <Table sx={{
                    minWidth: 900,
                    '@media print': {
                        borderCollapse: 'collapse',
                        width: '100%',
                        '& th, & td': {
                            border: '1px solid #ddd !important',
                            padding: '8px 6px !important',
                            fontSize: '10px !important'
                        }
                    }
                }}>
                    <TableHead sx={{
                        bgcolor: alpha(theme.palette.grey[50], 0.5),
                        borderBottom: `2px solid ${theme.palette.divider}`
                    }}>
                        <TableRow>
                            <TableCell align="center" sx={{ width: 60, py: 2, fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>NO</TableCell>
                            <TableCell sx={{ py: 2, fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>INTERN NAME</TableCell>
                            <TableCell align="center" sx={{ py: 2, fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>DATE</TableCell>
                            <TableCell align="center" sx={{ py: 2, fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>TIME LOG</TableCell>
                            <TableCell align="center" sx={{ py: 2, fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>STATUS</TableCell>
                            <TableCell sx={{ py: 2, fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>REMARKS / ACTIVITY</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredAttendances.length > 0 ? (
                            filteredAttendances.map((row, index) => {
                                const statusStyle = getStatusStyles(row.status);
                                return (
                                    <TableRow
                                        key={row.id}
                                        sx={{
                                            transition: 'background-color 0.2s',
                                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                                            '@media print': { breakInside: 'avoid' }
                                        }}
                                    >
                                        <TableCell align="center">
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.disabled' }}>
                                                {(index + 1).toString().padStart(2, '0')}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Avatar
                                                    sx={{
                                                        width: 38,
                                                        height: 38,
                                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                        color: theme.palette.primary.main,
                                                        fontWeight: 700,
                                                        fontSize: '0.9rem',
                                                        border: `2px solid #fff`,
                                                        boxShadow: `0 2px 8px rgba(0,0,0,0.05)`
                                                    }}
                                                >
                                                    {row.user?.name?.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                                                        {row.user?.name}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                                        {row.user?.email || 'Registered Intern'}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>

                                        <TableCell align="center">
                                            <Stack alignItems="center">
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                                    {formatDate(row.date)}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem', fontWeight: 700 }}>
                                                    {new Date(row.date).toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()}
                                                </Typography>
                                            </Stack>
                                        </TableCell>

                                        <TableCell align="center">
                                            <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                                                <Box sx={{
                                                    px: 1, py: 0.5, borderRadius: 1.5,
                                                    bgcolor: alpha(theme.palette.success.main, 0.05),
                                                    border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
                                                }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.success.dark }}>
                                                        {formatTime(row.check_in_time)}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="caption" color="text.disabled">-</Typography>
                                                <Box sx={{
                                                    px: 1, py: 0.5, borderRadius: 1.5,
                                                    bgcolor: alpha(theme.palette.error.main, 0.05),
                                                    border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`
                                                }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.error.dark }}>
                                                        {formatTime(row.check_out_time)}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>

                                        <TableCell align="center">
                                            <Chip
                                                label={statusStyle.label}
                                                size="small"
                                                sx={{
                                                    fontWeight: 800,
                                                    fontSize: '0.65rem',
                                                    color: statusStyle.color,
                                                    bgcolor: statusStyle.bgcolor,
                                                    borderRadius: 1.5,
                                                    height: 24,
                                                    border: `1px solid ${alpha(statusStyle.color, 0.2)}`,
                                                    '& .MuiChip-label': { px: 1.5 }
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <Box sx={{
                                                p: 1.5,
                                                bgcolor: alpha(theme.palette.grey[500], 0.03),
                                                borderRadius: 2,
                                                border: `1px dashed ${alpha(theme.palette.divider, 0.5)}`,
                                                maxWidth: 300
                                            }}>
                                                <Typography variant="caption" sx={{
                                                    color: 'text.secondary',
                                                    lineHeight: 1.4,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    fontStyle: 'italic'
                                                }}>
                                                    {(() => {
                                                        try {
                                                            const act = JSON.parse(row.activity_description || '{}');
                                                            return act.plan || (row.activity_description?.startsWith('{') ? '-' : row.activity_description) || 'No daily report filed';
                                                        } catch (e) { return row.activity_description || 'No daily report filed'; }
                                                    })()}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                    <Stack spacing={1} alignItems="center">
                                        <NoteText size={48} variant="Bulk" color={theme.palette.divider} />
                                        <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 600 }}>No Attendance Data</Typography>
                                        <Typography variant="caption" color="textDisabled">Try adjusting your filters to see more results.</Typography>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            )}
        </TableContainer>
    );
};

export default AttendanceReportTable;
