'use client';

import React from 'react';
import {
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Button,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parseISO } from 'date-fns';
import { useTheme } from '@mui/material/styles';
import MainCard from 'components/MainCard';

interface AttendanceFilterProps {
    startDate: string;
    setStartDate: (date: string) => void;
    endDate: string;
    setEndDate: (date: string) => void;
    unitFilter: string;
    setUnitFilter: (unit: string) => void;
    unitsData: any;
    filteredCount: number;
    totalCount: number;
    statusFilter: string | null;
    setStatusFilter: (status: string | null) => void;
}

const AttendanceFilter = ({
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    unitFilter,
    setUnitFilter,
    unitsData,
    filteredCount,
    totalCount,
    statusFilter,
    setStatusFilter
}: AttendanceFilterProps) => {
    const theme = useTheme();

    return (
        <MainCard border={false} shadow={theme.customShadows.z1} sx={{ mb: 3, '@media print': { display: 'none' } }}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Start Date"
                            value={parseISO(startDate)}
                            onChange={(date) => date && setStartDate(format(date, 'yyyy-MM-dd'))}
                            slotProps={{ textField: { size: 'small', fullWidth: true } }}
                        />
                    </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="End Date"
                            value={parseISO(endDate)}
                            onChange={(date) => date && setEndDate(format(date, 'yyyy-MM-dd'))}
                            slotProps={{ textField: { size: 'small', fullWidth: true } }}
                        />
                    </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <FormControl size="small" fullWidth>
                        <InputLabel>Unit / Department</InputLabel>
                        <Select
                            value={unitFilter}
                            label="Unit / Department"
                            onChange={(e) => setUnitFilter(e.target.value)}
                        >
                            <MenuItem value="all">All Units</MenuItem>
                            {unitsData?.units?.map((unit: any) => (
                                <MenuItem key={unit.id} value={unit.id}>{unit.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                    <Typography variant="caption" color="textSecondary" sx={{ mb: 0.5, display: 'block' }}>
                        Showing: {filteredCount} of {totalCount} records
                    </Typography>
                    {statusFilter && (
                        <Button size="small" color="error" onClick={() => setStatusFilter(null)}>
                            Clear Filter
                        </Button>
                    )}
                </Grid>
            </Grid>
        </MainCard>
    );
};

export default AttendanceFilter;
