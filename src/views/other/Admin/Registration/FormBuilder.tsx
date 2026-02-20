'use client';

import React, { useState } from 'react';
import {
    Box,
    Typography,
    Stack,
    Button,
    Paper,
    Grid,
    TextField,
    MenuItem,
    IconButton,
    Card,
    CardContent,
    Switch,
    FormControlLabel,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    alpha,
    Snackbar,
    Alert,
    CircularProgress,
    Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
    Add,
    Trash,
    Eye,
    ArrowUp,
    ArrowDown,
    DocumentText,
    MenuBoard,
    Calendar,
    Clock,
    TickCircle,
    Import,
    Personalcard,
    Trash as TrashIcon
} from 'iconsax-react';
import RecycleBinDialog from '../components/RecycleBinDialog';

// Types for Dynamic Form
type FieldType = 'text' | 'number' | 'date' | 'time' | 'select' | 'checkbox' | 'file' | 'textarea';

interface FormField {
    id: string;
    label: string;
    type: FieldType;
    required: boolean;
    options?: string[]; // for select/checkbox
    placeholder?: string;
}

const FormBuilder = () => {
    const theme = useTheme();
    const [formTitle, setFormTitle] = useState('Internship Registration Form 2026');
    const [formDescription, setFormDescription] = useState('Please fill out this form to submit your internship application.');
    const [formSlug, setFormSlug] = useState('magang-2026');
    const [isActive, setIsActive] = useState(true);
    const [fields, setFields] = useState<FormField[]>([
        { id: '1', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter student full name' },
        { id: '2', label: 'Student ID (NIM/NISN)', type: 'text', required: true },
        { id: '3', label: 'Origin Institution', type: 'text', required: true }
    ]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'edit'>('list');
    const [existingForms, setExistingForms] = useState<any[]>([]);
    const [editingFormId, setEditingFormId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [formToDelete, setFormToDelete] = useState<any>(null);
    const [recycleBinOpen, setRecycleBinOpen] = useState(false);

    // Fetch existing forms
    const fetchForms = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/registration/forms');
            const data = await res.json();
            if (data.success) {
                setExistingForms(data.forms);
            }
        } catch (error) {
            console.error('Error fetching forms:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (viewMode === 'list') {
            fetchForms();
        }
    }, [viewMode]);

    const handleEditForm = (form: any) => {
        setEditingFormId(form.id);
        setFormTitle(form.title);
        setFormDescription(form.description || '');
        setFormSlug(form.slug);
        setIsActive(form.is_active);
        setFields(form.fields || []);
        setViewMode('edit');
    };

    const handleDeleteClick = (form: any) => {
        setFormToDelete(form);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!formToDelete) return;

        try {
            const res = await fetch(`/api/registration/forms/${formToDelete.id}`, {
                method: 'DELETE'
            });
            const data = await res.json();

            if (data.success) {
                setSnackbar({ open: true, message: data.message || 'Form moved to Recycle Bin', severity: 'success' });
                fetchForms();
                setDeleteConfirmOpen(false);
                setFormToDelete(null);
            } else {
                // Check if it's because of existing submissions
                if (data.canForceDelete && data.submissionCount > 0) {
                    // Close current dialog and show detailed options
                    setDeleteConfirmOpen(false);

                    // Show detailed dialog with options
                    const submissionStats = data.submissionStats;
                    const statsText = `
                        Total Submissions: ${submissionStats.total}
                        - Pending: ${submissionStats.pending}
                        - Approved: ${submissionStats.approved}
                        - Rejected: ${submissionStats.rejected}
                    `;

                    setSnackbar({
                        open: true,
                        message: `This form has ${data.submissionCount} submission(s). Check console for details.`,
                        severity: 'error'
                    });

                    // Show custom dialog with options
                    setTimeout(() => {
                        if (window.confirm(
                            `⚠️ WARNING: This form has ${data.submissionCount} submission(s)!\n\n` +
                            `Statistics:\n${statsText}\n\n` +
                            `OPTIONS:\n` +
                            `1. CANCEL - Keep the form\n` +
                            `2. DEACTIVATE - Turn off the form (recommended)\n` +
                            `3. FORCE DELETE - Delete form AND all ${data.submissionCount} submissions (PERMANENT!)\n\n` +
                            `Click OK to see options, or Cancel to abort.`
                        )) {
                            // Show action selection
                            const action = window.prompt(
                                `Choose an action:\n\n` +
                                `Type "DEACTIVATE" to turn off the form (recommended)\n` +
                                `Type "FORCE DELETE" to permanently delete everything\n` +
                                `Type "CANCEL" or press Cancel to abort\n\n` +
                                `Your choice:`,
                                'DEACTIVATE'
                            );

                            if (action?.toUpperCase() === 'FORCE DELETE') {
                                handleForceDelete(formToDelete.id, data.submissionCount);
                            } else if (action?.toUpperCase() === 'DEACTIVATE') {
                                handleDeactivateForm(formToDelete.id);
                            } else {
                                setSnackbar({ open: true, message: 'Delete cancelled', severity: 'info' });
                                setFormToDelete(null);
                            }
                        } else {
                            setFormToDelete(null);
                        }
                    }, 500);
                } else {
                    setSnackbar({ open: true, message: data.error || 'Failed to delete form', severity: 'error' });
                }
            }
        } catch (error) {
            console.error('Error deleting form:', error);
            setSnackbar({ open: true, message: 'Error connecting to server', severity: 'error' });
        }
    };

    const handleForceDelete = async (formId: string, submissionCount: number) => {
        const finalConfirm = window.confirm(
            `🚨 FINAL CONFIRMATION 🚨\n\n` +
            `You are about to PERMANENTLY DELETE:\n` +
            `- 1 Registration Form\n` +
            `- ${submissionCount} Submission(s)\n\n` +
            `This action CANNOT be undone!\n\n` +
            `Type "DELETE" in the next prompt to confirm.`
        );

        if (!finalConfirm) {
            setSnackbar({ open: true, message: 'Force delete cancelled', severity: 'info' });
            setFormToDelete(null);
            return;
        }

        const confirmation = window.prompt('Type "DELETE" to confirm permanent deletion:');

        if (confirmation === 'DELETE') {
            try {
                const res = await fetch(`/api/registration/forms/${formId}?force=true`, {
                    method: 'DELETE'
                });
                const data = await res.json();

                if (data.success) {
                    setSnackbar({ open: true, message: data.message, severity: 'success' });
                    fetchForms();
                } else {
                    setSnackbar({ open: true, message: data.error || 'Failed to force delete', severity: 'error' });
                }
            } catch (error) {
                console.error('Error force deleting:', error);
                setSnackbar({ open: true, message: 'Error connecting to server', severity: 'error' });
            }
        } else {
            setSnackbar({ open: true, message: 'Force delete cancelled - confirmation text did not match', severity: 'info' });
        }

        setFormToDelete(null);
    };

    const handleDeactivateForm = async (formId: string) => {
        try {
            // Get current form data
            const currentForm = existingForms.find(f => f.id === formId);
            if (!currentForm) return;

            const res = await fetch(`/api/registration/forms/${formId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: currentForm.title,
                    description: currentForm.description,
                    slug: currentForm.slug,
                    fields: currentForm.fields,
                    is_active: false // Deactivate
                })
            });
            const data = await res.json();

            if (data.success) {
                setSnackbar({
                    open: true,
                    message: '✅ Form deactivated successfully. It is now hidden from public and won\'t accept new submissions.',
                    severity: 'success'
                });
                fetchForms();
            } else {
                setSnackbar({ open: true, message: data.error || 'Failed to deactivate form', severity: 'error' });
            }
        } catch (error) {
            console.error('Error deactivating form:', error);
            setSnackbar({ open: true, message: 'Error connecting to server', severity: 'error' });
        }

        setFormToDelete(null);
    };


    const handleCreateNew = () => {
        setEditingFormId(null);
        setFormTitle('New Internship Registration Form');
        setFormDescription('Please fill out this form to submit your internship application.');
        setFormSlug('new-registration-' + Date.now());
        setIsActive(true);
        setFields([
            { id: '1', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter student full name' },
            { id: '2', label: 'Student ID (NIM/NISN)', type: 'text', required: true },
            { id: '3', label: 'Origin Institution', type: 'text', required: true }
        ]);
        setViewMode('edit');
    };

    // Auto-generate slug from title
    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleTitleChange = (newTitle: string) => {
        setFormTitle(newTitle);
        setFormSlug(generateSlug(newTitle));
    };

    const addField = () => {
        const newField: FormField = {
            id: Date.now().toString(),
            label: 'New Question',
            type: 'text',
            required: false
        };
        setFields([...fields, newField]);
    };

    const updateField = (id: string, updates: Partial<FormField>) => {
        setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const removeField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
    };

    const moveField = (index: number, direction: 'up' | 'down') => {
        const newFields = [...fields];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex >= 0 && targetIndex < newFields.length) {
            const temp = newFields[index];
            newFields[index] = newFields[targetIndex];
            newFields[targetIndex] = temp;
            setFields(newFields);
        }
    };

    const saveForm = async () => {
        if (!formTitle.trim()) {
            setSnackbar({ open: true, message: 'Form title is required', severity: 'error' });
            return;
        }

        setSaving(true);
        try {
            const method = editingFormId ? 'PUT' : 'POST';
            const url = editingFormId ? `/api/registration/forms/${editingFormId}` : '/api/registration/forms';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formTitle,
                    description: formDescription,
                    slug: formSlug,
                    is_active: isActive,
                    fields
                })
            });

            const data = await response.json();
            if (data.success) {
                setSnackbar({ open: true, message: 'Form saved successfully!', severity: 'success' });
                setTimeout(() => setViewMode('list'), 1500);
            } else {
                setSnackbar({ open: true, message: data.error || 'Failed to save form', severity: 'error' });
            }
        } catch (error) {
            console.error('Error saving form:', error);
            setSnackbar({ open: true, message: 'Error connecting to server', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (viewMode === 'list') {
        return (
            <Box sx={{ p: { xs: 1, md: 3 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 900 }}>Registration Forms</Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                            MANAGE PUBLIC REGISTRATION PORTAL AND FORMS
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleCreateNew}
                        sx={{ borderRadius: 2.5, px: 3, py: 1, fontWeight: 700 }}
                    >
                        Create New Form
                    </Button>
                </Stack>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>
                ) : existingForms.length === 0 ? (
                    <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4, border: '2px dashed #eee', bgcolor: 'transparent' }}>
                        <DocumentText size={48} color={theme.palette.text.disabled} />
                        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>No forms created yet.</Typography>
                        <Button variant="text" onClick={handleCreateNew} sx={{ mt: 1 }}>Build your first form</Button>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {existingForms.map((form) => (
                            <Grid item xs={12} md={6} lg={4} key={form.id}>
                                <Card sx={{
                                    height: '100%',
                                    borderRadius: 4,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                                        borderColor: theme.palette.primary.main
                                    }
                                }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                                            <Box sx={{ p: 1, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2, color: theme.palette.primary.main }}>
                                                <MenuBoard size={24} variant="Bold" />
                                            </Box>
                                            <Chip
                                                label={form.is_active ? 'Active' : 'Draft/Inactive'}
                                                size="small"
                                                color={form.is_active ? 'success' : 'default'}
                                                sx={{ fontWeight: 700, borderRadius: 1.5 }}
                                            />
                                        </Stack>
                                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>{form.title}</Typography>
                                        <Typography variant="body2" color="textSecondary" sx={{
                                            mb: 3,
                                            height: 40,
                                            overflow: 'hidden',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical'
                                        }}>
                                            {form.description}
                                        </Typography>
                                        <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                                {form.fields?.length || 0} Fields
                                            </Typography>
                                            <Stack direction="row" spacing={1}>
                                                <Button
                                                    size="small"
                                                    startIcon={<Eye size={16} />}
                                                    onClick={() => handleEditForm(form)}
                                                    sx={{ fontWeight: 700 }}
                                                >
                                                    Edit
                                                </Button>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteClick(form)}
                                                    sx={{
                                                        borderRadius: 1.5,
                                                        bgcolor: alpha(theme.palette.error.main, 0.05),
                                                        '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
                                                    }}
                                                >
                                                    <Trash size={16} />
                                                </IconButton>
                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                    <DialogTitle sx={{ fontWeight: 800 }}>Confirm Delete</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete <strong>{formToDelete?.title}</strong>?
                            This action cannot be undone and will only work if there are no submissions yet.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">Cancel</Button>
                        <Button onClick={confirmDelete} color="error" variant="contained">Move to Recycle Bin</Button>
                    </DialogActions>
                </Dialog>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        startIcon={<TrashIcon size={18} />}
                        onClick={() => setRecycleBinOpen(true)}
                        sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                        Recycle Bin
                    </Button>
                </Box>

                <RecycleBinDialog
                    open={recycleBinOpen}
                    onClose={() => setRecycleBinOpen(false)}
                />

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        );
    }
    return (
        <Box sx={{ p: { xs: 1, md: 3 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton onClick={() => setViewMode('list')} size="small" sx={{ mr: 1 }}>
                            <ArrowUp style={{ transform: 'rotate(-90deg)' }} />
                        </IconButton>
                        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                        <Typography variant="h3" sx={{ fontWeight: 900 }}>
                            {editingFormId ? 'Edit Form' : 'Create New Form'}
                        </Typography>
                    </Stack>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, ml: 6 }}>
                        BUILD DYNAMIC REGISTRATION FORM FOR INTERNS
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<Eye />}
                        onClick={() => setPreviewOpen(true)}
                        sx={{ borderRadius: 2 }}
                    >
                        Preview
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <TickCircle />}
                        onClick={saveForm}
                        disabled={saving}
                        sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
                    >
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </Button>
                </Stack>
            </Stack>

            <Grid container spacing={4}>
                {/* Settings Part */}
                <Grid item xs={12} md={4}>
                    <Stack spacing={3}>
                        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #eee' }}>
                            <Typography variant="h5" sx={{ mb: 2, fontWeight: 800 }}>Basic Info</Typography>
                            <Stack spacing={2.5}>
                                <TextField
                                    fullWidth
                                    label="Form Title"
                                    value={formTitle}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                />
                                <TextField
                                    fullWidth
                                    label="URL Slug"
                                    value={formSlug}
                                    helperText="Unique identifier for URL (lowercase, hyphen only)"
                                    onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    InputProps={{
                                        startAdornment: <Typography variant="caption" color="textSecondary" sx={{ mr: 1 }}>/registration/</Typography>
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    label="Description"
                                    multiline
                                    rows={3}
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                />
                                <FormControlLabel
                                    control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
                                    label="Active Status (Publicly Accessible)"
                                />
                            </Stack>
                        </Paper>

                        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #eee', bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 800 }}>Features Idea</Typography>
                            <Stack spacing={2}>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Box sx={{ p: 1, bgcolor: '#fff', borderRadius: 2, color: theme.palette.primary.main, display: 'flex' }}>
                                        <Import size={20} />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Auto-Create User</Typography>
                                        <Typography variant="caption" color="textSecondary">Map form fields to student profiles</Typography>
                                    </Box>
                                </Stack>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Box sx={{ p: 1, bgcolor: '#fff', borderRadius: 2, color: theme.palette.success.main, display: 'flex' }}>
                                        <Personalcard size={20} />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Identity Verification</Typography>
                                        <Typography variant="caption" color="textSecondary">Students upload ID/Transcript</Typography>
                                    </Box>
                                </Stack>
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid>

                {/* Builder Part */}
                <Grid item xs={12} md={8}>
                    <Stack spacing={2}>
                        {fields.map((field, index) => (
                            <Card
                                key={field.id}
                                variant="outlined"
                                sx={{
                                    borderRadius: 3,
                                    transition: '0.2s',
                                    '&:hover': { borderColor: theme.palette.primary.main, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
                                }}
                            >
                                <CardContent sx={{ p: 2.5 }}>
                                    <Grid container spacing={2} alignItems="flex-start">
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Question / Label"
                                                size="small"
                                                value={field.label}
                                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                                                sx={{ input: { fontWeight: 700 } }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                select
                                                fullWidth
                                                label="Type"
                                                size="small"
                                                value={field.type}
                                                onChange={(e) => updateField(field.id, { type: e.target.value as FieldType })}
                                            >
                                                <MenuItem value="text"><Stack direction="row" spacing={1}><DocumentText size={18} /> <Typography>Plain Text</Typography></Stack></MenuItem>
                                                <MenuItem value="textarea"><Stack direction="row" spacing={1}><MenuBoard size={18} /> <Typography>Paragraph</Typography></Stack></MenuItem>
                                                <MenuItem value="number"><Stack direction="row" spacing={1}><Typography sx={{ fontWeight: 900, width: 18 }}>#</Typography> <Typography>Numbers</Typography></Stack></MenuItem>
                                                <MenuItem value="select"><Stack direction="row" spacing={1}><Add size={18} /> <Typography>Dropdown</Typography></Stack></MenuItem>
                                                <MenuItem value="checkbox"><Stack direction="row" spacing={1}><TickCircle size={18} /> <Typography>Checkboxes</Typography></Stack></MenuItem>
                                                <MenuItem value="date"><Stack direction="row" spacing={1}><Calendar size={18} /> <Typography>Date Picker</Typography></Stack></MenuItem>
                                                <MenuItem value="time"><Stack direction="row" spacing={1}><Clock size={18} /> <Typography>Timestamp</Typography></Stack></MenuItem>
                                                <MenuItem value="file"><Stack direction="row" spacing={1}><Import size={18} /> <Typography>File Upload</Typography></Stack></MenuItem>
                                            </TextField>
                                        </Grid>
                                        <Grid item xs={12} sm={2}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        size="small"
                                                        checked={field.required}
                                                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                                    />
                                                }
                                                label={<Typography variant="caption" sx={{ fontWeight: 700 }}>Required</Typography>}
                                            />
                                        </Grid>

                                        {/* Options Editor for Select/Checkbox */}
                                        {(field.type === 'select' || field.type === 'checkbox') && (
                                            <Grid item xs={12}>
                                                <Box sx={{ mt: 1, p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 800, mb: 1, display: 'block' }}>Options (Comma separated):</Typography>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        placeholder="Option 1, Option 2, Option 3"
                                                        value={field.options?.join(', ') || ''}
                                                        onChange={(e) => updateField(field.id, { options: e.target.value.split(',').map(s => s.trim()) })}
                                                    />
                                                </Box>
                                            </Grid>
                                        )}

                                        <Grid item xs={12}>
                                            <Divider sx={{ my: 1 }} />
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Stack direction="row" spacing={0.5}>
                                                    <IconButton size="small" disabled={index === 0} onClick={() => moveField(index, 'up')}><ArrowUp size={16} /></IconButton>
                                                    <IconButton size="small" disabled={index === fields.length - 1} onClick={() => moveField(index, 'down')}><ArrowDown size={16} /></IconButton>
                                                </Stack>
                                                <IconButton color="error" size="small" onClick={() => removeField(field.id)}><Trash size={18} /></IconButton>
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        ))}

                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<Add />}
                            onClick={addField}
                            sx={{
                                py: 2,
                                borderRadius: 3,
                                border: '2px dashed #ddd',
                                color: 'text.secondary',
                                '&:hover': { borderStyle: 'solid', bgcolor: alpha(theme.palette.primary.main, 0.05), color: theme.palette.primary.main }
                            }}
                        >
                            Add New Question
                        </Button>
                    </Stack>
                </Grid>
            </Grid>

            {/* Preview Dialog */}
            <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ p: 3, bgcolor: theme.palette.primary.main, color: 'white' }}>
                    <Typography variant="h4" sx={{ fontWeight: 800 }}>{formTitle}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>{formDescription}</Typography>
                </DialogTitle>
                <DialogContent sx={{ p: 4 }}>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        {fields.map(field => (
                            <Box key={field.id}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                                    {field.label} {field.required && <Box component="span" sx={{ color: 'red' }}>*</Box>}
                                </Typography>
                                {field.type === 'text' && <TextField fullWidth placeholder={field.placeholder || 'Your answer'} size="small" />}
                                {field.type === 'textarea' && <TextField fullWidth multiline rows={3} placeholder="Your answer" />}
                                {field.type === 'number' && <TextField fullWidth type="number" size="small" />}
                                {field.type === 'date' && <TextField fullWidth type="date" size="small" InputLabelProps={{ shrink: true }} />}
                                {field.type === 'time' && <TextField fullWidth type="time" size="small" InputLabelProps={{ shrink: true }} />}
                                {field.type === 'select' && (
                                    <TextField select fullWidth size="small" defaultValue="">
                                        {field.options?.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                                    </TextField>
                                )}
                                {field.type === 'checkbox' && (
                                    <Stack spacing={1}>
                                        {field.options?.map(opt => (
                                            <FormControlLabel
                                                key={opt}
                                                control={<Switch size="small" />}
                                                label={opt}
                                            />
                                        ))}
                                    </Stack>
                                )}
                                {field.type === 'file' && (
                                    <Box sx={{ border: '1px dashed #ccc', p: 3, borderRadius: 2, textAlign: 'center', bgcolor: '#fafafa' }}>
                                        <Import size={24} color="#666" />
                                        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>Click to upload file</Typography>
                                    </Box>
                                )}
                            </Box>
                        ))}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setPreviewOpen(false)} color="inherit">Close Preview</Button>
                    <Button variant="contained" disabled>Submit (Disabled in Preview)</Button>
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
        </Box>
    );
};

export default FormBuilder;
