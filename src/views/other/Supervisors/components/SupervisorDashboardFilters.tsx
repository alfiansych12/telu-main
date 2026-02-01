'use client';

import React from 'react';
import {
    Box,
    Typography,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parseISO } from 'date-fns';
import { useTheme, alpha } from '@mui/material/styles';
import { CalendarSearch, Filter } from 'iconsax-react';

import { FormattedMessage, useIntl } from 'react-intl';

interface SupervisorDashboardFiltersProps {
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    selectedUnit: string;
    setSelectedUnit: (unit: string) => void;
    unitsData: any;
}

const SupervisorDashboardFilters = ({
    selectedDate,
    setSelectedDate,
    selectedUnit,
    setSelectedUnit,
    unitsData
}: SupervisorDashboardFiltersProps) => {
    const theme = useTheme();
    const intl = useIntl();

    return (
        <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                <FormattedMessage id="supervisor.dashboard.title" />
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', md: 'auto' } }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        label={intl.formatMessage({ id: "supervisor.dashboard.select_date" })}
                        value={selectedDate ? parseISO(selectedDate) : null}
                        onChange={(newValue) => {
                            if (newValue) {
                                setSelectedDate(format(newValue, 'yyyy-MM-dd'));
                            }
                        }}
                        slotProps={{
                            textField: {
                                size: 'small',
                                InputProps: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CalendarSearch size={18} color={theme.palette.primary.main} />
                                        </InputAdornment>
                                    ),
                                },
                                sx: {
                                    minWidth: { sm: 180 },
                                    bgcolor: 'white',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 3,
                                        boxShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.1)}`,
                                        bgcolor: alpha(theme.palette.primary.lighter, 0.1),
                                        '& fieldset': { borderColor: alpha(theme.palette.primary.main, 0.4) },
                                        '&:hover fieldset': { borderColor: alpha(theme.palette.primary.main, 0.6) },
                                        '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: 1 }
                                    },
                                    '& .MuiInputLabel-root': { color: theme.palette.primary.main, fontWeight: 500 },
                                    '& .MuiOutlinedInput-input': { color: theme.palette.primary.main, fontWeight: 600 }
                                }
                            },
                            popper: {
                                sx: {
                                    '& .MuiPaper-root': {
                                        borderRadius: 3,
                                        boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.15)}`,
                                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                        mt: 1
                                    }
                                }
                            }
                        }}
                    />
                </LocalizationProvider>

                {/* Unit Selector */}
                <FormControl size="small" sx={{ minWidth: { sm: 200 } }}>
                    <InputLabel id="unit-select-label">
                        <FormattedMessage id="supervisor.dashboard.team_unit" />
                    </InputLabel>
                    <Select
                        labelId="unit-select-label"
                        value={selectedUnit}
                        label={intl.formatMessage({ id: "supervisor.dashboard.team_unit" })}
                        onChange={(e) => setSelectedUnit(e.target.value)}
                        startAdornment={
                            <InputAdornment position="start" sx={{ ml: 1 }}>
                                <Filter size={18} color={theme.palette.primary.main} />
                            </InputAdornment>
                        }
                        sx={{
                            bgcolor: 'white',
                            borderRadius: 2,
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: alpha(theme.palette.primary.main, 0.2)
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderWidth: 1
                            }
                        }}
                    >
                        <MenuItem value="all">
                            <FormattedMessage id="supervisor.dashboard.all_teams" />
                        </MenuItem>
                        {(() => {
                            const units = Array.isArray(unitsData) ? unitsData : (unitsData?.data || []);
                            if (!Array.isArray(units)) return null;
                            return units.map((unit: any) => (
                                <MenuItem key={unit.id} value={unit.id}>{unit.name}</MenuItem>
                            ));
                        })()}
                    </Select>
                </FormControl>
            </Stack>
        </Box>
    );
};

export default SupervisorDashboardFilters;
