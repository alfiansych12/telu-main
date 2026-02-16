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
    Checkbox,
    Collapse
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { Edit, Trash, User as UserIcon, Building as BuildingIcon, DocumentUpload, Timer1, DocumentText } from 'iconsax-react';
import MainCard from 'components/MainCard';
import { UserWithRelations } from 'types/api';

interface UserTableProps {
    usersData: any;
    usersLoading: boolean;
    usersError: any;
    usersRoleFilter: string;
    setUsersRoleFilter: (role: string) => void;
    usersSearch: string;
    setUsersSearch: (search: string) => void;
    usersPage: number;
    setUsersPage: (page: (p: number) => number) => void;
    usersPageSize: number;
    setUsersPageSize: (size: number) => void;
    onAdd: () => void;
    onBulkImport: () => void;
    onHistoryImport: () => void;
    onEdit: (user: UserWithRelations) => void;
    onDelete: (id: string) => void;
    onBulkDelete: (ids: string[]) => void;
    onOpenRecycleBin: () => void;
    onCertificate: (user: UserWithRelations) => void;
}

const UserTable = ({
    usersData,
    usersLoading,
    usersError,
    usersRoleFilter,
    setUsersRoleFilter,
    usersSearch,
    setUsersSearch,
    usersPage,
    setUsersPage,
    usersPageSize,
    setUsersPageSize,
    onAdd,
    onBulkImport,
    onHistoryImport,
    onEdit,
    onDelete,
    onBulkDelete,
    onOpenRecycleBin,
    onCertificate
}: UserTableProps) => {
    const theme = useTheme();
    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
    const displayUsers = Array.isArray(usersData) ? usersData : (usersData?.data || []);

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedIds(displayUsers.map((u: any) => u.id));
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
                    <span className="material-symbols-outlined" style={{ fontSize: 28, verticalAlign: 'middle' }}>groups</span>
                    User Management
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                    <TextField
                        select
                        label="Role"
                        size="small"
                        value={usersRoleFilter}
                        onChange={(e) => setUsersRoleFilter(e.target.value)}
                        sx={{
                            minWidth: 160,
                            '& .MuiSelect-select': { display: 'flex', alignItems: 'center', gap: 1 }
                        }}
                    >
                        <MenuItem value="all">
                            <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 8 }}>list</span>
                            All Roles
                        </MenuItem>
                        <MenuItem value="participant">
                            <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 8, color: theme.palette.success.main }}>person</span>
                            Participants
                        </MenuItem>
                        <MenuItem value="supervisor">
                            <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 8, color: theme.palette.warning.main }}>manage_accounts</span>
                            Supervisors
                        </MenuItem>
                    </TextField>
                    <TextField
                        size="small"
                        placeholder="Search user..."
                        value={usersSearch}
                        onChange={(e) => setUsersSearch(e.target.value)}
                        sx={{ minWidth: 200 }}
                    />
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={onHistoryImport}
                        startIcon={<Timer1 size={18} />}
                    >
                        Import History
                    </Button>
                    <Button
                        variant="outlined"
                        color="success"
                        onClick={onBulkImport}
                        startIcon={<DocumentUpload size={18} />}
                    >
                        Bulk Import
                    </Button>
                    <Button
                        variant="contained"
                        onClick={onAdd}
                        startIcon={<span className="material-symbols-outlined">add</span>}
                    >
                        Add User
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
                                {selectedIds.length} Members Selected
                            </Typography>
                            <Typography variant="caption" color="error.main" sx={{ fontWeight: 500 }}>
                                Accounts will be moved to Recycle Bin for 48 hours before permanent removal
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

            {usersError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Error loading users: {(usersError as Error).message}
                </Alert>
            )}

            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                {usersLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                        <CircularProgress size={30} />
                    </Box>
                ) : (
                    <Table sx={{ minWidth: 700 }}>
                        <TableHead sx={{ bgcolor: theme.palette.grey[50] }}>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={selectedIds.length > 0 && selectedIds.length < displayUsers.length}
                                        checked={displayUsers.length > 0 && selectedIds.length === displayUsers.length}
                                        onChange={handleSelectAll}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>User Profile</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>System Role</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Assigned Unit</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Mentor/Lead</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Current Status</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {displayUsers.length > 0 ? (
                                displayUsers.map((user: UserWithRelations) => (
                                    <TableRow
                                        key={user.id}
                                        hover
                                        selected={isSelected(user.id)}
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
                                                checked={isSelected(user.id)}
                                                onChange={() => handleSelectOne(user.id)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Avatar sx={{
                                                    width: 40,
                                                    height: 40,
                                                    fontSize: '0.9rem',
                                                    fontWeight: 600,
                                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                    color: theme.palette.primary.main,
                                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                                                }}>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{user.name}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="textPrimary" sx={{ fontWeight: 600 }}>{user.email}</Typography>
                                            {user.personal_email && user.personal_email !== user.email && (
                                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                                                    {user.personal_email}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.role}
                                                size="small"
                                                variant="outlined"
                                                sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <BuildingIcon size={14} variant="Bold" style={{ opacity: 0.5 }} />
                                                {user.unit?.name || 'Unassigned'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {user.role === 'participant' ? (
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Avatar sx={{ width: 22, height: 22, fontSize: '0.6rem', bgcolor: theme.palette.warning.light }}>
                                                        {user.supervisor?.name?.charAt(0) || '?'}
                                                    </Avatar>
                                                    <Typography variant="body2">{user.supervisor?.name || 'Not Paired'}</Typography>
                                                </Stack>
                                            ) : (
                                                <Typography variant="caption" color="textSecondary">N/A</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.status}
                                                size="small"
                                                color={user.status === 'active' ? 'success' : 'error'}
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
                                                <Tooltip title="Edit Profile">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onEdit(user)}
                                                        sx={{ color: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.05) }}
                                                    >
                                                        <Edit size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete Account">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => onDelete(user.id)}
                                                        sx={{ bgcolor: alpha(theme.palette.error.main, 0.05) }}
                                                    >
                                                        <Trash size={18} />
                                                    </IconButton>
                                                </Tooltip>
                                                {user.role === 'participant' && (
                                                    <Tooltip title="Edit & Generate Certificate">
                                                        <IconButton
                                                            size="small"
                                                            color="success"
                                                            onClick={() => onCertificate(user)}
                                                            sx={{ bgcolor: alpha(theme.palette.success.main, 0.05) }}
                                                        >
                                                            <DocumentText size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                        <UserIcon size={48} variant="Bulk" style={{ opacity: 0.2 }} />
                                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>No user data available</Typography>
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
                    value={usersPageSize}
                    onChange={(e) => setUsersPageSize(Number(e.target.value))}
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
                        disabled={usersPage === 1}
                        onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                    >
                        ←
                    </Button>
                    <Typography variant="body2">{usersPage} of {usersData?.totalPages || 1}</Typography>
                    <Button
                        size="small"
                        variant="outlined"
                        disabled={!usersData || usersPage >= usersData.totalPages}
                        onClick={() => setUsersPage(p => p + 1)}
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

export default UserTable;
