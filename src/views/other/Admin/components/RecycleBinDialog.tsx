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
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    Checkbox,
    Button
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { CloseCircle, RecoveryConvert, Trash, User as UserIcon, Building, Note, DocumentText, ArchiveBook } from 'iconsax-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
    const [selectedForms, setSelectedForms] = useState<string[]>([]);
    const [selectedArchives, setSelectedArchives] = useState<string[]>([]);

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

    // Fetch deleted applications
    const { data: deletedApps, isLoading: appsLoading } = useQuery({
        queryKey: ['deleted-applications'],
        queryFn: async () => {
            const response = await fetch('/api/registration/applications?deleted=true');
            if (!response.ok) throw new Error('Failed to fetch deleted apps');
            const data = await response.json();
            return data.applications || [];
        },
        enabled: open
    });

    // Fetch deleted forms
    const { data: deletedForms, isLoading: formsLoading } = useQuery({
        queryKey: ['deleted-forms'],
        queryFn: async () => {
            const response = await fetch('/api/registration/forms?deleted=true');
            if (!response.ok) throw new Error('Failed to fetch deleted forms');
            const data = await response.json();
            return data.forms || [];
        },
        enabled: open
    });

    // Fetch deleted archives
    const { data: deletedArchives, isLoading: archivesLoading } = useQuery({
        queryKey: ['deleted-archives'],
        queryFn: async () => {
            const response = await fetch('/api/arsip?deleted=true');
            if (!response.ok) throw new Error('Failed to fetch deleted archives');
            return response.json();
        },
        enabled: open
    });

    // --- RESTORE MUTATIONS ---

    const restoreUserMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/users/${id}/restore`, { method: 'POST' });
            if (!response.ok) throw new Error('Failed to restore user');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deleted-users'] });
            queryClient.invalidateQueries({ queryKey: ['management-list'] });
            openAlert({ variant: 'success', title: 'User Restored', message: 'The user account has been successfully restored.' });
        }
    });

    const restoreUnitMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/units/${id}/restore`, { method: 'POST' });
            if (!response.ok) throw new Error('Failed to restore unit');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deleted-units'] });
            queryClient.invalidateQueries({ queryKey: ['management-list'] });
            openAlert({ variant: 'success', title: 'Unit Restored', message: 'The unit has been successfully restored.' });
        }
    });

    const restoreAppMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/registration/applications/${id}/restore`, { method: 'POST' });
            if (!response.ok) throw new Error('Failed to restore application');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deleted-applications'] });
            openAlert({ variant: 'success', title: 'Application Restored', message: 'The application has been successfully restored.' });
        }
    });

    const restoreFormMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/registration/forms/${id}/restore`, { method: 'POST' });
            if (!response.ok) throw new Error('Failed to restore form');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deleted-forms'] });
            openAlert({ variant: 'success', title: 'Form Restored', message: 'The registration form has been successfully restored.' });
        }
    });

    const restoreArchiveMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/arsip/${id}/restore`, { method: 'POST' });
            if (!response.ok) throw new Error('Failed to restore archive');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deleted-archives'] });
            openAlert({ variant: 'success', title: 'Archive Restored', message: 'The archive has been successfully restored.' });
        }
    });

    // --- PERMANENT DELETE MUTATIONS ---

    const permanentDeleteUserMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/users/${id}/permanent`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to permanently delete user');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deleted-users'] });
            openAlert({ variant: 'success', title: 'User Deleted', message: 'Permanently removed.' });
        }
    });

    const permanentDeleteUnitMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/units/${id}/permanent`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to permanently delete unit');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deleted-units'] });
            openAlert({ variant: 'success', title: 'Unit Deleted', message: 'Permanently removed.' });
        }
    });

    const permanentDeleteAppMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/registration/applications/${id}/permanent`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deleted-applications'] });
            openAlert({ variant: 'success', title: 'App Deleted', message: 'Permanently removed.' });
        }
    });

    const permanentDeleteFormMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/registration/forms/${id}/permanent`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deleted-forms'] });
            openAlert({ variant: 'success', title: 'Form Deleted', message: 'Permanently removed.' });
        }
    });

    const permanentDeleteArchiveMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/arsip/${id}/permanent`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deleted-archives'] });
            openAlert({ variant: 'success', title: 'Archive Deleted', message: 'Permanently removed.' });
        }
    });

    // --- BULK MUTATIONS ---

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
            setSelectedUsers([]);
            openAlert({ variant: 'success', title: 'Users Restored', message: `${data?.count || 0} users restored.` });
        }
    });

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
            setSelectedUnits([]);
            openAlert({ variant: 'success', title: 'Units Restored', message: `${data?.count || 0} units restored.` });
        }
    });

    const bulkRestoreAppsMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const response = await fetch('/api/registration/applications/bulk-restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids })
            });
            if (!response.ok) throw new Error('Failed to restore applications');
            return response.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['deleted-applications'] });
            setSelectedApplications([]);
            openAlert({ variant: 'success', title: 'Applications Restored', message: `${data?.count || 0} items restored.` });
        }
    });

    const bulkRestoreFormsMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const response = await fetch('/api/registration/forms/bulk-restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids })
            });
            if (!response.ok) throw new Error('Failed to restore forms');
            return response.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['deleted-forms'] });
            setSelectedForms([]);
            openAlert({ variant: 'success', title: 'Forms Restored', message: `${data?.count || 0} forms restored.` });
        }
    });

    const bulkRestoreArchivesMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const response = await fetch('/api/arsip/bulk-restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids })
            });
            if (!response.ok) throw new Error('Failed to restore archives');
            return response.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['deleted-archives'] });
            setSelectedArchives([]);
            openAlert({ variant: 'success', title: 'Archives Restored', message: `${data?.count || 0} archives restored.` });
        }
    });

    const bulkPermanentDeleteUsersMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const response = await fetch('/api/users/bulk-permanent', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids })
            });
            if (!response.ok) throw new Error('Failed to delete users');
            return response.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['deleted-users'] });
            setSelectedUsers([]);
            openAlert({ variant: 'success', title: 'Users Deleted', message: `${data?.count || 0} users permanently removed.` });
        }
    });

    const bulkPermanentDeleteUnitsMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const response = await fetch('/api/units/bulk-permanent', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids })
            });
            if (!response.ok) throw new Error('Failed to delete units');
            return response.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['deleted-units'] });
            setSelectedUnits([]);
            openAlert({ variant: 'success', title: 'Units Deleted', message: `${data?.count || 0} units permanently removed.` });
        }
    });

    const bulkPermanentDeleteAppsMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const response = await fetch('/api/registration/applications/bulk-permanent', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids })
            });
            if (!response.ok) throw new Error('Failed to delete applications');
            return response.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['deleted-applications'] });
            setSelectedApplications([]);
            openAlert({ variant: 'success', title: 'Apps Deleted', message: `${data?.count || 0} items permanently removed.` });
        }
    });

    const bulkPermanentDeleteFormsMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const response = await fetch('/api/registration/forms/bulk-permanent', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids })
            });
            if (!response.ok) throw new Error('Failed to delete forms');
            return response.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['deleted-forms'] });
            setSelectedForms([]);
            openAlert({ variant: 'success', title: 'Forms Deleted', message: `${data?.count || 0} forms permanently removed.` });
        }
    });

    const bulkPermanentDeleteArchivesMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const response = await fetch('/api/arsip/bulk-permanent', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids })
            });
            if (!response.ok) throw new Error('Failed to delete archives');
            return response.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['deleted-archives'] });
            setSelectedArchives([]);
            openAlert({ variant: 'success', title: 'Archives Deleted', message: `${data?.count || 0} archives permanently removed.` });
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

    const renderTableActions = (selectedIds: string[], count: number, onRestore: () => void, onDelete: () => void, label: string) => (
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                {selectedIds.length} {label} Selected
            </Typography>
            <Stack direction="row" spacing={1}>
                <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<RecoveryConvert size={16} />}
                    disabled={selectedIds.length === 0}
                    onClick={onRestore}
                    sx={{ borderRadius: 1.5 }}
                >
                    Restore Selected
                </Button>
                <Button
                    size="small"
                    variant="contained"
                    color="error"
                    startIcon={<Trash size={16} />}
                    disabled={selectedIds.length === 0}
                    onClick={() => {
                        openAlert({
                            title: 'Permanent Delete Selected?',
                            message: `Are you sure you want to permanently delete ${selectedIds.length} items? This cannot be undone.`,
                            variant: 'error',
                            showCancel: true,
                            confirmText: 'Delete All Forever',
                            onConfirm: onDelete
                        });
                    }}
                    sx={{ borderRadius: 1.5 }}
                >
                    Delete Permanently
                </Button>
            </Stack>
        </Box>
    );

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
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        px: 3,
                        pt: 2
                    }}
                >
                    <Tab label={<Stack direction="row" spacing={1} alignItems="center"><UserIcon size={18} /><span>Users ({deletedUsers?.length || 0})</span></Stack>} />
                    <Tab label={<Stack direction="row" spacing={1} alignItems="center"><Building size={18} /><span>Units ({deletedUnits?.length || 0})</span></Stack>} />
                    <Tab label={<Stack direction="row" spacing={1} alignItems="center"><Note size={18} /><span>Applications ({deletedApps?.length || 0})</span></Stack>} />
                    <Tab label={<Stack direction="row" spacing={1} alignItems="center"><DocumentText size={18} /><span>Forms ({deletedForms?.length || 0})</span></Stack>} />
                    <Tab label={<Stack direction="row" spacing={1} alignItems="center"><ArchiveBook size={18} /><span>Archives ({deletedArchives?.length || 0})</span></Stack>} />
                </Tabs>

                <Box sx={{ p: 3 }}>
                    {/* USERS TAB */}
                    {activeTab === 0 && (
                        <>
                            {usersLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box> : (deletedUsers || []).length === 0 ? <Alert severity="info">No deleted users</Alert> : (
                                <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                                    {renderTableActions(selectedUsers, (deletedUsers || []).length, () => bulkRestoreUsersMutation.mutate(selectedUsers), () => bulkPermanentDeleteUsersMutation.mutate(selectedUsers), "Users")}
                                    <Table>
                                        <TableHead sx={{ bgcolor: theme.palette.grey[50] }}>
                                            <TableRow>
                                                <TableCell padding="checkbox"><Checkbox checked={selectedUsers.length === (deletedUsers || []).length} onChange={(e) => setSelectedUsers(e.target.checked ? (deletedUsers || []).map((u: any) => u.id) : [])} /></TableCell>
                                                <TableCell>User</TableCell>
                                                <TableCell>Role</TableCell>
                                                <TableCell>Time Remaining</TableCell>
                                                <TableCell align="center">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {(deletedUsers || []).map((user: any) => (
                                                <TableRow key={user.id} hover selected={selectedUsers.includes(user.id)}>
                                                    <TableCell padding="checkbox"><Checkbox checked={selectedUsers.includes(user.id)} onChange={() => setSelectedUsers(selectedUsers.includes(user.id) ? selectedUsers.filter(id => id !== user.id) : [...selectedUsers, user.id])} /></TableCell>
                                                    <TableCell><Typography variant="subtitle2">{user.name}</Typography><Typography variant="caption">{user.email}</Typography></TableCell>
                                                    <TableCell><Chip label={user.role} size="small" /></TableCell>
                                                    <TableCell><Chip label={getTimeRemaining(user.deleted_at)} color={isExpired(user.deleted_at) ? 'error' : 'warning'} size="small" /></TableCell>
                                                    <TableCell align="center">
                                                        <IconButton onClick={() => restoreUserMutation.mutate(user.id)} color="success"><RecoveryConvert size={18} /></IconButton>
                                                        <IconButton onClick={() => permanentDeleteUserMutation.mutate(user.id)} color="error"><Trash size={18} /></IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </>
                    )}

                    {/* UNITS TAB */}
                    {activeTab === 1 && (
                        <>
                            {/* Similar structure for Units */}
                            {unitsLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box> : (deletedUnits || []).length === 0 ? <Alert severity="info">No deleted units</Alert> : (
                                <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                                    {renderTableActions(selectedUnits, (deletedUnits || []).length, () => bulkRestoreUnitsMutation.mutate(selectedUnits), () => bulkPermanentDeleteUnitsMutation.mutate(selectedUnits), "Units")}
                                    <Table>
                                        <TableHead sx={{ bgcolor: theme.palette.grey[50] }}>
                                            <TableRow>
                                                <TableCell padding="checkbox"><Checkbox checked={selectedUnits.length === (deletedUnits || []).length} onChange={(e) => setSelectedUnits(e.target.checked ? (deletedUnits || []).map((u: any) => u.id) : [])} /></TableCell>
                                                <TableCell>Unit</TableCell>
                                                <TableCell>Department</TableCell>
                                                <TableCell>Time Remaining</TableCell>
                                                <TableCell align="center">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {(deletedUnits || []).map((unit: any) => (
                                                <TableRow key={unit.id} hover selected={selectedUnits.includes(unit.id)}>
                                                    <TableCell padding="checkbox"><Checkbox checked={selectedUnits.includes(unit.id)} onChange={() => setSelectedUnits(selectedUnits.includes(unit.id) ? selectedUnits.filter(id => id !== unit.id) : [...selectedUnits, unit.id])} /></TableCell>
                                                    <TableCell><Typography variant="subtitle2">{unit.name}</Typography></TableCell>
                                                    <TableCell>{unit.department}</TableCell>
                                                    <TableCell><Chip label={getTimeRemaining(unit.deleted_at)} color={isExpired(unit.deleted_at) ? 'error' : 'warning'} size="small" /></TableCell>
                                                    <TableCell align="center">
                                                        <IconButton onClick={() => restoreUnitMutation.mutate(unit.id)} color="success"><RecoveryConvert size={18} /></IconButton>
                                                        <IconButton onClick={() => permanentDeleteUnitMutation.mutate(unit.id)} color="error"><Trash size={18} /></IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </>
                    )}

                    {/* APPLICATIONS TAB */}
                    {activeTab === 2 && (
                        <>
                            {appsLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box> : (deletedApps || []).length === 0 ? <Alert severity="info">No deleted applications</Alert> : (
                                <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                                    {renderTableActions(selectedApplications, (deletedApps || []).length, () => bulkRestoreAppsMutation.mutate(selectedApplications), () => bulkPermanentDeleteAppsMutation.mutate(selectedApplications), "Applications")}
                                    <Table>
                                        <TableHead sx={{ bgcolor: theme.palette.grey[50] }}>
                                            <TableRow>
                                                <TableCell padding="checkbox"><Checkbox checked={selectedApplications.length === (deletedApps || []).length} onChange={(e) => setSelectedApplications(e.target.checked ? (deletedApps || []).map((a: any) => a.id) : [])} /></TableCell>
                                                <TableCell>Institution</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Time Remaining</TableCell>
                                                <TableCell align="center">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {(deletedApps || []).map((app: any) => (
                                                <TableRow key={app.id} hover selected={selectedApplications.includes(app.id)}>
                                                    <TableCell padding="checkbox"><Checkbox checked={selectedApplications.includes(app.id)} onChange={() => setSelectedApplications(selectedApplications.includes(app.id) ? selectedApplications.filter(id => id !== app.id) : [...selectedApplications, app.id])} /></TableCell>
                                                    <TableCell><Typography variant="subtitle2">{app.institution_name}</Typography></TableCell>
                                                    <TableCell><Chip label={app.status} size="small" /></TableCell>
                                                    <TableCell><Chip label={getTimeRemaining(app.deleted_at)} color={isExpired(app.deleted_at) ? 'error' : 'warning'} size="small" /></TableCell>
                                                    <TableCell align="center">
                                                        <IconButton onClick={() => restoreAppMutation.mutate(app.id)} color="success"><RecoveryConvert size={18} /></IconButton>
                                                        <IconButton onClick={() => permanentDeleteAppMutation.mutate(app.id)} color="error"><Trash size={18} /></IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </>
                    )}

                    {/* FORMS TAB */}
                    {activeTab === 3 && (
                        <>
                            {formsLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box> : (deletedForms || []).length === 0 ? <Alert severity="info">No deleted forms</Alert> : (
                                <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                                    {renderTableActions(selectedForms, (deletedForms || []).length, () => bulkRestoreFormsMutation.mutate(selectedForms), () => bulkPermanentDeleteFormsMutation.mutate(selectedForms), "Forms")}
                                    <Table>
                                        <TableHead sx={{ bgcolor: theme.palette.grey[50] }}>
                                            <TableRow>
                                                <TableCell padding="checkbox"><Checkbox checked={selectedForms.length === (deletedForms || []).length} onChange={(e) => setSelectedForms(e.target.checked ? (deletedForms || []).map((f: any) => f.id) : [])} /></TableCell>
                                                <TableCell>Form Title</TableCell>
                                                <TableCell>Slug</TableCell>
                                                <TableCell>Time Remaining</TableCell>
                                                <TableCell align="center">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {(deletedForms || []).map((form: any) => (
                                                <TableRow key={form.id} hover selected={selectedForms.includes(form.id)}>
                                                    <TableCell padding="checkbox"><Checkbox checked={selectedForms.includes(form.id)} onChange={() => setSelectedForms(selectedForms.includes(form.id) ? selectedForms.filter(id => id !== form.id) : [...selectedForms, form.id])} /></TableCell>
                                                    <TableCell><Typography variant="subtitle2">{form.title}</Typography></TableCell>
                                                    <TableCell>{form.slug}</TableCell>
                                                    <TableCell><Chip label={getTimeRemaining(form.deleted_at)} color={isExpired(form.deleted_at) ? 'error' : 'warning'} size="small" /></TableCell>
                                                    <TableCell align="center">
                                                        <IconButton onClick={() => restoreFormMutation.mutate(form.id)} color="success"><RecoveryConvert size={18} /></IconButton>
                                                        <IconButton onClick={() => permanentDeleteFormMutation.mutate(form.id)} color="error"><Trash size={18} /></IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </>
                    )}

                    {/* ARCHIVES TAB */}
                    {activeTab === 4 && (
                        <>
                            {archivesLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box> : (deletedArchives || []).length === 0 ? <Alert severity="info">No deleted archives</Alert> : (
                                <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                                    {renderTableActions(selectedArchives, (deletedArchives || []).length, () => bulkRestoreArchivesMutation.mutate(selectedArchives), () => bulkPermanentDeleteArchivesMutation.mutate(selectedArchives), "Archives")}
                                    <Table>
                                        <TableHead sx={{ bgcolor: theme.palette.grey[50] }}>
                                            <TableRow>
                                                <TableCell padding="checkbox"><Checkbox checked={selectedArchives.length === (deletedArchives || []).length} onChange={(e) => setSelectedArchives(e.target.checked ? (deletedArchives || []).map((a: any) => a.id) : [])} /></TableCell>
                                                <TableCell>Institution</TableCell>
                                                <TableCell>Document</TableCell>
                                                <TableCell>Time Remaining</TableCell>
                                                <TableCell align="center">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {(deletedArchives || []).map((archive: any) => (
                                                <TableRow key={archive.id} hover selected={selectedArchives.includes(archive.id)}>
                                                    <TableCell padding="checkbox"><Checkbox checked={selectedArchives.includes(archive.id)} onChange={() => setSelectedArchives(selectedArchives.includes(archive.id) ? selectedArchives.filter(id => id !== archive.id) : [...selectedArchives, archive.id])} /></TableCell>
                                                    <TableCell><Typography variant="subtitle2">{archive.institution_name}</Typography></TableCell>
                                                    <TableCell>{archive.document_name}</TableCell>
                                                    <TableCell><Chip label={getTimeRemaining(archive.deleted_at)} color={isExpired(archive.deleted_at) ? 'error' : 'warning'} size="small" /></TableCell>
                                                    <TableCell align="center">
                                                        <IconButton onClick={() => restoreArchiveMutation.mutate(archive.id)} color="success"><RecoveryConvert size={18} /></IconButton>
                                                        <IconButton onClick={() => permanentDeleteArchiveMutation.mutate(archive.id)} color="error"><Trash size={18} /></IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
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
