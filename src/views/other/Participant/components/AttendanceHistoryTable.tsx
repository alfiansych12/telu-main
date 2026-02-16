'use client';

import React from 'react';
import {
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    TablePagination,
    Box
} from '@mui/material';

import { useTheme } from '@mui/material/styles';
import MainCard from 'components/MainCard';
import { formatDate, formatTime } from 'utils/format';

import { FormattedMessage, useIntl } from 'react-intl';

interface AttendanceHistoryTableProps {
    attendances: any[];
    getStatusColor: (status: any) => 'success' | 'warning' | 'error' | 'default' | 'info';
}

const AttendanceHistoryTable = ({ attendances, getStatusColor }: AttendanceHistoryTableProps) => {
    const theme = useTheme();
    const intl = useIntl();
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedAttendances = attendances?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) || [];

    const translateStatus = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'present': return <FormattedMessage id="Present" />;
            case 'absent': return <FormattedMessage id="Absent" />;
            case 'late': return <FormattedMessage id="Late" />;
            case 'sick': return <FormattedMessage id="Sick" />;
            case 'permit': return <FormattedMessage id="Permit" />;
            default: return status;
        }
    };

    return (
        <MainCard title={intl.formatMessage({ id: "Attendance History" })} content={false}>
            <TableContainer component={Paper} elevation={0} sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 0,
                overflow: 'auto'
            }}>

                <Table>
                    <TableHead sx={{ bgcolor: theme.palette.grey[50] }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}><FormattedMessage id="Date" /></TableCell>
                            <TableCell sx={{ fontWeight: 600 }}><FormattedMessage id="Check In" /></TableCell>
                            <TableCell sx={{ fontWeight: 600 }}><FormattedMessage id="Check Out" /></TableCell>
                            <TableCell sx={{ fontWeight: 600 }}><FormattedMessage id="Status" /></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedAttendances.map((record) => {
                            const isForgotCheckOut = !!record.check_in_time && !record.check_out_time && formatDate(record.date) !== formatDate(new Date());

                            return (
                                <TableRow key={record.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{formatDate(record.date)}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{formatTime(record.check_in_time)}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {isForgotCheckOut ? (
                                                <Typography variant="caption" color="error" sx={{ fontWeight: 700 }}>
                                                    MISSING
                                                </Typography>
                                            ) : (
                                                formatTime(record.check_out_time)
                                            )}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={isForgotCheckOut ? <FormattedMessage id="dashboard.attendance.forgot_checkout" /> : translateStatus(record.status)}
                                            size="small"
                                            color={isForgotCheckOut ? 'error' : getStatusColor(record.status)}
                                            sx={{ textTransform: 'capitalize', fontWeight: 600, px: 1, height: 24 }}
                                        />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {(!attendances || attendances.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body2" color="textSecondary">
                                        <FormattedMessage id="No attendance history found" />
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            {attendances && attendances.length > 0 && (
                <Box sx={{ p: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <TablePagination
                        component="div"
                        count={attendances.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25]}
                    />
                </Box>
            )}
        </MainCard>
    );
};

export default AttendanceHistoryTable;
