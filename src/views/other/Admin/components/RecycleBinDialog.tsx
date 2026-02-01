'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Typography,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Stack,
    Avatar,
    Tooltip,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    Checkbox,
    Button
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { CloseCircle, RecoveryConvert, Trash, User as UserIcon, Building } from 'iconsax-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { openAlert } from 'api/alert';

interface RecycleBinDialogProps {
    open: boolean;
    onClose: () => void;
}

const RecycleBinDialog = ({ open, onClose }: RecycleBinDialogProps) => {
    const theme = useTheme();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState(0);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [selectedUnits, setSelectedUnits] = useState<string[]>([]);

    // Fetch deleted users
    const { data: deletedUsers, isLoading: usersLoading } = useQuery({
        queryKey: ['deleted-users'],
        queryFn: async () => {
            const response = await fetch('/api/users/deleted');
            if (!response.ok) throw new Error('Failed to fetch deleted users');
            return response.json();
        },
        enabled: open
    });

    // Fetch deleted units
    const { data: deletedUnits, isLoading: unitsLoading } = useQuery({
        queryKey: ['deleted-units'],
        queryFn: async () => {
            const response = await fetch('/api/units/deleted');
            if (!response.ok) throw new Error('Failed to fetch deleted units');
            return response.json();
        },
        enabled: open
    });

    // Restore user mutation
    const restoreUserMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/users/${id}/restore`, { method: 'POST' });
            if (!response.ok) throw new Error('Failed to restore user');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deleted-users'] });
            queryClient.invalidateQueries({ queryKey: ['management-list'] });
            openAlert({
                variant: 'success',
                title: 'User Restored',
                message: 'The user account has been successfully restored.'
            });
        }
    });

    // Restore unit mutation
    const restoreUnitMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/units/${id}/restore`, { method: 'POST' });
            if (!response.ok) throw new Error('Failed to restore unit');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deleted-units'] });
            queryClient.invalidateQueries({ queryKey: ['management-list'] });
            openAlert({
                variant: 'success',
                title: 'Unit Restored',
                message: 'The unit has been successfully restored.'
            });
        }
    });

    // Permanent delete user mutation
    const permanentDeleteUserMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/users/${id}/permanent`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to permanently delete user');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deleted-users'] });
            openAlert({
                variant: 'success',
                title: 'User Permanently Deleted',
                message: 'The user account has been permanently removed from the system.'
            });
        }
    });

    // Permanent delete unit mutation
    const permanentDeleteUnitMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/units/${id}/permanent`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to permanently delete unit');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deleted-units'] });
            openAlert({
                variant: 'success',
                title: 'Unit Permanently Deleted',
                message: 'The unit has been permanently removed from the system.'
            });
        }
    });

    // Bulk Restore Users Mutation
    const bulkRestoreUsersMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const response = await fetch('/api/users/bulk-restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids })
            });
            if (!response.ok) throw new Error('Failed to restore users');
            return response.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['deleted-users'] });
            queryClient.invalidateQueries({ queryKey: ['management-list'] });
            setSelectedUsers([]);
            openAlert({
                variant: 'success',
                title: 'Users Restored',
                message: `${data.count} user accounts have been successfully restored.`
            });
        }
    });

    // Bulk Permanent Delete Users Mutation
    const bulkPermanentDeleteUsersMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const response = await fetch('/api/users/bulk-permanent', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids })
            });
            if (!response.ok) throw new Error('Failed to permanently delete users');
            return response.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['deleted-users'] });
            setSelectedUsers([]);
            openAlert({
                variant: 'success',
                title: 'Users Permanently Deleted',
                message: `${data.count} user accounts have been permanently removed.`
            });
        }
    });

    // Bulk Restore Units Mutation
    const bulkRestoreUnitsMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const response = await fetch('/api/units/bulk-restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids })
            });
            if (!response.ok) throw new Error('Failed to restore units');
            return response.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['deleted-units'] });
            queryClient.invalidateQueries({ queryKey: ['management-list'] });
            setSelectedUnits([]);
            openAlert({
                variant: 'success',
                title: 'Units Restored',
                message: `${data.count} units have been successfully restored.`
            });
        }
    });

    // Bulk Permanent Delete Units Mutation
    const bulkPermanentDeleteUnitsMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const response = await fetch('/api/units/bulk-permanent', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids })
            });
            if (!response.ok) throw new Error('Failed to permanently delete units');
            return response.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['deleted-units'] });
            setSelectedUnits([]);
            openAlert({
                variant: 'success',
                title: 'Units Permanently Deleted',
                message: `${data.count} units have been permanently removed.`
            });
        }
    });

    const getTimeRemaining = (deletedAt: string) => {
        const deletedTime = new Date(deletedAt);
        const expiryTime = new Date(deletedTime.getTime() + 48 * 60 * 60 * 1000); // 48 hours
        const now = new Date();
        const remaining = expiryTime.getTime() - now.getTime();

        if (remaining <= 0) return 'Expired';

        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}h ${minutes}m remaining`;
    };

    const isExpired = (deletedAt: string) => {
        const deletedTime = new Date(deletedAt);
        const expiryTime = new Date(deletedTime.getTime() + 48 * 60 * 60 * 1000);
        return new Date() >= expiryTime;
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.3)}`
                }
            }}
        >
            <DialogTitle sx={{
                pb: 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
                background: `linear-gradient(135deg, ${alpha(theme.palette.grey[100], 0.8)} 0%, ${alpha(theme.palette.grey[50], 0.5)} 100%)`
            }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(theme.palette.grey[500], 0.1),
                            color: theme.palette.grey[600]
                        }}>
                            <Trash size={24} variant="Bold" />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                Recycle Bin
                            </Typography>
                            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 500 }}>
                                Items will be permanently deleted after 48 hours
                            </Typography>
                        </Box>
                    </Stack>
                    <IconButton onClick={onClose} size="small">
                        <CloseCircle size={24} />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, newValue) => setActiveTab(newValue)}
                    sx={{
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        px: 3,
                        pt: 2
                    }}
                >
                    <Tab
                        label={
                            <Stack direction="row" spacing={1} alignItems="center">
                                <UserIcon size={18} />
                                <span>Users ({deletedUsers?.length || 0})</span>
                            </Stack>
                        }
                    />
                    <Tab
                        label={
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Building size={18} />
                                <span>Units ({deletedUnits?.length || 0})</span>
                            </Stack>
                        }
                    />
                </Tabs>

                <Box sx={{ p: 3 }}>
                    {activeTab === 0 && (
                        <>
                            {usersLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                    <CircularProgress />
                                </Box>
                            ) : deletedUsers?.length === 0 ? (
                                <Alert severity="info" sx={{ borderRadius: 2 }}>
                                    No deleted users in recycle bin
                                </Alert>
                            ) : (
                                <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                                    <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                                            {selectedUsers.length} Users Selected
                                        </Typography>
                                        <Stack direction="row" spacing={1}>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="success"
                                                startIcon={<RecoveryConvert size={16} />}
                                                disabled={selectedUsers.length === 0}
                                                onClick={() => bulkRestoreUsersMutation.mutate(selectedUsers)}
                                                sx={{ borderRadius: 1.5 }}
                                            >
                                                Restore Selected
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="error"
                                                startIcon={<Trash size={16} />}
                                                disabled={selectedUsers.length === 0}
                                                onClick={() => {
                                                    openAlert({
                                                        title: 'Permanent Delete Selected?',
                                                        message: `Are you sure you want to permanently delete ${selectedUsers.length} users? This cannot be undone.`,
                                                        variant: 'error',
                                                        showCancel: true,
                                                        confirmText: 'Delete All Forever',
                                                        onConfirm: () => bulkPermanentDeleteUsersMutation.mutate(selectedUsers)
                                                    });
                                                }}
                                                sx={{ borderRadius: 1.5 }}
                                            >
                                                Delete Permanently
                                            </Button>
                                        </Stack>
                                    </Box>
                                    <Table>
                                        <TableHead sx={{ bgcolor: theme.palette.grey[50] }}>
                                            <TableRow>
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        indeterminate={selectedUsers.length > 0 && selectedUsers.length < (deletedUsers?.length || 0)}
                                                        checked={(deletedUsers?.length || 0) > 0 && selectedUsers.length === deletedUsers?.length}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setSelectedUsers(deletedUsers.map((u: any) => u.id));
                                                            else setSelectedUsers([]);
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Deleted By</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Time Remaining</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {deletedUsers?.map((user: any) => {
                                                const isItemSelected = selectedUsers.includes(user.id);
                                                return (
                                                    <TableRow key={user.id} hover selected={isItemSelected}>
                                                        <TableCell padding="checkbox">
                                                            <Checkbox
                                                                checked={isItemSelected}
                                                                onChange={() => {
                                                                    if (isItemSelected) setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                                                    else setSelectedUsers([...selectedUsers, user.id]);
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                                <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(theme.palette.grey[500], 0.1) }}>
                                                                    {user.name.charAt(0)}
                                                                </Avatar>
                                                                <Box>
                                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                                        {user.name}
                                                                    </Typography>
                                                                    <Typography variant="caption" color="textSecondary">
                                                                        {user.email}
                                                                    </Typography>
                                                                </Box>
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip label={user.role} size="small" variant="outlined" sx={{ textTransform: 'capitalize' }} />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" color="textSecondary">
                                                                {user.deleted_by_name || 'System'}
                                                            </Typography>
                                                            <Typography variant="caption" color="textSecondary">
                                                                {formatDistanceToNow(new Date(user.deleted_at), { addSuffix: true })}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={getTimeRemaining(user.deleted_at)}
                                                                size="small"
                                                                color={isExpired(user.deleted_at) ? 'error' : 'warning'}
                                                                sx={{ fontWeight: 700 }}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                                <Tooltip title="Restore Account">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => restoreUserMutation.mutate(user.id)}
                                                                        sx={{ color: theme.palette.success.main, bgcolor: alpha(theme.palette.success.main, 0.05) }}
                                                                    >
                                                                        <RecoveryConvert size={18} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Delete Permanently">
                                                                    <IconButton
                                                                        size="small"
                                                                        color="error"
                                                                        onClick={() => {
                                                                            openAlert({
                                                                                title: 'Confirm Permanent Delete',
                                                                                message: 'This action cannot be undone. The user will be permanently removed from the system.',
                                                                                variant: 'error',
                                                                                showCancel: true,
                                                                                confirmText: 'Delete Forever',
                                                                                onConfirm: () => permanentDeleteUserMutation.mutate(user.id)
                                                                            });
                                                                        }}
                                                                        sx={{ bgcolor: alpha(theme.palette.error.main, 0.05) }}
                                                                    >
                                                                        <Trash size={18} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Stack>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </>
                    )}

                    {activeTab === 1 && (
                        <>
                            {unitsLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                    <CircularProgress />
                                </Box>
                            ) : deletedUnits?.length === 0 ? (
                                <Alert severity="info" sx={{ borderRadius: 2 }}>
                                    No deleted units in recycle bin
                                </Alert>
                            ) : (
                                <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                                    <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                                            {selectedUnits.length} Units Selected
                                        </Typography>
                                        <Stack direction="row" spacing={1}>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="success"
                                                startIcon={<RecoveryConvert size={16} />}
                                                disabled={selectedUnits.length === 0}
                                                onClick={() => bulkRestoreUnitsMutation.mutate(selectedUnits)}
                                                sx={{ borderRadius: 1.5 }}
                                            >
                                                Restore Selected
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="error"
                                                startIcon={<Trash size={16} />}
                                                disabled={selectedUnits.length === 0}
                                                onClick={() => {
                                                    openAlert({
                                                        title: 'Permanent Delete Selected?',
                                                        message: `Are you sure you want to permanently delete ${selectedUnits.length} units? This cannot be undone.`,
                                                        variant: 'error',
                                                        showCancel: true,
                                                        confirmText: 'Delete All Forever',
                                                        onConfirm: () => bulkPermanentDeleteUnitsMutation.mutate(selectedUnits)
                                                    });
                                                }}
                                                sx={{ borderRadius: 1.5 }}
                                            >
                                                Delete Permanently
                                            </Button>
                                        </Stack>
                                    </Box>
                                    <Table>
                                        <TableHead sx={{ bgcolor: theme.palette.grey[50] }}>
                                            <TableRow>
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        indeterminate={selectedUnits.length > 0 && selectedUnits.length < (deletedUnits?.length || 0)}
                                                        checked={(deletedUnits?.length || 0) > 0 && selectedUnits.length === deletedUnits?.length}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setSelectedUnits(deletedUnits.map((u: any) => u.id));
                                                            else setSelectedUnits([]);
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Unit</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Deleted By</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Time Remaining</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {deletedUnits?.map((unit: any) => {
                                                const isItemSelected = selectedUnits.includes(unit.id);
                                                return (
                                                    <TableRow key={unit.id} hover selected={isItemSelected}>
                                                        <TableCell padding="checkbox">
                                                            <Checkbox
                                                                checked={isItemSelected}
                                                                onChange={() => {
                                                                    if (isItemSelected) setSelectedUnits(selectedUnits.filter(id => id !== unit.id));
                                                                    else setSelectedUnits([...selectedUnits, unit.id]);
                                                                }}
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
                                                                    bgcolor: alpha(theme.palette.grey[500], 0.1)
                                                                }}>
                                                                    <Building size={18} />
                                                                </Box>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                                    {unit.name}
                                                                </Typography>
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" color="textSecondary">
                                                                {unit.department}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" color="textSecondary">
                                                                {unit.deleted_by_name || 'System'}
                                                            </Typography>
                                                            <Typography variant="caption" color="textSecondary">
                                                                {formatDistanceToNow(new Date(unit.deleted_at), { addSuffix: true })}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={getTimeRemaining(unit.deleted_at)}
                                                                size="small"
                                                                color={isExpired(unit.deleted_at) ? 'error' : 'warning'}
                                                                sx={{ fontWeight: 700 }}
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                                <Tooltip title="Restore Unit">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => restoreUnitMutation.mutate(unit.id)}
                                                                        sx={{ color: theme.palette.success.main, bgcolor: alpha(theme.palette.success.main, 0.05) }}
                                                                    >
                                                                        <RecoveryConvert size={18} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Delete Permanently">
                                                                    <IconButton
                                                                        size="small"
                                                                        color="error"
                                                                        onClick={() => {
                                                                            openAlert({
                                                                                title: 'Confirm Permanent Delete',
                                                                                message: 'This action cannot be undone. The unit will be permanently removed from the system.',
                                                                                variant: 'error',
                                                                                showCancel: true,
                                                                                confirmText: 'Delete Forever',
                                                                                onConfirm: () => permanentDeleteUnitMutation.mutate(unit.id)
                                                                            });
                                                                        }}
                                                                        sx={{ bgcolor: alpha(theme.palette.error.main, 0.05) }}
                                                                    >
                                                                        <Trash size={18} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Stack>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default RecycleBinDialog;
