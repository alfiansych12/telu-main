'use client';

import React from 'react';
import {
    Box,
    Typography,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Avatar,
    Chip,
    CircularProgress
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Edit, Trash, Chart } from 'iconsax-react';

interface AssessmentTableProps {
    assessments: any[];
    isLoading: boolean;
    onEdit: (assessment: any) => void;
    onDelete: (id: string) => void;
    deleteMutation: any;
    assessmentToDelete: string | null;
    getScoreLabel: (score: number) => { label: string; color: string };
}

const AssessmentTable = ({
    assessments,
    isLoading,
    onEdit,
    onDelete,
    deleteMutation,
    assessmentToDelete,
    getScoreLabel
}: AssessmentTableProps) => {
    const theme = useTheme();

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
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <Stack spacing={2} alignItems="center">
                        <CircularProgress size={40} thickness={4} color="primary" />
                        <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>Fetching performance data...</Typography>
                    </Stack>
                </Box>
            ) : (
                <Table sx={{ minWidth: 850 }}>
                    <TableHead sx={{
                        bgcolor: alpha(theme.palette.grey[50], 0.5),
                        borderBottom: `2px solid ${theme.palette.divider}`
                    }}>
                        <TableRow>
                            <TableCell sx={{ py: 2, fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>INTERN PERSON</TableCell>
                            <TableCell align="center" sx={{ py: 2, fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>PERIOD</TableCell>
                            <TableCell align="center" sx={{ py: 2, fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>SOFT SKILL</TableCell>
                            <TableCell align="center" sx={{ py: 2, fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>HARD SKILL</TableCell>
                            <TableCell align="center" sx={{ py: 2, fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>ATTITUDE</TableCell>
                            <TableCell align="center" sx={{ py: 2, fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>PERFORMANCE AVERAGE</TableCell>
                            <TableCell align="center" sx={{ py: 2, fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>ACTIONS</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {assessments?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 12 }}>
                                    <Stack spacing={1} alignItems="center">
                                        <Chart size={48} variant="Bulk" color={theme.palette.divider} />
                                        <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 600 }}>No Assessments Found</Typography>
                                        <Typography variant="caption" color="textDisabled">You haven't evaluated any interns yet.</Typography>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ) : (
                            assessments?.map((row: any) => {
                                const avg = (row.soft_skill + row.hard_skill + row.attitude) / 3;
                                const status = getScoreLabel(avg);
                                return (
                                    <TableRow
                                        key={row.id}
                                        sx={{
                                            transition: 'background-color 0.2s',
                                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) }
                                        }}
                                    >
                                        <TableCell>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Avatar
                                                    sx={{
                                                        width: 44,
                                                        height: 44,
                                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                        color: theme.palette.primary.main,
                                                        fontWeight: 700,
                                                        fontSize: '1rem',
                                                        border: `2px solid #fff`,
                                                        boxShadow: `0 2px 8px rgba(0,0,0,0.05)`
                                                    }}
                                                >
                                                    {row.user?.name.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                                                        {row.user?.name}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                                        {row.user?.unit?.name || 'Unassigned Unit'}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>

                                        <TableCell align="center">
                                            <Chip
                                                label={row.period || 'GENERAL'}
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    borderRadius: 1.5,
                                                    fontSize: '0.7rem',
                                                    fontWeight: 700,
                                                    color: theme.palette.primary.main,
                                                    borderColor: alpha(theme.palette.primary.main, 0.2)
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 800, color: row.soft_skill >= 80 ? 'success.main' : 'text.primary' }}>
                                                    {row.soft_skill}
                                                </Typography>
                                                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.disabled', fontWeight: 700 }}>SOFT</Typography>
                                            </Box>
                                        </TableCell>

                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 800, color: row.hard_skill >= 80 ? 'success.main' : 'text.primary' }}>
                                                    {row.hard_skill}
                                                </Typography>
                                                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.disabled', fontWeight: 700 }}>HARD</Typography>
                                            </Box>
                                        </TableCell>

                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 800, color: row.attitude >= 80 ? 'success.main' : 'text.primary' }}>
                                                    {row.attitude}
                                                </Typography>
                                                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.disabled', fontWeight: 700 }}>ATTITUDE</Typography>
                                            </Box>
                                        </TableCell>

                                        <TableCell align="center">
                                            <Stack alignItems="center" spacing={0.5}>
                                                <Typography variant="h5" sx={{ fontWeight: 900, color: theme.palette[status.color as 'primary' | 'success' | 'warning' | 'error']?.main || 'primary.main' }}>
                                                    {avg.toFixed(1)}
                                                </Typography>
                                                <Chip
                                                    label={status.label}
                                                    size="small"
                                                    sx={{
                                                        height: 20,
                                                        fontSize: '0.6rem',
                                                        fontWeight: 800,
                                                        bgcolor: alpha(theme.palette[status.color as 'primary' | 'success' | 'warning' | 'error']?.main || theme.palette.primary.main, 0.1),
                                                        color: theme.palette[status.color as 'primary' | 'success' | 'warning' | 'error']?.main || theme.palette.primary.main,
                                                        borderRadius: 1,
                                                        border: `1px solid ${alpha(theme.palette[status.color as 'primary' | 'success' | 'warning' | 'error']?.main || theme.palette.primary.main, 0.2)}`
                                                    }}
                                                />
                                            </Stack>
                                        </TableCell>

                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <IconButton
                                                    size="small"
                                                    sx={{
                                                        color: theme.palette.primary.main,
                                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                                                    }}
                                                    onClick={() => onEdit(row)}
                                                >
                                                    <Edit size={18} />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    sx={{
                                                        color: theme.palette.error.main,
                                                        bgcolor: alpha(theme.palette.error.main, 0.1),
                                                        '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(row.id);
                                                    }}
                                                    disabled={deleteMutation.isPending && assessmentToDelete === row.id}
                                                >
                                                    {deleteMutation.isPending && assessmentToDelete === row.id ? (
                                                        <CircularProgress size={18} color="inherit" />
                                                    ) : (
                                                        <Trash size={18} />
                                                    )}
                                                </IconButton>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            )}
        </TableContainer>
    );
};

export default AssessmentTable;
