'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Stack,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Button,
    TextField,
    InputAdornment,
    alpha,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Divider,
    MenuItem,
    Snackbar,
    Alert,
    TablePagination,
    CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
    SearchNormal1,
    Eye,
    TickCircle,
    CloseCircle,
    Calendar,
    Building,
    DocumentDownload,
    Magicpen,
    DocumentUpload,
    Trash
} from 'iconsax-react';
import { useQuery } from '@tanstack/react-query';
import { getManagementPageData } from 'utils/api/batch';
import { bulkImportRegistrations } from 'utils/api/import-registrations';
import BulkRegistrationImportDialog from './components/BulkRegistrationImportDialog';
import RecycleBinDialog from '../components/RecycleBinDialog';
import { openAlert } from 'api/alert';

const ApplicationsView = () => {
    const theme = useTheme();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<any | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [successDialog, setSuccessDialog] = useState<{ open: boolean; data: any }>({ open: false, data: null });
    const [bulkImportOpen, setBulkImportOpen] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string | 'all'; title: string }>({ open: false, id: '', title: '' });
    const [isDeleting, setIsDeleting] = useState(false);
    const [recycleBinOpen, setRecycleBinOpen] = useState(false);

    // Fetch reference data (units) for bulk import
    const { data: referenceData } = useQuery({
        queryKey: ['management-reference-data'],
        queryFn: () => getManagementPageData({ fetchOnlyReference: true }),
        staleTime: 300000,
    });

    const allUnitsData = referenceData?.allUnitsData?.data || [];

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (search) queryParams.append('search', search);
            if (statusFilter !== 'all') queryParams.append('status', statusFilter);
            queryParams.append('page', (page + 1).toString());
            queryParams.append('pageSize', rowsPerPage.toString());

            const res = await fetch(`/api/registration/applications?${queryParams}`);
            const data = await res.json();

            if (data.success) {
                setApplications(data.applications);
                setTotal(data.pagination?.total || 0);
            }
        } catch (error) {
            console.error('Failed to fetch applications', error);
            setSnackbar({ open: true, message: 'Failed to load applications', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchApplications();
        }, 500); // Debounce search
        return () => clearTimeout(timer);
    }, [search, statusFilter, page, rowsPerPage]);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/registration/applications/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();

            if (data.success) {
                setApplications(apps => apps.map(app => app.id === id ? { ...app, status: newStatus } : app));
                setSelectedApp(null); // Close dialog if open

                // If approved and user was created, show success dialog with credentials
                if (newStatus === 'approved' && data.createdUser) {
                    setSuccessDialog({
                        open: true,
                        data: {
                            message: data.message,
                            user: data.createdUser,
                            application: data.application
                        }
                    });
                } else {
                    setSnackbar({ open: true, message: data.message || `Application ${newStatus} successfully`, severity: 'success' });
                }
            } else {
                setSnackbar({ open: true, message: data.error || 'Update failed', severity: 'error' });
            }
        } catch (error) {
            console.error('Error updating status:', error);
            setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' });
        }
    };

    const handleBulkImport = async (data: any[], unitIds: string[]) => {
        setIsImporting(true);
        try {
            const formsRes = await fetch('/api/registration/forms');
            const formsData = await formsRes.json();
            const targetForm = formsData.forms?.find((f: any) => f.is_active) || formsData.forms?.[0];

            if (!targetForm) {
                setSnackbar({ open: true, message: 'No registration form found to attach imports to.', severity: 'error' });
                return;
            }

            const result = await bulkImportRegistrations(targetForm.id, unitIds, data);

            if (result.success) {
                setSnackbar({ open: true, message: result.message || 'Bulk import successful', severity: 'success' });
                setBulkImportOpen(false);
                fetchApplications(); // Refresh list
            } else {
                setSnackbar({ open: true, message: result.message || 'Import failed', severity: 'error' });
            }
        } catch (error: any) {
            console.error('Bulk import error:', error);
            setSnackbar({ open: true, message: error.message || 'System error during import', severity: 'error' });
        } finally {
            setIsImporting(false);
        }
    };

    const handleDelete = async (id: string | 'all') => {
        setIsDeleting(true);
        try {
            const url = id === 'all'
                ? `/api/registration/applications?all=true${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}`
                : `/api/registration/applications/${id}`;

            const res = await fetch(url, { method: 'DELETE' });
            const data = await res.json();

            if (data.success) {
                setSnackbar({ open: true, message: data.message || 'Moved to Recycle Bin', severity: 'success' });
                setDeleteConfirm({ open: false, id: '', title: '' });
                fetchApplications(); // Refresh list
            } else {
                setSnackbar({ open: true, message: data.error || 'Failed to move to Recycle Bin', severity: 'error' });
            }
        } catch (error) {
            console.error('Delete error:', error);
            setSnackbar({ open: true, message: 'Failed to delete application', severity: 'error' });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteClick = (id: string | 'all', title: string) => {
        openAlert({
            title: id === 'all' ? 'Move All to Recycle Bin?' : 'Move to Recycle Bin?',
            message: id === 'all'
                ? `Are you sure you want to move all currently filtered applications to the Recycle Bin? They will be kept for 48 hours.`
                : `Are you sure you want to move the application from "${title}" to the Recycle Bin?`,
            variant: 'error',
            showCancel: true,
            confirmText: 'Move to Recycle Bin',
            onConfirm: () => handleDelete(id)
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'success';
            case 'rejected': return 'error';
            default: return 'warning';
        }
    };

    return (
        <Box sx={{ p: { xs: 1, md: 3 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900 }}>Incoming Applications</Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                        MANAGE STUDENT SUBMISSIONS FROM REGISTRATION FORMS
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1.5}>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Trash size={20} />}
                        sx={{ borderRadius: 2 }}
                        onClick={() => handleDeleteClick('all', statusFilter === 'all' ? 'All Applications' : `All ${statusFilter} Applications`)}
                        disabled={applications.length === 0}
                    >
                        Delete All
                    </Button>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<DocumentUpload size={20} />}
                        sx={{ borderRadius: 2 }}
                        onClick={() => setBulkImportOpen(true)}
                    >
                        Bulk Import
                    </Button>
                    <Button variant="contained" color="primary" startIcon={<DocumentDownload size={20} variant="Bold" />} sx={{ borderRadius: 2, px: 3 }}>
                        Export to Excel
                    </Button>
                </Stack>
            </Stack>

            <Paper sx={{ mb: 3, p: 2, borderRadius: 3, border: '1px solid #eee' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <TextField
                        placeholder="Search student or institution..."
                        size="small"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(0);
                        }}
                        sx={{ flexGrow: 1 }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchNormal1 size={18} /></InputAdornment>,
                        }}
                    />
                    <TextField
                        select
                        size="small"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(0);
                        }}
                        sx={{ minWidth: 150 }}
                    >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                    </TextField>
                </Stack>
            </Paper>

            <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #eee', overflow: 'hidden' }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800 }}>Institution</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Form</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Apply Date</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 800 }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>Loading...</TableCell>
                            </TableRow>
                        ) : applications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>No applications found.</TableCell>
                            </TableRow>
                        ) : (
                            applications.map((app) => (
                                <TableRow key={app.id} hover>
                                    <TableCell>
                                        <Stack direction="row" spacing={1.5} alignItems="center">
                                            <Building size={20} variant="Bold" color={theme.palette.primary.main} />
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{app.institution_name}</Typography>
                                                <Typography variant="caption" color="textSecondary">ID: {app.id.substring(0, 8)}</Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{app.form?.title || 'Unknown Form'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Calendar size={16} color={theme.palette.text.secondary} />
                                            <Typography variant="body2">{new Date(app.created_at).toLocaleDateString()}</Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={app.status.toUpperCase()}
                                            size="small"
                                            color={getStatusColor(app.status)}
                                            variant="light"
                                            sx={{ fontWeight: 800, borderRadius: 1.5 }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title="View Details">
                                                <IconButton size="small" onClick={() => setSelectedApp(app)} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), color: theme.palette.primary.main }}>
                                                    <Eye size={18} />
                                                </IconButton>
                                            </Tooltip>
                                            {app.status === 'pending' && (
                                                <>
                                                    <Tooltip title="Approve">
                                                        <IconButton size="small" onClick={() => handleUpdateStatus(app.id, 'approved')} sx={{ bgcolor: alpha(theme.palette.success.main, 0.05), color: theme.palette.success.main }}>
                                                            <TickCircle size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Reject">
                                                        <IconButton size="small" onClick={() => handleUpdateStatus(app.id, 'rejected')} sx={{ bgcolor: alpha(theme.palette.error.main, 0.05), color: theme.palette.error.main }}>
                                                            <CloseCircle size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDeleteClick(app.id, app.institution_name)}
                                                    sx={{ bgcolor: alpha(theme.palette.error.main, 0.05), color: theme.palette.error.main }}
                                                >
                                                    <Trash size={18} />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={total}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{
                        borderTop: '1px solid #eee',
                        '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                            fontWeight: 600,
                            color: 'text.secondary'
                        }
                    }}
                />
            </TableContainer>

            {/* Detail Dialog */}
            <Dialog open={!!selectedApp} onClose={() => setSelectedApp(null)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ p: 3, borderBottom: '1px solid #eee' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h4" sx={{ fontWeight: 900 }}>Application Details</Typography>
                        <Chip label={selectedApp?.status.toUpperCase()} color={getStatusColor(selectedApp?.status || '')} variant="light" sx={{ fontWeight: 800 }} />
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    <Grid container>
                        <Grid item xs={12} md={4} sx={{ p: 3, borderRight: '1px solid #eee', bgcolor: '#fafafa' }}>
                            <Stack spacing={3}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Building size={48} color={theme.palette.primary.main} variant="Bold" style={{ margin: '0 auto 16px' }} />
                                    <Typography variant="h5" sx={{ fontWeight: 900 }}>{selectedApp?.institution_name}</Typography>
                                    <Typography variant="caption" color="textSecondary">Submitted: {new Date(selectedApp?.created_at).toLocaleDateString()}</Typography>
                                </Box>
                                <Divider />
                                <Box>
                                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>APPLIED FOR</Typography>
                                    <Typography variant="body2">{selectedApp?.form?.title}</Typography>
                                </Box>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={8} sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Form Responses</Typography>
                            <Stack spacing={2}>
                                {selectedApp && selectedApp.responses && Object.entries(selectedApp.responses as Record<string, any>).map(([key, value]) => {
                                    return (
                                        <Paper key={key} variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#fcfcfc' }}>
                                            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                                                Question ID: {key}
                                            </Typography>
                                            <Typography variant="body1" sx={{ fontWeight: 600, mt: 0.5 }}>
                                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                            </Typography>
                                        </Paper>
                                    );
                                })}
                            </Stack>

                            {selectedApp?.status === 'pending' && (
                                <Box sx={{ mt: 4, p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05), border: `1px dashed ${theme.palette.info.main}` }}>
                                    <Typography variant="subtitle2" sx={{ color: theme.palette.info.main, fontWeight: 800 }}>Admin Note:</Typography>
                                    <Typography variant="body2">This application is pending review. You can convert this student to a system user after approval.</Typography>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: '1px solid #eee' }}>
                    <Button onClick={() => setSelectedApp(null)} color="inherit">Close</Button>
                    <Box sx={{ flexGrow: 1 }} />
                    {selectedApp?.status === 'pending' && (
                        <>
                            <Button variant="contained" color="error" onClick={() => handleUpdateStatus(selectedApp.id, 'rejected')}>Reject</Button>
                            <Button variant="contained" color="primary" startIcon={<Magicpen variant="Bold" />} onClick={() => handleUpdateStatus(selectedApp.id, 'approved')}>Approve & Create Account</Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* Success Dialog */}
            <Dialog open={successDialog.open} onClose={() => setSuccessDialog({ open: false, data: null })} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ p: 3, bgcolor: alpha(theme.palette.success.main, 0.1), borderBottom: `2px solid ${theme.palette.success.main}` }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ p: 1.5, bgcolor: theme.palette.success.main, borderRadius: 2, color: 'white', display: 'flex' }}>
                            <TickCircle size={32} variant="Bold" />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 900, color: theme.palette.success.main }}>Application Approved!</Typography>
                            <Typography variant="caption" color="textSecondary">User account created successfully</Typography>
                        </Box>
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    {successDialog.data && (
                        <Stack spacing={3} sx={{ mt: 2 }}>
                            <Alert severity="success" sx={{ borderRadius: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>✅ New participant account has been created!</Typography>
                            </Alert>
                            <Paper sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.03), borderRadius: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: theme.palette.primary.main }}>📧 LOGIN CREDENTIALS</Typography>
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700 }}>Email (Username)</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{successDialog.data.user?.email}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700 }}>Temporary Password</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.warning.main, 0.1), px: 1, borderRadius: 1 }}>
                                            {successDialog.data.message?.match(/Password: ([^\n]+)/)?.[1] || 'password123'}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: '1px solid #eee' }}>
                    <Button onClick={() => setSuccessDialog({ open: false, data: null })} variant="contained">Done</Button>
                </DialogActions>
            </Dialog>

            {/* Bulk Import Dialog */}
            <BulkRegistrationImportDialog
                open={bulkImportOpen}
                onClose={() => setBulkImportOpen(false)}
                units={allUnitsData}
                formId="default-form"
                formTitle="Excel Registration Import"
                onImport={handleBulkImport}
                isLoading={isImporting}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirm.open} onClose={() => !isDeleting && setDeleteConfirm({ ...deleteConfirm, open: false })}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Trash color={theme.palette.error.main} variant="Bold" />
                    Confirm Delete
                </DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete <strong>{deleteConfirm.title}</strong>? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setDeleteConfirm({ ...deleteConfirm, open: false })} color="inherit" disabled={isDeleting}>Cancel</Button>
                    <Button
                        onClick={() => handleDelete(deleteConfirm.id)}
                        variant="contained"
                        color="error"
                        disabled={isDeleting}
                        startIcon={isDeleting && <CircularProgress size={16} color="inherit" />}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, mb: 1 }}>
                <Tooltip title="View Recycle Bin">
                    <IconButton
                        onClick={() => setRecycleBinOpen(true)}
                        sx={{
                            color: theme.palette.grey[500],
                            bgcolor: alpha(theme.palette.grey[500], 0.05),
                            '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.1) }
                        }}
                    >
                        <Trash size={18} variant="Bold" />
                    </IconButton>
                </Tooltip>
            </Box>

            <RecycleBinDialog
                open={recycleBinOpen}
                onClose={() => setRecycleBinOpen(false)}
            />
        </Box>
    );
};

export default ApplicationsView;
