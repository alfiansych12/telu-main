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
    Chip
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
        <MainCard title={intl.formatMessage({ id: "Attendance History" })}>
            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
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
                        {attendances?.map((record) => (
                            <TableRow key={record.id} hover>
                                <TableCell>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{formatDate(record.date)}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{formatTime(record.check_in_time)}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{formatTime(record.check_out_time)}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={translateStatus(record.status)}
                                        size="small"
                                        color={getStatusColor(record.status)}
                                        sx={{ textTransform: 'capitalize', fontWeight: 600, px: 1 }}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
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
        </MainCard>
    );
};

export default AttendanceHistoryTable;
