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
import { ArrowLeft, TickCircle, InfoCircle, Briefcase, Calendar, Location } from 'iconsax-react';
import { useRouter } from 'next/navigation';

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
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [applicationId, setApplicationId] = useState('');

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
        const filledRequired = requiredFields.filter(f => responses[f.id] && responses[f.id].toString().trim() !== '');
        return Math.round((filledRequired.length / requiredFields.length) * 100);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form) return;

        setSubmitting(true);
        setError('');

        try {
            const missingFields = form.fields
                .filter(f => f.required && (!responses[f.id] || responses[f.id].toString().trim() === ''))
                .map(f => f.label);

            if (missingFields.length > 0) {
                throw new Error(`Please complete the following required fields: ${missingFields.join(', ')}`);
            }

            const instField = form.fields.find(f =>
                f.label.toLowerCase().includes('institution') ||
                f.label.toLowerCase().includes('school') ||
                f.label.toLowerCase().includes('university') ||
                f.label.toLowerCase().includes('sekolah') ||
                f.label.toLowerCase().includes('kampus') ||
                f.label.toLowerCase().includes('asal')
            );

            const institution_name = instField ? responses[instField.id] : (Object.values(responses)[0] || 'Unspecified');

            const payload = {
                form_id: form.id,
                institution_name: String(institution_name),
                responses: responses,
                files: {}
            };

            const res = await fetch('/api/registration/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (data.success) {
                setSuccess(true);
                setApplicationId(data.submission.application_id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                throw new Error(data.error || 'The system was unable to process your application at this time.');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
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
                            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: -1 }}>
                                Application Form
                            </Typography>
                            <Typography color="textSecondary" sx={{ mb: 6 }}>
                                Provide your professional information below to begin the selection process.
                            </Typography>

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
                                                {field.label} {field.required && <span style={{ color: theme.palette.error.main, marginLeft: '4px' }}>*</span>}
                                            </Typography>

                                            {field.type === 'select' ? (
                                                <TextField
                                                    select
                                                    fullWidth
                                                    required={field.required}
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
                                                    required={field.required}
                                                    placeholder={field.placeholder}
                                                    value={responses[field.id] || ''}
                                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                    variant="outlined"
                                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#FAFBFC' } }}
                                                />
                                            ) : (
                                                <TextField
                                                    fullWidth
                                                    type={field.type}
                                                    required={field.required}
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
                                        <Typography variant="caption" sx={{ mt: 2, display: 'block', textAlign: 'center', color: 'text.secondary', fontWeight: 500 }}>
                                            By submitting, you agree to our recruitment terms and data privacy policy.
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </form>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default PublicRegistrationView;
