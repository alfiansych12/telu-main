'use client';
import React from 'react';
import Breadcrumbs from './Breadcrumbs';
import { Box, Button, TextField } from '@mui/material';

interface CustomBreadcrumbsProps {
  items: string[];
  showDate?: boolean;
  showExport?: boolean;
  onDateChange?: (date: string) => void;
  onExport?: () => void;
}

const CustomBreadcrumbs: React.FC<CustomBreadcrumbsProps> = ({
  items,
  showDate = false,
  showExport = false,
  onDateChange,
  onExport
}) => {
  const [date, setDate] = React.useState('');

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
    if (onDateChange) onDateChange(e.target.value);
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
      <Breadcrumbs custom links={items.map(title => ({ title }))} />
      <Box display="flex" alignItems="center" gap={1}>
        {showDate && (
          <TextField
            type="date"
            size="small"
            value={date}
            onChange={handleDateChange}
            sx={{ minWidth: 120 }}
          />
        )}
        {showExport && (
          <Button
            variant="contained"
            color="primary"
            onClick={onExport}
            sx={{ minWidth: 120 }}
          >
            Export Data
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default CustomBreadcrumbs;