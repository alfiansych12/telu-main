'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Button,
    Stack,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControlLabel,
    Checkbox,
    IconButton,
    Chip,
    Divider,
    useTheme,
    alpha
} from '@mui/material';
import {
    DocumentText,
    Add,
    Edit,
    Trash,
    Eye,
    AddSquare,
    CloseCircle,
    TickCircle,
    Code,
    Magicpen,
    CalendarTick
} from 'iconsax-react';

// PROJECT IMPORTS
import MainCard from 'components/MainCard';

interface NotificationTemplate {
    id: string;
    template_key: string;
    template_name: string;
    title: string;
    message_template: string;
    description: string | null;
    variables: any;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

const SAMPLE_VARIABLES = {
    supervisor_name: 'John Doe',
    intern_list: '1. <b>Alice Smith</b> (IT Support)\n2. <b>Bob Johnson</b> (Network Team)',
    absent_count: '2',
    timestamp: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
};

export default function TemplateManagementPage() {
    const theme = useTheme();
    const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        template_key: '',
        template_name: '',
        title: '',
        message_template: '',
        description: '',
        is_active: true
    });

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/notifications/templates');
            const data = await response.json();
            if (data.success) {
                setTemplates(data.templates);
            }
        } catch (err) {
            setError('Failed to fetch templates');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (template: NotificationTemplate) => {
        setEditingTemplate(template);
        setFormData({
            template_key: template.template_key,
            template_name: template.template_name,
            title: template.title,
            message_template: template.message_template,
            description: template.description || '',
            is_active: template.is_active
        });
        setIsCreating(false);
    };

    const handleCreate = () => {
        setEditingTemplate(null);
        setFormData({
            template_key: '',
            template_name: '',
            title: '',
            message_template: '',
            description: '',
            is_active: true
        });
        setIsCreating(true);
    };

    const handleSave = async () => {
        setError(null);
        setSuccess(null);

        try {
            const url = editingTemplate
                ? `/api/notifications/templates/${editingTemplate.id}`
                : '/api/notifications/templates';

            const method = editingTemplate ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(editingTemplate ? 'Template updated!' : 'Template created!');
                setEditingTemplate(null);
                setIsCreating(false);
                fetchTemplates();
            } else {
                setError(data.error || 'Failed to save template');
            }
        } catch (err) {
            setError('Failed to save template');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this template?')) return;

        try {
            const response = await fetch(`/api/notifications/templates/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Template deleted!');
                fetchTemplates();
            } else {
                setError(data.error || 'Failed to delete template');
            }
        } catch (err) {
            setError('Failed to delete template');
        }
    };

    const renderPreview = () => {
        let preview = formData.message_template;
        Object.entries(SAMPLE_VARIABLES).forEach(([key, value]) => {
            preview = preview.replace(new RegExp(`{${key}}`, 'g'), value);
        });
        return preview;
    };

    const handleCloseDialog = () => {
        setIsCreating(false);
        setEditingTemplate(null);
        setPreviewMode(false);
    };

    return (
        <Box sx={{ px: 1 }}>
            {/* Header */}
            <Box sx={{
                mb: 3,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                gap: 2
            }}>
                <Stack spacing={0.5}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Template Notifikasi
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Kelola template pesan notifikasi Telegram
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        bgcolor: alpha(theme.palette.primary.lighter, 0.2),
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                    }}>
                        <CalendarTick size={20} color={theme.palette.primary.main} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.primary.darker }}>
                            {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleCreate}
                    >
                        Buat Template Baru
                    </Button>
                </Stack>
            </Box>

            {/* Success/Error Alerts */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            {/* Templates List */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : templates.length === 0 ? (
                <MainCard sx={{ textAlign: 'center', py: 8 }}>
                    <Stack spacing={2} alignItems="center">
                        <DocumentText size={48} variant="Bulk" color={theme.palette.text.secondary} />
                        <Typography variant="h5">Belum Ada Template</Typography>
                        <Typography variant="body2" color="textSecondary">
                            Buat template notifikasi pertama Anda untuk memulai
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={<AddSquare />}
                            onClick={handleCreate}
                        >
                            Buat Sekarang
                        </Button>
                    </Stack>
                </MainCard>
            ) : (
                <Grid container spacing={3}>
                    {templates.map((template) => (
                        <Grid item xs={12} lg={6} key={template.id}>
                            <MainCard>
                                <Stack spacing={2}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="h5" sx={{ fontWeight: 600 }}>{template.template_name}</Typography>
                                                <Chip
                                                    label={template.is_active ? 'Aktif' : 'Nonaktif'}
                                                    size="small"
                                                    color={template.is_active ? 'success' : 'default'}
                                                    variant="combined"
                                                />
                                            </Stack>
                                            <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontFamily: 'monospace' }}>
                                                {template.template_key}
                                            </Typography>
                                        </Box>
                                        <Stack direction="row" spacing={0.5}>
                                            <IconButton color="primary" onClick={() => handleEdit(template)}>
                                                <Edit size={20} />
                                            </IconButton>
                                            <IconButton color="error" onClick={() => handleDelete(template.id)}>
                                                <Trash size={20} />
                                            </IconButton>
                                        </Stack>
                                    </Box>

                                    {template.description && (
                                        <Typography variant="body2" color="textSecondary">
                                            {template.description}
                                        </Typography>
                                    )}

                                    <Divider />

                                    <Stack spacing={1.5}>
                                        <Box>
                                            <Typography variant="caption" color="textSecondary" sx={{ mb: 0.5, display: 'block' }}>Title:</Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{template.title}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="textSecondary" sx={{ mb: 0.5, display: 'block' }}>Message Preview:</Typography>
                                            <Box sx={{
                                                p: 1.5,
                                                bgcolor: alpha(theme.palette.grey[100], 0.5),
                                                borderRadius: 1,
                                                border: `1px solid ${theme.palette.divider}`
                                            }}>
                                                <Typography variant="caption" sx={{
                                                    fontFamily: 'monospace',
                                                    whiteSpace: 'pre-wrap',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 4,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}>
                                                    {template.message_template}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Stack>

                                    <Box sx={{ pt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                                        <Typography variant="caption" color="textSecondary">
                                            Updated: {new Date(template.updated_at).toLocaleDateString('id-ID')}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </MainCard>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Editor Dialog */}
            <Dialog
                open={isCreating || !!editingTemplate}
                onClose={handleCloseDialog}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle sx={{ p: 3, pb: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {editingTemplate ? 'Edit Template' : 'Buat Template Baru'}
                        </Typography>
                        <IconButton onClick={handleCloseDialog}>
                            <CloseCircle />
                        </IconButton>
                    </Stack>
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Template Key"
                                    placeholder="e.g., attendance_reminder"
                                    value={formData.template_key}
                                    onChange={(e) => setFormData({ ...formData, template_key: e.target.value })}
                                    disabled={!!editingTemplate}
                                    helperText="Unique identifier (tidak bisa diubah setelah dibuat)"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Nama Template"
                                    placeholder="e.g., Reminder Presensi"
                                    value={formData.template_name}
                                    onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                                />
                            </Grid>
                        </Grid>

                        <TextField
                            fullWidth
                            label="Judul Notifikasi"
                            placeholder="e.g., 🔔 Notifikasi Presensi"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />

                        <Box>
                            <TextField
                                fullWidth
                                multiline
                                rows={10}
                                label="Template Pesan"
                                placeholder="Gunakan {variable_name} untuk placeholder"
                                value={formData.message_template}
                                onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
                                InputProps={{
                                    sx: { fontFamily: 'monospace', fontSize: '0.875rem' }
                                }}
                            />
                            <Box sx={{
                                mt: 1,
                                p: 1.5,
                                bgcolor: alpha(theme.palette.primary.lighter, 0.1),
                                borderRadius: 1.5,
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                            }}>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                    <Code size={14} color={theme.palette.primary.main} />
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                                        Variabel yang tersedia:
                                    </Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                    {Object.keys(SAMPLE_VARIABLES).map((key) => (
                                        <Chip
                                            key={key}
                                            label={`{${key}}`}
                                            size="small"
                                            variant="combined"
                                            sx={{ mb: 0.5, fontFamily: 'monospace' }}
                                        />
                                    ))}
                                </Stack>
                            </Box>
                        </Box>

                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Deskripsi"
                            placeholder="Opsional"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                            }
                            label="Template aktif"
                        />

                        <Box>
                            <Button
                                variant="text"
                                color="primary"
                                startIcon={<Eye />}
                                onClick={() => setPreviewMode(!previewMode)}
                                size="small"
                            >
                                {previewMode ? 'Sembunyikan' : 'Tampilkan'} Preview
                            </Button>
                            {previewMode && (
                                <Box sx={{
                                    mt: 1,
                                    p: 2,
                                    bgcolor: alpha(theme.palette.grey[100], 0.5),
                                    borderRadius: 1.5,
                                    border: `1px solid ${theme.palette.divider}`
                                }}>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                        <Magicpen size={14} variant="Bulk" color={theme.palette.secondary.main} />
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                                            Preview dengan sample data:
                                        </Typography>
                                    </Stack>
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'serif' }}>
                                        {renderPreview()}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button color="error" onClick={handleCloseDialog}>Batal</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        startIcon={<TickCircle />}
                    >
                        Simpan Template
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
