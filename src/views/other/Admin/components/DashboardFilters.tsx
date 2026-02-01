'use client';

import React from 'react';
import {
    Box,
    Typography,
    InputAdornment
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parseISO } from 'date-fns';
import { useTheme, alpha } from '@mui/material/styles';
import { CalendarSearch } from 'iconsax-react';

import { FormattedMessage, useIntl } from 'react-intl';

interface DashboardFiltersProps {
    selectedDate: string;
    setSelectedDate: (date: string) => void;
}

const DashboardFilters = ({ selectedDate, setSelectedDate }: DashboardFiltersProps) => {
    const theme = useTheme();
    const intl = useIntl();

    return (
        <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                <FormattedMessage id="admin.dashboard.title" />
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                    label={intl.formatMessage({ id: "admin.dashboard.filter_date" })}
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
                                minWidth: { sm: 200 },
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
        </Box>
    );
};

export default DashboardFilters;
