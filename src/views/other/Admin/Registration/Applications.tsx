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
    Alert
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
    Copy
} from 'iconsax-react';



const ApplicationsView = () => {
    const theme = useTheme();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<any | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [successDialog, setSuccessDialog] = useState<{ open: boolean; data: any }>({ open: false, data: null });

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (search) queryParams.append('search', search);
            if (statusFilter !== 'all') queryParams.append('status', statusFilter);

            const res = await fetch(`/api/registration/applications?${queryParams}`);
            const data = await res.json();

            if (data.success) {
                setApplications(data.applications);
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
    }, [search, statusFilter]);

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
                    <Button variant="outlined" startIcon={<Magicpen size={20} />} sx={{ borderRadius: 2 }}>
                        Bulk Process
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
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{ flexGrow: 1 }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchNormal1 size={18} /></InputAdornment>,
                        }}
                    />
                    <TextField
                        select
                        size="small"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
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
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
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
                                    // Try to find the label from the field ID if possible, otherwise use ID
                                    // In a real app, you might want to store labels in submission or fetch form definition
                                    return (
                                        <Paper key={key} variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#fcfcfc' }}>
                                            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                                                {/* Display key or label */}
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

            {/* Success Dialog with Credentials */}
            <Dialog
                open={successDialog.open}
                onClose={() => setSuccessDialog({ open: false, data: null })}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{
                    p: 3,
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    borderBottom: `2px solid ${theme.palette.success.main}`
                }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{
                            p: 1.5,
                            bgcolor: theme.palette.success.main,
                            borderRadius: 2,
                            color: 'white',
                            display: 'flex'
                        }}>
                            <TickCircle size={32} variant="Bold" />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 900, color: theme.palette.success.main }}>
                                Application Approved!
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                User account created successfully
                            </Typography>
                        </Box>
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    {successDialog.data && (
                        <Stack spacing={3} sx={{ mt: 2 }}>
                            <Alert severity="success" sx={{ borderRadius: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    ✅ New participant account has been created and is ready to use!
                                </Typography>
                            </Alert>

                            <Paper sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.03), borderRadius: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: theme.palette.primary.main }}>
                                    📧 LOGIN CREDENTIALS
                                </Typography>
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700 }}>
                                            Name
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                                {successDialog.data.user?.name}
                                            </Typography>
                                        </Stack>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700 }}>
                                            Email (Username)
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                                                {successDialog.data.user?.email}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(successDialog.data.user?.email || '');
                                                    setSnackbar({ open: true, message: 'Email copied!', severity: 'success' });
                                                }}
                                                sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                                            >
                                                <Copy size={16} />
                                            </IconButton>
                                        </Stack>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700 }}>
                                            Temporary Password
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    fontWeight: 700,
                                                    fontFamily: 'monospace',
                                                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                                                    px: 1.5,
                                                    py: 0.5,
                                                    borderRadius: 1,
                                                    color: theme.palette.warning.dark
                                                }}
                                            >
                                                {successDialog.data.message?.match(/Password: ([^\n]+)/)?.[1] || 'N/A'}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    const password = successDialog.data.message?.match(/Password: ([^\n]+)/)?.[1];
                                                    if (password) {
                                                        navigator.clipboard.writeText(password);
                                                        setSnackbar({ open: true, message: 'Password copied!', severity: 'success' });
                                                    }
                                                }}
                                                sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}
                                            >
                                                <Copy size={16} />
                                            </IconButton>
                                        </Stack>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700 }}>
                                            ID Number
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                            {successDialog.data.user?.id_number || '-'}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Paper>

                            <Alert severity="warning" sx={{ borderRadius: 2 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                    ⚠️ NEXT STEPS:
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                    1. Copy the credentials above<br />
                                    2. Send them to the participant via email/WhatsApp<br />
                                    3. Remind them to change their password after first login
                                </Typography>
                            </Alert>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: '1px solid #eee' }}>
                    <Button
                        onClick={() => {
                            const credentials = `Login Credentials for ${successDialog.data?.user?.name}\n\n` +
                                `Email: ${successDialog.data?.user?.email}\n` +
                                `Password: ${successDialog.data?.message?.match(/Password: ([^\n]+)/)?.[1]}\n\n` +
                                `Please login at: ${window.location.origin}/login`;
                            navigator.clipboard.writeText(credentials);
                            setSnackbar({ open: true, message: 'Full credentials copied!', severity: 'success' });
                        }}
                        variant="outlined"
                        startIcon={<Copy />}
                    >
                        Copy All Credentials
                    </Button>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button
                        onClick={() => setSuccessDialog({ open: false, data: null })}
                        variant="contained"
                    >
                        Done
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
        </Box >
    );
};

export default ApplicationsView;
