'use client';

import React from 'react';
import {
    Box,
    Typography,
    TextField,
    MenuItem,
    Button,
    Alert,
    TableContainer,
    Paper,
    CircularProgress,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Stack,
    Avatar,
    Chip,
    Tooltip,
    IconButton,
    LinearProgress,
    Checkbox,
    Collapse
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Trash, Building as BuildingIcon, Setting2 } from 'iconsax-react';
import { useRouter } from 'next/navigation';
import MainCard from 'components/MainCard';
import { UnitWithRelations } from 'types/api';

interface UnitTableProps {
    unitsData: any;
    unitsLoading: boolean;
    unitsError: any;
    unitsStatusFilter: string;
    setUnitsStatusFilter: (status: string) => void;
    unitsSearch: string;
    setUnitsSearch: (search: string) => void;
    unitsPage: number;
    setUnitsPage: (page: (p: number) => number) => void;
    unitsPageSize: number;
    setUnitsPageSize: (size: number) => void;
    onAdd: () => void;
    onEdit: (unit: UnitWithRelations) => void;
    onDelete: (id: string) => void;
    onBulkDelete: (ids: string[]) => void;
    onOpenRecycleBin: () => void;
}

const UnitTable = ({
    unitsData,
    unitsLoading,
    unitsError,
    unitsStatusFilter,
    setUnitsStatusFilter,
    unitsSearch,
    setUnitsSearch,
    unitsPage,
    setUnitsPage,
    unitsPageSize,
    setUnitsPageSize,
    onAdd,
    onEdit,
    onDelete,
    onBulkDelete,
    onOpenRecycleBin
}: UnitTableProps) => {
    const theme = useTheme();
    const router = useRouter();
    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
    const displayUnits = Array.isArray(unitsData) ? unitsData : (unitsData?.data || []);

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedIds(displayUnits.map((u: any) => u.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const isSelected = (id: string) => selectedIds.includes(id);

    return (
        <MainCard border={false} shadow={theme.customShadows.z1} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'stretch', md: 'center' }, gap: 2, mb: 2 }}>
                <Typography variant="h5" sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 28, verticalAlign: 'middle' }}>apartment</span>
                    Units Management
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                    <TextField
                        select
                        label="Status"
                        size="small"
                        value={unitsStatusFilter}
                        onChange={(e) => setUnitsStatusFilter(e.target.value)}
                        sx={{
                            minWidth: 160,
                            '& .MuiSelect-select': { display: 'flex', alignItems: 'center', gap: 1 }
                        }}
                    >
                        <MenuItem value="all">
                            <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 8 }}>list</span>
                            All Status
                        </MenuItem>
                        <MenuItem value="active">
                            <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 8, color: theme.palette.success.main }}>check_circle</span>
                            Active
                        </MenuItem>
                        <MenuItem value="inactive">
                            <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 8, color: theme.palette.error.main }}>cancel</span>
                            Inactive
                        </MenuItem>
                    </TextField>
                    <TextField
                        size="small"
                        placeholder="Search unit..."
                        value={unitsSearch}
                        onChange={(e) => setUnitsSearch(e.target.value)}
                        sx={{ minWidth: 200 }}
                    />

                    <Button
                        variant="contained"
                        onClick={onAdd}
                        startIcon={<span className="material-symbols-outlined">add</span>}
                    >
                        Add Unit
                    </Button>
                </Box>
            </Box>

            <Collapse in={selectedIds.length > 0}>
                <Box sx={{
                    mb: 3,
                    p: 2,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.error.lighter, 0.4),
                    border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.1)}`,
                    background: `linear-gradient(90deg, ${alpha(theme.palette.error.lighter, 0.5)} 0%, ${alpha(theme.palette.error.lighter, 0.2)} 100%)`,
                    backdropFilter: 'blur(4px)'
                }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: theme.palette.error.main,
                            color: '#fff',
                            boxShadow: `0 4px 8px ${alpha(theme.palette.error.main, 0.3)}`
                        }}>
                            <Trash size={20} variant="Bold" />
                        </Box>
                        <Stack spacing={0.2}>
                            <Typography variant="subtitle1" color="error.darker" sx={{ fontWeight: 800 }}>
                                {selectedIds.length} Units Selected
                            </Typography>
                            <Typography variant="caption" color="error.main" sx={{ fontWeight: 500 }}>
                                Units will be moved to Recycle Bin for 48 hours. Active units cannot be moved.
                            </Typography>
                        </Stack>
                    </Stack>
                    <Stack direction="row" spacing={1.5}>
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => setSelectedIds([])}
                            sx={{ fontWeight: 700, borderRadius: 2 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            size="small"
                            startIcon={<Trash size={16} variant="Bold" />}
                            onClick={() => {
                                onBulkDelete(selectedIds);
                                setSelectedIds([]);
                            }}
                            sx={{
                                fontWeight: 700,
                                borderRadius: 2,
                                px: 2,
                                boxShadow: `0 8px 16px -4px ${alpha(theme.palette.error.main, 0.4)}`,
                                '&:hover': {
                                    boxShadow: `0 12px 20px -4px ${alpha(theme.palette.error.main, 0.5)}`
                                }
                            }}
                        >
                            Move to Recycle Bin
                        </Button>
                    </Stack>
                </Box>
            </Collapse>

            {unitsError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Error loading units: {(unitsError as Error).message}
                </Alert>
            )}

            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                {unitsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                        <CircularProgress size={30} />
                    </Box>
                ) : (
                    <Table sx={{ minWidth: 700 }}>
                        <TableHead sx={{ bgcolor: theme.palette.grey[50] }}>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={selectedIds.length > 0 && selectedIds.length < displayUnits.length}
                                        checked={displayUnits.length > 0 && selectedIds.length === displayUnits.length}
                                        onChange={handleSelectAll}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Unit Information</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Manager</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>Occupation</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {displayUnits.length > 0 ? (
                                displayUnits.map((unit: UnitWithRelations) => (
                                    <TableRow
                                        key={unit.id}
                                        hover
                                        selected={isSelected(unit.id)}
                                        sx={{
                                            '&:last-child td, &:last-child th': { border: 0 },
                                            '&.Mui-selected': {
                                                bgcolor: alpha(theme.palette.primary.lighter, 0.4),
                                                '&:hover': { bgcolor: alpha(theme.palette.primary.lighter, 0.6) }
                                            }
                                        }}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={isSelected(unit.id)}
                                                onChange={() => handleSelectOne(unit.id)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Box sx={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                    color: theme.palette.primary.main
                                                }}>
                                                    <BuildingIcon variant="Bulk" size={20} />
                                                </Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{unit.name}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="textSecondary">{unit.department}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Avatar sx={{ width: 24, height: 24, fontSize: '0.65rem' }}>
                                                    {(unit.manager_name || unit.manager?.name || '-').charAt(0)}
                                                </Avatar>
                                                <Typography variant="body2">{unit.manager_name || unit.manager?.name || '-'}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack spacing={0.5}>
                                                <Typography variant="caption" color="textSecondary">
                                                    {unit.employee_count || 0} / {unit.capacity || 0}
                                                </Typography>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={unit.capacity ? Math.min(100, ((unit.employee_count || 0) / unit.capacity) * 100) : 0}
                                                    sx={{ height: 4, borderRadius: 2 }}
                                                />
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={unit.status}
                                                size="small"
                                                color={unit.status === 'active' ? 'success' : 'error'}
                                                variant="filled"
                                                sx={{
                                                    px: 1,
                                                    height: 24,
                                                    fontSize: '0.7rem',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    borderRadius: 1
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <Tooltip title="Manage Unit Settings">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => router.push(`/UnitsManagement/settings/${unit.id}`)}
                                                        sx={{ color: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.05) }}
                                                    >
                                                        <Setting2 size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete Unit">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => onDelete(unit.id)}
                                                        sx={{ bgcolor: alpha(theme.palette.error.main, 0.05) }}
                                                    >
                                                        <Trash size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.2 }}>apartment</span>
                                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>No unit data available</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </TableContainer>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 2 }}>
                <Typography variant="body2" sx={{ mr: 1 }}>Rows per page:</Typography>
                <TextField
                    select
                    size="small"
                    value={unitsPageSize}
                    onChange={(e) => setUnitsPageSize(Number(e.target.value))}
                    sx={{ width: 80 }}
                >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                </TextField>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                    <Button
                        size="small"
                        variant="outlined"
                        disabled={unitsPage === 1}
                        onClick={() => setUnitsPage(p => Math.max(1, p - 1))}
                    >
                        ←
                    </Button>
                    <Typography variant="body2">{unitsPage} of {unitsData?.totalPages || 1}</Typography>
                    <Button
                        size="small"
                        variant="outlined"
                        disabled={!unitsData || unitsPage >= unitsData.totalPages}
                        onClick={() => setUnitsPage(p => p + 1)}
                    >
                        →
                    </Button>
                </Box>
                <Tooltip title="View Recycle Bin">
                    <IconButton
                        onClick={onOpenRecycleBin}
                        sx={{
                            ml: 2,
                            color: theme.palette.grey[500],
                            bgcolor: alpha(theme.palette.grey[500], 0.05),
                            '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.1) }
                        }}
                    >
                        <Trash size={18} variant="Bold" />
                    </IconButton>
                </Tooltip>
            </Box>
        </MainCard>
    );
};

export default UnitTable;
