'use client';

import React from 'react';
import {
    Grid,
    Paper,
    Stack,
    Typography,
    Box
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
    DocumentText,
    TickCircle,
    Timer1,
    CloseCircle,
    InfoCircle
} from 'iconsax-react';

interface AttendanceSummaryCardsProps {
    stats: {
        total: number;
        present: number;
        late: number;
        absent: number;
        permit: number;
        rejected: number;
    };
    statusFilter: string | null;
    setStatusFilter: (filter: string | null) => void;
}

const AttendanceSummaryCards = ({ stats, statusFilter, setStatusFilter }: AttendanceSummaryCardsProps) => {
    const theme = useTheme();

    const summaryItems = [
        {
            label: 'Total Records',
            value: stats.total,
            color: theme.palette.primary.main,
            darkColor: theme.palette.primary.dark,
            icon: <DocumentText size={70} variant="Bulk" style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.2 }} />,
            filterKey: null
        },
        {
            label: 'Present',
            value: stats.present,
            color: theme.palette.success.main,
            darkColor: theme.palette.success.dark,
            icon: <TickCircle size={70} variant="Bulk" style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.2 }} />,
            filterKey: 'present'
        },
        {
            label: 'Late',
            value: stats.late,
            color: theme.palette.warning.main,
            darkColor: '#e67e22',
            icon: <Timer1 size={70} variant="Bulk" style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.2 }} />,
            filterKey: 'late'
        },
        {
            label: 'Absent',
            value: stats.absent,
            color: theme.palette.error.main,
            darkColor: theme.palette.error.dark,
            icon: <CloseCircle size={70} variant="Bulk" style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.2 }} />,
            filterKey: 'absent'
        },
        {
            label: 'Excused',
            value: stats.permit,
            color: theme.palette.info.main,
            darkColor: theme.palette.info.dark,
            icon: <InfoCircle size={70} variant="Bulk" style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.2 }} />,
            filterKey: 'excused'
        },
        {
            label: 'Rejected',
            value: stats.rejected,
            color: theme.palette.grey[700],
            darkColor: theme.palette.grey[900],
            icon: <CloseCircle size={70} variant="Bulk" style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.2 }} />,
            filterKey: 'rejected'
        },
    ];

    return (
        <Grid container spacing={2} sx={{ mb: 4 }}>
            {summaryItems.map((stat, index) => {
                const isActive = statusFilter === stat.filterKey;
                return (
                    <Grid item xs={4} sm={4} md={2} key={index} sx={{
                        '@media print': {
                            flexBasis: '33.333333%',
                            maxWidth: '33.333333%',
                            padding: '5px !important'
                        }
                    }}>
                        <Paper
                            elevation={isActive ? 4 : 0}
                            onClick={() => setStatusFilter(stat.filterKey as string | null)}
                            sx={{
                                p: { xs: 1.2, sm: 2.2 },
                                borderRadius: { xs: 2.5, sm: 4 },
                                background: `linear-gradient(45deg, ${stat.color}, ${stat.darkColor})`,
                                color: '#fff',
                                position: 'relative',
                                overflow: 'hidden',
                                height: '100%',
                                minHeight: { xs: 80, sm: 110 },
                                display: 'flex',
                                alignItems: 'center',
                                boxShadow: isActive ? `0 12px 28px ${alpha(stat.color, 0.4)}` : `0 8px 24px ${alpha(stat.color, 0.25)}`,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                border: isActive ? '2px solid #fff' : 'none',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: `0 12px 28px ${alpha(stat.color, 0.4)}`
                                },
                                '@media print': {
                                    background: 'none !important',
                                    color: '#000 !important',
                                    border: '1px solid #000 !important',
                                    borderRadius: '4px !important',
                                    boxShadow: 'none !important',
                                    minHeight: 'auto',
                                    height: 'auto',
                                    p: 1,
                                    transform: 'none !important',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }
                            }}
                        >
                            <Stack spacing={0} sx={{ width: '100%' }}>
                                <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500, fontSize: { xs: '0.65rem', sm: '0.8rem' }, textAlign: { xs: 'center', sm: 'left' }, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', lineHeight: 1.2, '@media print': { opacity: 1, fontWeight: 700 } }}>
                                    {stat.label} <span className="print-hide">{isActive && '✓'}</span>
                                </Typography>
                                <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', sm: '2rem', md: '2.2rem' }, textAlign: { xs: 'center', sm: 'left' }, '@media print': { fontSize: '1.5rem' } }}>
                                    {stat.value}
                                </Typography>
                            </Stack>
                            <Box className="card-icon" sx={{ display: { xs: 'none', sm: 'block' }, '@media print': { display: 'none' } }}>
                                {stat.icon}
                            </Box>
                        </Paper>
                    </Grid>
                );
            })}
        </Grid>
    );
};

export default AttendanceSummaryCards;
