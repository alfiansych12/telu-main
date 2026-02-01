'use client';

import React from 'react';
import {
    Box,
    Typography,
    Stack,
    Button
} from '@mui/material';
import { DocumentText } from 'iconsax-react';

interface AttendanceReportHeaderProps {
    onExportPDF: () => void;
    onExportExcel: () => void;
    onExportWord: () => void;
    downLG: boolean;
}

const AttendanceReportHeader = ({
    onExportPDF,
    onExportExcel,
    onExportWord,
    downLG
}: AttendanceReportHeaderProps) => {
    return (
        <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, '@media print': { display: 'none' } }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Attendance Summary</Typography>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ width: { xs: '100%', md: 'auto' }, flexWrap: 'wrap' }}
            >
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<DocumentText size={18} />}
                    onClick={onExportPDF}
                    fullWidth={downLG}
                    sx={{ borderRadius: 2, px: 2, minWidth: { sm: 130 } }}
                >
                    Export PDF
                </Button>
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<DocumentText size={18} />}
                    onClick={onExportExcel}
                    fullWidth={downLG}
                    sx={{ borderRadius: 2, px: 2, minWidth: { sm: 130 } }}
                >
                    Export Excel
                </Button>
                <Button
                    variant="contained"
                    color="info"
                    startIcon={<DocumentText size={18} />}
                    onClick={onExportWord}
                    fullWidth={downLG}
                    sx={{ borderRadius: 2, px: 2, minWidth: { sm: 130 } }}
                >
                    Export Word
                </Button>
            </Stack>
        </Box>
    );
};

export default AttendanceReportHeader;
