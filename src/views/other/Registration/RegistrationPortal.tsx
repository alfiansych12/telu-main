'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Container,
    Chip,
    CircularProgress,
    Stack,
    InputBase,
    alpha
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import {
    Briefcase,
    ArrowRight,
    Calendar,
    SecuritySafe,
    SearchNormal,
    Location,
    Building
} from 'iconsax-react';

// Define Interface for Form
interface RegistrationForm {
    id: string;
    title: string;
    description: string;
    slug: string;
    created_at: string;
}

const RegistrationPortal = () => {
    const theme = useTheme();
    const router = useRouter();
    const [forms, setForms] = useState<RegistrationForm[]>([]);
    const [filteredForms, setFilteredForms] = useState<RegistrationForm[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchForms();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredForms(forms);
        } else {
            const filtered = forms.filter(f =>
                f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredForms(filtered);
        }
    }, [searchQuery, forms]);

    const fetchForms = async () => {
        try {
            const res = await fetch('/api/registration/public');
            const data = await res.json();
            if (data.forms) {
                setForms(data.forms);
                setFilteredForms(data.forms);
            } else {
                setError('Failed to load opportunities');
            }
        } catch (err) {
            console.error('Error fetching forms:', err);
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = (slug: string) => {
        router.push(`/registration/${slug}`);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress thickness={2} size={40} />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F4F7FA' }}>
            {/* Header / Nav Mock */}
            <Box sx={{ bgcolor: '#fff', py: 2, borderBottom: '1px solid', borderColor: 'divider', position: 'sticky', top: 0, zIndex: 1000 }}>
                <Container maxWidth="lg">
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{
                                width: 40, height: 40, bgcolor: theme.palette.primary.main, borderRadius: 1.5,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                            }}>
                                <SecuritySafe variant="Bold" />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.text.primary, letterSpacing: -0.5 }}>
                                Puti Careers
                            </Typography>
                        </Stack>
                        <Button
                            variant="outlined"
                            color="inherit"
                            size="small"
                            onClick={() => router.push('/login')}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                        >
                            Staff Portal
                        </Button>
                    </Stack>
                </Container>
            </Box>

            {/* Hero Section */}
            <Box sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: '#fff',
                pt: { xs: 8, md: 12 },
                pb: { xs: 12, md: 16 },
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative Elements */}
                <Box sx={{
                    position: 'absolute', top: -100, right: -100, width: 400, height: 400,
                    borderRadius: '50%', background: 'rgba(255,255,255,0.05)', zIndex: 1
                }} />
                <Box sx={{
                    position: 'absolute', bottom: -50, left: '10%', width: 200, height: 200,
                    borderRadius: '50%', background: 'rgba(255,255,255,0.03)', zIndex: 1
                }} />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                    <Stack spacing={3} alignItems="center" textAlign="center">
                        <Chip
                            label="EXCISE YOUR POTENTIAL"
                            size="small"
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.15)',
                                color: '#fff',
                                fontWeight: 700,
                                px: 1,
                                backdropFilter: 'blur(4px)',
                                border: '1px solid rgba(255,255,255,0.3)'
                            }}
                        />
                        <Typography variant="h1" sx={{
                            fontWeight: 800,
                            fontSize: { xs: '2.5rem', md: '4rem' },
                            lineHeight: 1.1,
                            letterSpacing: -1
                        }}>
                            Find Your <span style={{ color: '#FFD700' }}>Future</span> Today
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.85, fontWeight: 400, maxWidth: 600 }}>
                            Join the Puti Internship program and gain real-world experience in an environment designed for your professional growth.
                        </Typography>

                        {/* Search Bar */}
                        <Box sx={{
                            mt: 4,
                            width: '100%',
                            maxWidth: 700,
                            bgcolor: '#fff',
                            borderRadius: 4,
                            p: 1.5,
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                            display: 'flex',
                            gap: 1
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, px: 2 }}>
                                <SearchNormal size={20} color="#666" />
                                <InputBase
                                    sx={{ ml: 2, flex: 1, fontWeight: 500 }}
                                    placeholder="Search for positions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </Box>
                            <Button
                                variant="contained"
                                size="large"
                                sx={{ borderRadius: 3, px: 4, textTransform: 'none', fontWeight: 700 }}
                            >
                                Find Jobs
                            </Button>
                        </Box>
                    </Stack>
                </Container>
            </Box>

            {/* Main Content */}
            <Container maxWidth="lg" sx={{ mt: -8, pb: 10, position: 'relative', zIndex: 5 }}>
                {error ? (
                    <Box sx={{ textAlign: 'center', p: 8, bgcolor: '#fff', borderRadius: 4, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        <Typography color="error" variant="h6">{error}</Typography>
                    </Box>
                ) : filteredForms.length === 0 ? (
                    <Box sx={{ textAlign: 'center', p: 8, bgcolor: '#fff', borderRadius: 4, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        <Typography variant="h6" color="textSecondary">No active opportunities found at this time.</Typography>
                    </Box>
                ) : (
                    <Grid container spacing={4}>
                        {filteredForms.map((form) => (
                            <Grid item xs={12} md={6} lg={4} key={form.id}>
                                <Card sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: 4,
                                    border: '1px solid transparent',
                                    transition: 'all 0.3s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-10px)',
                                        boxShadow: '0 30px 60px rgba(0,0,0,0.12)',
                                        borderColor: theme.palette.primary.light
                                    }
                                }}>
                                    <CardContent sx={{ p: 4, flexGrow: 1 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                                            <Box sx={{
                                                p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                borderRadius: 2.5, color: theme.palette.primary.main
                                            }}>
                                                <Briefcase size={28} variant="Bold" />
                                            </Box>
                                            <Chip
                                                label="Full-time / Remote"
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    borderRadius: 1.5, fontWeight: 600, fontSize: '0.7rem',
                                                    borderColor: 'rgba(0,0,0,0.08)', bgcolor: '#fafafa'
                                                }}
                                            />
                                        </Stack>

                                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, letterSpacing: -0.5 }}>
                                            {form.title}
                                        </Typography>

                                        <Stack direction="row" spacing={2} sx={{ mb: 2.5 }}>
                                            <Stack direction="row" spacing={0.5} alignItems="center">
                                                <Building size={16} color="#666" />
                                                <Typography variant="caption" fontWeight={600} color="textSecondary">Puti Inc.</Typography>
                                            </Stack>
                                            <Stack direction="row" spacing={0.5} alignItems="center">
                                                <Location size={16} color="#666" />
                                                <Typography variant="caption" fontWeight={600} color="textSecondary">Online</Typography>
                                            </Stack>
                                        </Stack>

                                        <Typography
                                            variant="body2"
                                            color="textSecondary"
                                            sx={{
                                                mb: 3,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                lineHeight: 1.6
                                            }}
                                        >
                                            {form.description}
                                        </Typography>

                                        <Box sx={{ mt: 'auto' }}>
                                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                                                <Calendar size={18} color={theme.palette.primary.main} />
                                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                                    Posted on {new Date(form.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </Typography>
                                            </Stack>

                                            <Button
                                                fullWidth
                                                variant="contained"
                                                onClick={() => handleApply(form.slug)}
                                                endIcon={<ArrowRight size={18} />}
                                                sx={{
                                                    py: 1.5,
                                                    borderRadius: 2.5,
                                                    fontWeight: 700,
                                                    textTransform: 'none',
                                                    boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.25)}`,
                                                    '&:hover': {
                                                        boxShadow: `0 12px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                                                    }
                                                }}
                                            >
                                                Apply Position
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>

            {/* Footer Mock */}
            <Box sx={{ bgcolor: '#fff', py: 6, mt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4} justifyContent="space-between">
                        <Grid item xs={12} md={4}>
                            <Typography variant="h6" fontWeight={700} gutterBottom>Puti Management</Typography>
                            <Typography variant="body2" color="textSecondary">
                                Simplifying internship recruitment and placement for educational institutions and businesses.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Stack direction="row" spacing={4} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, cursor: 'pointer' }}>Privacy Policy</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, cursor: 'pointer' }}>Terms of Service</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600, cursor: 'pointer' }}>Contact Support</Typography>
                            </Stack>
                        </Grid>
                    </Grid>
                    <Typography variant="caption" sx={{ mt: 6, display: 'block', textAlign: 'center', opacity: 0.5 }}>
                        © 2026 Puti Inc. All rights reserved. Registered under Digital Registration Systems.
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};

export default RegistrationPortal;
