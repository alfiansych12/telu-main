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
import { Edit, Trash, Chart, InfoCircle } from 'iconsax-react';

interface AssessmentTableProps {
    assessments: any[];
    isLoading: boolean;
    onEdit: (assessment: any) => void;
    onDelete: (id: string) => void;
    deleteMutation: any;
    assessmentToDelete: string | null;
    getScoreLabel: (score: number | string) => { label: string; color: string };
    criteria: any; // Global default criteria
    templates: Record<string, any>; // Institution-specific templates
}

const AssessmentTable = ({
    assessments,
    isLoading,
    onEdit,
    onDelete,
    deleteMutation,
    assessmentToDelete,
    getScoreLabel,
    criteria: globalCriteria,
    templates
}: AssessmentTableProps) => {
    const theme = useTheme();

    /**
     * Resolve the criteria for a specific row based on its user's institution
     */
    const getRowCriteria = (row: any) => {
        const institutionType = row.user?.institution_type;
        if (institutionType && templates[institutionType]) {
            return {
                criteria: templates[institutionType],
                isCustom: true
            };
        }
        return {
            criteria: globalCriteria,
            isCustom: false
        };
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
                            <TableCell align="center" sx={{ py: 2, fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>TYPE</TableCell>
                            <TableCell align="center" sx={{ py: 2, fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>PERIOD</TableCell>
                            <TableCell align="center" sx={{ py: 2, fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', maxWidth: 100 }}>INDICATOR 1</TableCell>
                            <TableCell align="center" sx={{ py: 2, fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', maxWidth: 100 }}>INDICATOR 2</TableCell>
                            <TableCell align="center" sx={{ py: 2, fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', maxWidth: 100 }}>INDICATOR 3</TableCell>
                            <TableCell align="center" sx={{ py: 2, fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>PERFORMANCE AVERAGE</TableCell>
                            <TableCell align="center" sx={{ py: 2, fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>ACTIONS</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {assessments?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 12 }}>
                                    <Stack spacing={1} alignItems="center">
                                        <Chart size={48} variant="Bulk" color={theme.palette.divider} />
                                        <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 600 }}>No Assessments Found</Typography>
                                        <Typography variant="caption" color="textDisabled">You haven't evaluated any interns yet.</Typography>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ) : (
                            assessments?.map((row: any) => {
                                const { criteria: rowCriteria, isCustom } = getRowCriteria(row);
                                const currentCat = row.category || 'internal';
                                const catCriteria = rowCriteria?.[currentCat] || [];

                                // Helper to get value for an indicator based on its key in the criteria
                                const getVal = (idx: number) => {
                                    const key = catCriteria[idx]?.key;
                                    if (row.scores && key && row.scores[key] !== undefined) return row.scores[key];
                                    // Fallback to standard fields
                                    if (idx === 0) return row.soft_skill;
                                    if (idx === 1) return row.hard_skill;
                                    if (idx === 2) return row.attitude;
                                    return '0';
                                };

                                const s1 = getVal(0);
                                const s2 = getVal(1);
                                const s3 = getVal(2);

                                const soft = parseFloat(s1 || '0');
                                const hard = parseFloat(s2 || '0');
                                const att = parseFloat(s3 || '0');

                                // Calculate average more accurately: 
                                // if we have row.scores, average all numeric values there. 
                                // Otherwise average the 3 standard ones.
                                let avg = (soft + hard + att) / 3;
                                if (row.scores && typeof row.scores === 'object') {
                                    const numericVals = Object.values(row.scores)
                                        .filter(v => v !== null && v !== '' && !isNaN(parseFloat(v as string)))
                                        .map(v => parseFloat(v as string));
                                    if (numericVals.length > 0) {
                                        avg = numericVals.reduce((a, b) => a + b, 0) / numericVals.length;
                                    }
                                }

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
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                                            {row.user?.unit?.name || 'Unassigned Unit'}
                                                        </Typography>
                                                        {row.user?.institution_type && (
                                                            <>
                                                                <Typography variant="caption" color="textDisabled">•</Typography>
                                                                <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
                                                                    {row.user.institution_type}
                                                                </Typography>
                                                            </>
                                                        )}
                                                    </Stack>
                                                </Box>
                                            </Stack>
                                        </TableCell>

                                        <TableCell align="center">
                                            <Chip
                                                label={currentCat.toUpperCase()}
                                                size="small"
                                                variant="filled"
                                                color={currentCat === 'external' ? 'secondary' : 'primary'}
                                                sx={{
                                                    borderRadius: 1.5,
                                                    fontSize: '0.65rem',
                                                    fontWeight: 800,
                                                    height: 20
                                                }}
                                            />
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
                                                <Typography variant="body2" sx={{ fontWeight: 800, color: (catCriteria[0]?.type === 'number' && soft >= 80) ? 'success.main' : 'text.primary' }}>
                                                    {s1}
                                                </Typography>
                                                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: isCustom ? theme.palette.info.main : 'text.disabled', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    {rowCriteria?.[currentCat]?.[0]?.label || 'SOFT'}
                                                    {isCustom && <InfoCircle size={10} />}
                                                </Typography>
                                            </Box>
                                        </TableCell>

                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 800, color: (catCriteria[1]?.type === 'number' && hard >= 80) ? 'success.main' : 'text.primary' }}>
                                                    {s2}
                                                </Typography>
                                                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: isCustom ? theme.palette.info.main : 'text.disabled', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    {rowCriteria?.[currentCat]?.[1]?.label || 'HARD'}
                                                    {isCustom && <InfoCircle size={10} />}
                                                </Typography>
                                            </Box>
                                        </TableCell>

                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 800, color: (catCriteria[2]?.type === 'number' && att >= 80) ? 'success.main' : 'text.primary' }}>
                                                    {s3}
                                                </Typography>
                                                <Typography variant="caption" sx={{ fontSize: '0.65rem', color: isCustom ? theme.palette.info.main : 'text.disabled', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    {rowCriteria?.[currentCat]?.[2]?.label || 'ATT'}
                                                    {isCustom && <InfoCircle size={10} />}
                                                </Typography>
                                            </Box>
                                        </TableCell>

                                        <TableCell align="center">
                                            <Stack alignItems="center" spacing={0.5}>
                                                <Typography variant="h5" sx={{ fontWeight: 900, color: theme.palette[status.color as 'primary' | 'success' | 'warning' | 'error']?.main || 'primary.main' }}>
                                                    {isNaN(avg) ? '-' : avg.toFixed(1)}
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
