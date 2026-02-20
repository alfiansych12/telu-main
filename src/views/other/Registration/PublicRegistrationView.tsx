'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Container,
    Paper,
    TextField,
    Button,
    Grid,
    Stack,
    CircularProgress,
    Alert,
    MenuItem,
    Divider,
    LinearProgress,
    Chip,
    alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ArrowLeft, TickCircle, InfoCircle, Briefcase, Calendar, Location, Flash } from 'iconsax-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getPublicUnits } from 'utils/api/units';
import { bulkImportRegistrations } from 'utils/api/import-registrations';
import BulkRegistrationImportDialog from '../Admin/Registration/components/BulkRegistrationImportDialog';

interface Field {
    id: string;
    label: string;
    type: 'text' | 'number' | 'email' | 'date' | 'select' | 'file' | 'textarea';
    required: boolean;
    options?: string[]; // comma separated
    placeholder?: string;
}

interface Form {
    id: string;
    title: string;
    description: string;
    fields: Field[];
    slug: string;
}

const PublicRegistrationView = ({ slug }: { slug: string }) => {
    const theme = useTheme();
    const router = useRouter();
    const [form, setForm] = useState<Form | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [responses, setResponses] = useState<Record<string, any>>({});
    const [formFiles, setFormFiles] = useState<Record<string, { name: string, url: string, type: string }>>({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [bulkImportOpen, setBulkImportOpen] = useState(false);
    const [applicationId, setApplicationId] = useState('');
    const [attachedBulkData, setAttachedBulkData] = useState<any[] | null>(null);
    const [attachedUnitIds, setAttachedUnitIds] = useState<string[]>([]);

    // Fetch reference data (units) for bulk import (Public version)
    const { data: publicUnits } = useQuery({
        queryKey: ['public-units-lookup'],
        queryFn: () => getPublicUnits(),
        staleTime: 300000,
    });

    const allUnitsData = publicUnits || [];

    useEffect(() => {
        const fetchForm = async () => {
            try {
                const res = await fetch(`/api/registration/public/${slug}`);
                const data = await res.json();
                if (data.success) {
                    setForm(data.form);
                } else {
                    setError(data.error || 'Position no longer available');
                }
            } catch (err) {
                setError('Failed to connect to the recruitment system');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchForm();
        }
    }, [slug]);

    const handleInputChange = (fieldId: string, value: any) => {
        setResponses(prev => ({
            ...prev,
            [fieldId]: value
        }));
    };

    // Calculate completion progress
    const calculateProgress = () => {
        if (!form) return 0;
        const requiredFields = form.fields.filter(f => f.required);
        if (requiredFields.length === 0) return 100;
        const filledRequired = requiredFields.filter(f => {
            if (f.type === 'file') return !!formFiles[f.id];
            return responses[f.id] && responses[f.id].toString().trim() !== '';
        });
        return Math.round((filledRequired.length / requiredFields.length) * 100);
    };

    const handleFileChange = async (fieldId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const reader = new FileReader();
            reader.onload = () => {
                setFormFiles(prev => ({
                    ...prev,
                    [fieldId]: {
                        name: file.name,
                        url: reader.result as string,
                        type: file.type
                    }
                }));
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error('File read error:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form) return;

        setSubmitting(true);
        setError('');

        try {
            const isMainFormEmpty = Object.values(responses).every(v => !v || v.toString().trim() === '') && Object.keys(formFiles).length === 0;
            const hasBulkData = attachedBulkData && attachedBulkData.length > 0;

            if (isMainFormEmpty && !hasBulkData) {
                throw new Error('Please fill out the form or attach a bulk data file.');
            }

            // Only validate main form if it's NOT empty (user intended to fill it) 
            // OR if there is NO bulk data (meaning main form is the only way)
            if (!isMainFormEmpty || !hasBulkData) {
                const missingFields = form.fields
                    .filter(f => {
                        if (!f.required) return false;
                        if (f.type === 'file') return !formFiles[f.id];
                        return !responses[f.id] || responses[f.id].toString().trim() === '';
                    })
                    .map(f => f.label);

                if (missingFields.length > 0) {
                    throw new Error(`Please complete the following required fields: ${missingFields.join(', ')}`);
                }
            }

            let mainSubmissionId = null;

            if (hasBulkData) {
                // PRIORITAS: Jika ada data bulk, hanya kirim bulk (Batch Mode)
                try {
                    const result = await bulkImportRegistrations(form.id, attachedUnitIds, attachedBulkData!, formFiles);
                    if (result.success && result.submissions && result.submissions.length > 0) {
                        mainSubmissionId = `REG-BATCH-${result.submissions[0].id.substring(0, 8).toUpperCase()}`;
                    }
                } catch (bulkErr) {
                    console.error('Failed to send bulk data part:', bulkErr);
                    throw new Error('Gagal memproses pendaftaran masal.');
                }
            } else if (!isMainFormEmpty) {
                // Hanya kirim individual jika form diisi DAN tidak ada bulk data
                const instField = form.fields.find(f =>
                    f.label.toLowerCase().includes('institution') ||
                    f.label.toLowerCase().includes('school') ||
                    f.label.toLowerCase().includes('university') ||
                    f.label.toLowerCase().includes('sekolah') ||
                    f.label.toLowerCase().includes('kampus') ||
                    f.label.toLowerCase().includes('asal')
                );

                let institution_name = 'Unspecified';
                if (instField) {
                    institution_name = instField.type === 'file' ? formFiles[instField.id]?.name : responses[instField.id];
                } else {
                    institution_name = Object.values(responses)[0] || Object.values(formFiles)[0]?.name || 'Unspecified';
                }

                // Strip extension if it's a file name
                if (typeof institution_name === 'string' && institution_name.includes('.')) {
                    institution_name = institution_name.split('.').slice(0, -1).join('.');
                }

                const payload = {
                    form_id: form.id,
                    institution_name: String(institution_name),
                    responses: responses,
                    files: formFiles
                };

                const res = await fetch('/api/registration/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                const data = await res.json();
                if (!data.success) throw new Error(data.error || 'Submission failed');
                mainSubmissionId = data.submission.application_id;
            }

            setSuccess(true);
            if (mainSubmissionId) setApplicationId(mainSubmissionId);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleBulkImport = async (data: any[], unitIds: string[]) => {
        // Now it just stores in state, doesn't call API yet
        setAttachedBulkData(data);
        setAttachedUnitIds(unitIds);
        setBulkImportOpen(false);
        // Scroll to the bottom to see the attachment
        setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: 2 }}>
                <CircularProgress thickness={2} size={40} />
                <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>Loading application details...</Typography>
            </Box>
        );
    }

    if (error && !form) {
        return (
            <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
                <Paper sx={{ p: 6, borderRadius: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
                    <InfoCircle size={60} color={theme.palette.error.main} variant="TwoTone" />
                    <Typography variant="h4" fontWeight={700} sx={{ mt: 3, mb: 1 }}>Access Denied</Typography>
                    <Typography color="textSecondary" sx={{ mb: 4 }}>
                        {error}
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<ArrowLeft />}
                        onClick={() => router.push('/registration')}
                        sx={{ borderRadius: 3, px: 4 }}
                    >
                        Return to Portal
                    </Button>
                </Paper>
            </Container>
        );
    }

    if (success) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#F4F7FA', py: 12 }}>
                <Container maxWidth="sm">
                    <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, boxShadow: '0 30px 60px rgba(0,0,0,0.08)' }}>
                        <Box sx={{
                            width: 100, height: 100, borderRadius: '50%',
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            color: theme.palette.success.main,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            mx: 'auto', mb: 4
                        }}>
                            <TickCircle size={60} variant="Bold" />
                        </Box>
                        <Typography variant="h3" fontWeight={800} sx={{ mb: 2, letterSpacing: -1 }}>
                            Submission Received
                        </Typography>
                        <Typography color="textSecondary" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.6 }}>
                            Thank you for applying for the <strong>{form?.title}</strong> position. Your application is now being reviewed by our recruitment team.
                        </Typography>

                        <Box sx={{ bgcolor: '#F8F9FB', p: 3, borderRadius: 3, border: '1px dashed', borderColor: 'divider', mb: 4 }}>
                            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                                Application ID
                            </Typography>
                            <Typography variant="h4" sx={{ mt: 1, fontFamily: 'monospace', fontWeight: 800, color: theme.palette.primary.main }}>
                                {applicationId}
                            </Typography>
                        </Box>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => router.push('/registration')}
                                sx={{ borderRadius: 3, px: 6, py: 1.5, fontWeight: 700 }}
                            >
                                Back to Portal
                            </Button>
                        </Stack>
                    </Paper>
                </Container>
            </Box>
        );
    }

    const progress = calculateProgress();

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F4F7FA', pb: 12 }}>
            {/* Header */}
            <Box sx={{ bgcolor: '#fff', py: 2, borderBottom: '1px solid', borderColor: 'divider', position: 'sticky', top: 0, zIndex: 1000 }}>
                <Container maxWidth="lg">
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Button
                            startIcon={<ArrowLeft />}
                            onClick={() => router.push('/registration')}
                            sx={{ color: 'text.secondary', fontWeight: 600 }}
                        >
                            Back to Portal
                        </Button>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700 }}>APPLICATION PROGRESS</Typography>
                            <Box sx={{ width: 100 }}>
                                <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3 }} />
                            </Box>
                            <Typography variant="caption" sx={{ fontWeight: 800 }}>{progress}%</Typography>
                        </Stack>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mt: 6 }}>
                <Grid container spacing={6}>
                    {/* Sidebar Info */}
                    <Grid item xs={12} md={4}>
                        <Stack spacing={4}>
                            <Box>
                                <Chip label="HIRING NOW" color="primary" size="small" sx={{ fontWeight: 700, mb: 2, borderRadius: 1.5 }} />
                                <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: -1, mb: 2 }}>
                                    {form?.title}
                                </Typography>
                                <Typography color="textSecondary" sx={{ lineHeight: 1.7 }}>
                                    {form?.description}
                                </Typography>
                            </Box>

                            <Divider />

                            <Stack spacing={3}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ p: 1, bgcolor: '#fff', borderRadius: 2, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                        <Briefcase size={24} color={theme.palette.primary.main} variant="Bold" />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>POSITION TYPE</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 700 }}>Internship / Training</Typography>
                                    </Box>
                                </Stack>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ p: 1, bgcolor: '#fff', borderRadius: 2, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                        <Location size={24} color={theme.palette.primary.main} variant="Bold" />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>LOCATION</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 700 }}>Online / Work from Home</Typography>
                                    </Box>
                                </Stack>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ p: 1, bgcolor: '#fff', borderRadius: 2, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                        <Calendar size={24} color={theme.palette.primary.main} variant="Bold" />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>DURATION</Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 700 }}>3 - 6 Months</Typography>
                                    </Box>
                                </Stack>
                            </Stack>

                            <Paper sx={{ p: 3, bgcolor: alpha(theme.palette.info.main, 0.05), border: '1px solid', borderColor: alpha(theme.palette.info.main, 0.1), borderRadius: 3 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <InfoCircle size={20} /> Recruitment Note
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                    Please ensure all the information provided is accurate and all attachments are clearly readable.
                                </Typography>
                            </Paper>
                        </Stack>
                    </Grid>

                    {/* Main Form */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: { xs: 4, md: 6 }, borderRadius: 5, boxShadow: '0 20px 50px rgba(0,0,0,0.04)' }}>
                            <Box sx={{ mb: 6 }}>
                                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: -1 }}>
                                    Application Form
                                </Typography>
                                <Typography color="textSecondary">
                                    Provide your professional information below to begin the selection process.
                                </Typography>
                            </Box>

                            {error && (
                                <Alert severity="error" variant="filled" sx={{ mb: 4, borderRadius: 2.5 }}>
                                    {error}
                                </Alert>
                            )}

                            <form onSubmit={handleSubmit}>
                                <Grid container spacing={4}>
                                    {form?.fields.map((field) => (
                                        <Grid item xs={12} key={field.id}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, ml: 0.5, display: 'flex', alignItems: 'center' }}>
                                                {field.label} {(field.required && !attachedBulkData) && <span style={{ color: theme.palette.error.main, marginLeft: '4px' }}>*</span>}
                                            </Typography>

                                            {field.type === 'select' ? (
                                                <TextField
                                                    select
                                                    fullWidth
                                                    required={field.required && !attachedBulkData}
                                                    value={responses[field.id] || ''}
                                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                    variant="outlined"
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#FAFBFC' } }}
                                                >
                                                    {field.options?.map((opt) => (
                                                        <MenuItem key={opt} value={opt}>
                                                            {opt}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            ) : field.type === 'textarea' ? (
                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    rows={4}
                                                    required={field.required && !attachedBulkData}
                                                    placeholder={field.placeholder}
                                                    value={responses[field.id] || ''}
                                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                    variant="outlined"
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#FAFBFC' } }}
                                                />
                                            ) : field.type === 'file' ? (
                                                <Box>
                                                    <Button
                                                        variant="outlined"
                                                        component="label"
                                                        fullWidth
                                                        sx={{
                                                            py: 2,
                                                            borderRadius: 3,
                                                            borderStyle: 'dashed',
                                                            bgcolor: '#FAFBFC',
                                                            color: formFiles[field.id] ? theme.palette.success.main : 'text.secondary',
                                                            borderColor: formFiles[field.id] ? theme.palette.success.main : 'divider'
                                                        }}
                                                    >
                                                        {formFiles[field.id] ? `✅ ${formFiles[field.id].name}` : (field.placeholder || 'Choose File / Upload Document')}
                                                        <input
                                                            type="file"
                                                            hidden
                                                            required={field.required && !formFiles[field.id] && !attachedBulkData}
                                                            onChange={(e) => handleFileChange(field.id, e)}
                                                        />
                                                    </Button>
                                                    {formFiles[field.id] && (
                                                        <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
                                                            File selected: {formFiles[field.id].name}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            ) : (
                                                <TextField
                                                    fullWidth
                                                    type={field.type}
                                                    required={field.required && !attachedBulkData}
                                                    placeholder={field.placeholder}
                                                    value={responses[field.id] || ''}
                                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                    variant="outlined"
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#FAFBFC' } }}
                                                    InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
                                                />
                                            )}
                                        </Grid>
                                    ))}

                                    <Grid item xs={12} sx={{ mt: 2 }}>
                                        <Divider sx={{ mb: 4, mt: 1 }}>
                                            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 700 }}>ATTACH BULK DATA (OPTIONAL)</Typography>
                                        </Divider>

                                        {attachedBulkData ? (
                                            <Paper variant="outlined" sx={{ p: 2, mb: 4, borderRadius: 3, borderColor: theme.palette.success.main, bgcolor: alpha(theme.palette.success.main, 0.02) }}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Box sx={{ p: 1, bgcolor: theme.palette.success.main, borderRadius: 2, color: 'white', display: 'flex' }}>
                                                            <TickCircle size={24} variant="Bold" />
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Excel Attached</Typography>
                                                            <Typography variant="caption" color="textSecondary">{attachedBulkData.length} students ready to be registered.</Typography>
                                                        </Box>
                                                    </Stack>
                                                    <Button size="small" color="error" onClick={() => setAttachedBulkData(null)}>Clear</Button>
                                                </Stack>
                                            </Paper>
                                        ) : (
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                fullWidth
                                                startIcon={<Flash size={20} variant="Bold" />}
                                                sx={{
                                                    py: 1.8,
                                                    borderRadius: 3,
                                                    fontWeight: 800,
                                                    borderStyle: 'dashed',
                                                    borderWidth: 2,
                                                    mb: 4,
                                                    '&:hover': { borderWidth: 2 }
                                                }}
                                                onClick={() => setBulkImportOpen(true)}
                                            >
                                                BULK IMPORT (EXCEL)
                                            </Button>
                                        )}

                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            fullWidth
                                            disabled={submitting}
                                            sx={{
                                                py: 2,
                                                fontWeight: 800,
                                                borderRadius: 3,
                                                fontSize: '1rem',
                                                boxShadow: `0 10px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                                                '&:hover': {
                                                    boxShadow: `0 15px 30px ${alpha(theme.palette.primary.main, 0.4)}`,
                                                }
                                            }}
                                        >
                                            {submitting ? (
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <CircularProgress size={20} color="inherit" />
                                                    <span>PROCESSING APPLICATION...</span>
                                                </Stack>
                                            ) : 'SUBMIT MY APPLICATION'}
                                        </Button>

                                        <Typography variant="caption" sx={{ mt: 3, display: 'block', textAlign: 'center', color: 'text.secondary', fontWeight: 500 }}>
                                            By submitting, you agree to our recruitment terms and data privacy policy.
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </form>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            <BulkRegistrationImportDialog
                open={bulkImportOpen}
                onClose={() => setBulkImportOpen(false)}
                units={allUnitsData}
                formId={form?.id || ''}
                formTitle={form?.title || 'Registration'}
                onImport={handleBulkImport}
                isLoading={false}
            />
        </Box>
    );
};

export default PublicRegistrationView;
