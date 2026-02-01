'use client';
import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    Avatar,
    Stack,
    Chip,
    Divider,
    InputAdornment,
    Alert,
    CircularProgress,
    Paper
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
    TickCircle,
    CloseCircle,
    Award,
    Personalcard,
    InfoCircle,
    SearchNormal,
    Refresh,
    CalendarTick
} from 'iconsax-react';
import { useSnackbar } from 'notistack';

// Project Imports
import { validateCertificateByNumber } from 'utils/api/certificate';
import { getCertificateSettings, updateCertificateSettings } from 'utils/api/settings';

type ScanHistory = {
    timestamp: string;
    status: 'valid' | 'invalid';
    data: any;
};

export default function CertificateScanner() {
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();
    const [view, setView] = useState<'scanner' | 'settings'>('scanner');
    const [certNumber, setCertNumber] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [currentResult, setCurrentResult] = useState<any>(null);
    const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Settings state
    const [settings, setSettings] = useState<any>(null);
    const [isSettingsLoading, setIsSettingsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Load settings when view shifts to settings
    useEffect(() => {
        if (view === 'settings') {
            fetchSettings();
        }
    }, [view]);

    const fetchSettings = async () => {
        setIsSettingsLoading(true);
        try {
            const data = await getCertificateSettings();
            setSettings(data);
        } catch (err) {
            enqueueSnackbar('Failed to load certificate settings', { variant: 'error' });
        } finally {
            setIsSettingsLoading(false);
        }
    };

    const handleValidate = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!certNumber.trim()) {
            setError('Please enter certificate number');
            return;
        }

        setError(null);
        setIsValidating(true);
        setCurrentResult(null);

        try {
            const result = await validateCertificateByNumber(certNumber);

            const historyItem: ScanHistory = {
                timestamp: new Date().toISOString(),
                status: result.success ? 'valid' : 'invalid',
                data: result.data || { certNo: certNumber }
            };

            setScanHistory(prev => [historyItem, ...prev].slice(0, 5));

            if (result.success) {
                setCurrentResult({
                    status: 'valid',
                    data: result.data
                });
                enqueueSnackbar('Certificate successfully verified!', { variant: 'success' });
            } else {
                const errorResult = {
                    status: 'error',
                    message: result.message
                };
                setCurrentResult(errorResult);
                setError(result.message || 'Certificate not found');
            }
        } catch (err: any) {
            setError('A system error occurred during validation');
        } finally {
            setIsValidating(false);
        }
    };

    const resetScanner = () => {
        setCertNumber('');
        setCurrentResult(null);
        setError(null);
    };

    const handleSettingsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            hr_officer_name: formData.get('hr_officer_name') as string,
            hr_officer_position: formData.get('hr_officer_position') as string,
            city: formData.get('city') as string,
        };

        setIsUpdating(true);
        try {
            await updateCertificateSettings(data);
            setSettings(data);
            enqueueSnackbar('Certificate settings updated successfully', { variant: 'success' });
        } catch (err) {
            enqueueSnackbar('Failed to update settings', { variant: 'error' });
        } finally {
            setIsUpdating(false);
        }
    };

    const getGradeColor = (grade: string) => {
        const g = grade?.toUpperCase();
        if (['A', 'A-'].includes(g)) return 'success';
        if (['B+', 'B', 'B-'].includes(g)) return 'primary';
        if (['C+', 'C'].includes(g)) return 'warning';
        return 'error';
    };

    return (
        <Box sx={{ p: { xs: 1, md: 3 } }}>
            {/* Header Section */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>Certificate Center</Typography>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        bgcolor: alpha(theme.palette.primary.lighter, 0.2),
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                    }}
                >
                    <CalendarTick size={20} color={theme.palette.primary.main} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.primary.darker || theme.palette.primary.dark }}>
                        {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Typography>
                </Box>
            </Box>

            {/* Navigation Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                    <Paper
                        elevation={view === 'scanner' ? 8 : 0}
                        onClick={() => setView('scanner')}
                        sx={{
                            p: 3,
                            borderRadius: 4,
                            background: view === 'scanner'
                                ? `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                                : alpha(theme.palette.primary.lighter, 0.2),
                            color: view === 'scanner' ? '#fff' : theme.palette.primary.main,
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: view === 'scanner' ? 'scale(1.02)' : 'none',
                            position: 'relative',
                            overflow: 'hidden',
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: view === 'scanner' ? 12 : 4
                            }
                        }}
                    >
                        <Stack spacing={1}>
                            <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500 }}>Certificate</Typography>
                            <Typography variant="h2" sx={{ fontWeight: 800 }}>Scanner</Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.15)', fontSize: '0.75rem', fontWeight: 600 }}>
                                    Check Certificate Authenticity
                                </Box>
                            </Stack>
                        </Stack>
                        <Award
                            variant="Bold"
                            size={140}
                            style={{
                                position: 'absolute',
                                right: -20,
                                bottom: -20,
                                opacity: 0.15,
                                color: view === 'scanner' ? '#fff' : theme.palette.primary.main
                            }}
                        />
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <Paper
                        elevation={view === 'settings' ? 8 : 0}
                        onClick={() => setView('settings')}
                        sx={{
                            p: 3,
                            borderRadius: 4,
                            background: view === 'settings'
                                ? `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`
                                : alpha(theme.palette.secondary.lighter, 0.2),
                            color: view === 'settings' ? '#fff' : theme.palette.secondary.main,
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: view === 'settings' ? 'scale(1.02)' : 'none',
                            position: 'relative',
                            overflow: 'hidden',
                            border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: view === 'settings' ? 12 : 4
                            }
                        }}
                    >
                        <Stack spacing={1}>
                            <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500 }}>Certificate</Typography>
                            <Typography variant="h2" sx={{ fontWeight: 800 }}>Settings</Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.15)', fontSize: '0.75rem', fontWeight: 600 }}>
                                    Customize Signature Info
                                </Box>
                            </Stack>
                        </Stack>
                        <Personalcard
                            variant="Bold"
                            size={140}
                            style={{
                                position: 'absolute',
                                right: -20,
                                bottom: -20,
                                opacity: 0.15,
                                color: view === 'settings' ? '#fff' : theme.palette.secondary.main
                            }}
                        />
                    </Paper>
                </Grid>
            </Grid>

            {view === 'scanner' ? (
                <>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>Certificate Validation</Typography>
                    </Box>

                    <Grid container spacing={3}>
                        {/* Scanner Form */}
                        <Grid item xs={12} md={5}>
                            <Card
                                sx={{
                                    borderRadius: 3,
                                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                    boxShadow: `0 8px 32px rgba(0,0,0,0.05)`,
                                    background: '#fff',
                                    height: '100%',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: `0 12px 48px rgba(0,0,0,0.08)`
                                    }
                                }}
                            >
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                                        Enter Certificate Number
                                    </Typography>

                                    <form onSubmit={handleValidate}>
                                        <Stack spacing={3}>
                                            <TextField
                                                fullWidth
                                                placeholder="Example: 638216526"
                                                label="Certificate Reference Number"
                                                value={certNumber}
                                                onChange={(e) => setCertNumber(e.target.value)}
                                                disabled={isValidating}
                                                error={!!error}
                                                helperText={error || "Type the unique numeric code as written on the certificate"}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Award size={20} />
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />

                                            <Button
                                                type="submit"
                                                variant="contained"
                                                size="large"
                                                disabled={isValidating}
                                                startIcon={isValidating ? <CircularProgress size={20} color="inherit" /> : <SearchNormal size={20} />}
                                                sx={{
                                                    py: 1.5,
                                                    borderRadius: 2,
                                                    boxShadow: theme.customShadows.primary,
                                                    '&:hover': {
                                                        transform: 'none'
                                                    }
                                                }}
                                            >
                                                {isValidating ? 'Validating...' : 'Verify Authenticity'}
                                            </Button>

                                            {currentResult && (
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    size="medium"
                                                    onClick={resetScanner}
                                                    startIcon={<Refresh />}
                                                    fullWidth
                                                >
                                                    Reset Search
                                                </Button>
                                            )}
                                        </Stack>
                                    </form>

                                    <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <InfoCircle size={14} />
                                            Certificate number is a unique 9-digit code located on the upper part of the internship certificate.
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Result Display */}
                        <Grid item xs={12} md={7}>
                            {currentResult?.status === 'valid' && (
                                <Card
                                    sx={{
                                        border: '1px solid',
                                        borderColor: theme.palette.success.main,
                                        borderRadius: 3,
                                        boxShadow: `0 20px 40px -20px ${alpha(theme.palette.success.main, 0.3)}`,
                                        position: 'relative',
                                        overflow: 'visible',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: `0 30px 60px -15px ${alpha(theme.palette.success.main, 0.4)}`
                                        }
                                    }}
                                >
                                    {/* Verified Badge */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: -15,
                                            right: 20,
                                            background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
                                            color: 'white',
                                            px: 2,
                                            py: 0.5,
                                            borderRadius: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            boxShadow: 3
                                        }}
                                    >
                                        <TickCircle size={18} variant="Bold" />
                                        <Typography variant="body2" fontWeight={600}>
                                            VERIFIED
                                        </Typography>
                                    </Box>

                                    <CardContent sx={{ pt: 4 }}>
                                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                                            Official Certificate Details
                                        </Typography>

                                        <Grid container spacing={4}>
                                            {/* Photo on the Left */}
                                            <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
                                                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                                                    <Avatar
                                                        src={currentResult.data.photo || "/assets/images/users/user-round.png"}
                                                        variant="rounded"
                                                        sx={{
                                                            width: 160,
                                                            height: 200,
                                                            mx: 'auto',
                                                            borderRadius: 2,
                                                            border: `4px solid #fff`,
                                                            boxShadow: theme.customShadows.z1,
                                                            objectFit: 'cover'
                                                        }}
                                                    />
                                                    <Box sx={{
                                                        position: 'absolute',
                                                        bottom: 10,
                                                        left: 0,
                                                        right: 0,
                                                        bgcolor: alpha(theme.palette.success.main, 0.85),
                                                        color: '#fff',
                                                        py: 0.5,
                                                        backdropFilter: 'blur(4px)',
                                                        borderBottomLeftRadius: 8,
                                                        borderBottomRightRadius: 8
                                                    }}>
                                                        <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1 }}>AUTHENTIC</Typography>
                                                    </Box>
                                                </Box>
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                                    Verified ID Photo
                                                </Typography>
                                            </Grid>

                                            {/* Data on the Right */}
                                            <Grid item xs={12} sm={8}>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12}>
                                                        <Typography variant="caption" color="text.secondary">Certificate Number</Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: 0.5 }}>
                                                            {currentResult.data.certNo}
                                                        </Typography>
                                                    </Grid>

                                                    <Grid item xs={12}>
                                                        <Typography variant="caption" color="text.secondary">Recipient Name</Typography>
                                                        <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                                                            {currentResult.data.name}
                                                        </Typography>
                                                    </Grid>

                                                    <Grid item xs={12} sm={6}>
                                                        <Typography variant="caption" color="text.secondary">Internship Period</Typography>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {currentResult.data.period}
                                                        </Typography>
                                                    </Grid>

                                                    <Grid item xs={12} sm={6}>
                                                        <Typography variant="caption" color="text.secondary">Unit & Department</Typography>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {currentResult.data.unit} / {currentResult.data.department}
                                                        </Typography>
                                                    </Grid>

                                                    <Grid item xs={12} sm={6}>
                                                        <Typography variant="caption" color="text.secondary">Score & Grade</Typography>
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <Typography variant="h4" fontWeight={800}>{currentResult.data.score}</Typography>
                                                            <Chip
                                                                label={currentResult.data.grade}
                                                                color={getGradeColor(currentResult.data.grade) as any}
                                                                variant="filled"
                                                                size="small"
                                                                sx={{ fontWeight: 700, height: 24 }}
                                                            />
                                                        </Stack>
                                                    </Grid>

                                                    <Grid item xs={12} sm={6}>
                                                        <Typography variant="caption" color="text.secondary">Validator / Supervisor</Typography>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {currentResult.data.evaluator}
                                                        </Typography>
                                                    </Grid>

                                                    <Grid item xs={12}>
                                                        <Divider sx={{ my: 1, borderStyle: 'dotted' }} />
                                                    </Grid>

                                                    <Grid item xs={12} sm={6}>
                                                        <Typography variant="caption" color="text.secondary">Origin Institution ({currentResult.data.institutionType || 'N/A'})</Typography>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {currentResult.data.institutionName || '-'}
                                                        </Typography>
                                                    </Grid>

                                                    <Grid item xs={12} sm={6}>
                                                        <Typography variant="caption" color="text.secondary">Participant Contact</Typography>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {currentResult.data.phone || '-'}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: 'primary.main', display: 'block' }}>
                                                            {currentResult.data.personalEmail || '-'}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                        <Alert severity="success" sx={{ mt: 3, bgcolor: 'rgba(255,255,255,0.5)' }}>
                                            This data matches the official database of the PUTI Internship Program, Telkom University.
                                        </Alert>
                                    </CardContent>
                                </Card>
                            )}

                            {currentResult?.status === 'error' && (
                                <Card
                                    sx={{
                                        background: 'linear-gradient(135deg, rgba(244,67,54,0.08) 0%, rgba(211,47,47,0.08) 100%)',
                                        border: '1px solid',
                                        borderColor: theme.palette.error.main,
                                        borderRadius: 3,
                                        boxShadow: `0 20px 40px -20px ${alpha(theme.palette.error.main, 0.3)}`,
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: `0 30px 60px -15px ${alpha(theme.palette.error.main, 0.4)}`
                                        }
                                    }}
                                >
                                    <CardContent>
                                        <Box sx={{ textAlign: 'center', py: 4 }}>
                                            <CloseCircle size={60} variant="Bold" color="#f44336" />
                                            <Typography variant="h6" color="error" fontWeight={600} sx={{ mt: 2 }}>
                                                Certificate Not Found
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                {currentResult.message || 'The certificate number you entered is not registered in our system.'}
                                            </Typography>
                                            <Button variant="outlined" color="error" sx={{ mt: 3 }} onClick={resetScanner}>
                                                Try Another Number
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            )}

                            {!currentResult && !isValidating && (
                                <Card sx={{ background: alpha(theme.palette.grey[500], 0.03), border: '2px dashed', borderColor: alpha(theme.palette.divider, 0.5), borderRadius: 3, boxShadow: 'none' }}>
                                    <CardContent>
                                        <Box sx={{ textAlign: 'center', py: 8 }}>
                                            <SearchNormal size={64} color="#9e9e9e" variant="Bulk" />
                                            <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                                                Ready to Validate
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Enter a reference number to check certificate data
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            )}
                        </Grid>

                        {/* History */}
                        {scanHistory.length > 0 && (
                            <Grid item xs={12}>
                                <Card sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, boxShadow: `0 4px 20px rgba(0,0,0,0.05)` }}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                            Search History
                                        </Typography>
                                        <Stack spacing={1}>
                                            {scanHistory.map((result, index) => (
                                                <Paper
                                                    key={index}
                                                    sx={{
                                                        p: 2,
                                                        background: result.status === 'valid' ? 'rgba(76,175,80,0.05)' : 'rgba(244,67,54,0.05)',
                                                        border: '1px solid',
                                                        borderColor: result.status === 'valid' ? 'success.light' : 'error.light',
                                                        borderRadius: 2,
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            transform: 'translateX(8px)',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                                            background: result.status === 'valid' ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)'
                                                        }
                                                    }}
                                                >
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {result.status === 'valid' ? result.data.name : 'Invalid Number'}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Verified at: {new Date(result.timestamp).toLocaleTimeString('en-GB')}
                                                            </Typography>
                                                        </Box>
                                                        <Chip
                                                            label={result.status === 'valid' ? 'VALID' : 'INVALID'}
                                                            color={result.status === 'valid' ? 'success' : 'error'}
                                                            size="small"
                                                        />
                                                    </Stack>
                                                </Paper>
                                            ))}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}
                    </Grid>
                </>
            ) : (
                <Card sx={{
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.1),
                    boxShadow: `0 12px 40px -12px rgba(0,0,0,0.1)`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        boxShadow: `0 20px 50px -15px rgba(0,0,0,0.15)`
                    }
                }}>
                    <CardContent sx={{ p: 4 }}>
                        <Stack spacing={1} sx={{ mb: 4 }}>
                            <Typography variant="h4" sx={{ fontWeight: 800 }}>Signature Settings</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Customize the official information that will appear in the "Approved by" section of the digital certificate.
                            </Typography>
                        </Stack>

                        {isSettingsLoading ? (
                            <Box sx={{ py: 10, textAlign: 'center' }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <form onSubmit={handleSettingsSubmit}>
                                <Grid container spacing={4}>
                                    <Grid item xs={12} md={6}>
                                        <Stack spacing={3}>
                                            <TextField
                                                fullWidth
                                                label="HR Officer Name"
                                                name="hr_officer_name"
                                                defaultValue={settings?.hr_officer_name}
                                                required
                                                placeholder="Example: Dr. Officer Name, M.T."
                                                helperText="Full name with titles to be displayed on the certificate"
                                            />
                                            <TextField
                                                fullWidth
                                                label="Position"
                                                name="hr_officer_position"
                                                defaultValue={settings?.hr_officer_position}
                                                required
                                                placeholder="Example: Head of HR Development"
                                                helperText="Structural position of the relevant officer"
                                            />
                                            <TextField
                                                fullWidth
                                                label="Issuance City"
                                                name="city"
                                                defaultValue={settings?.city}
                                                required
                                                placeholder="Bandung"
                                                helperText="City that will be written on the issuance date"
                                            />
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Paper
                                            variant="outlined"
                                            sx={{
                                                p: 3,
                                                bgcolor: alpha(theme.palette.primary.lighter || theme.palette.primary.light, 0.1),
                                                borderStyle: 'dashed',
                                                minHeight: 250,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.primary.main, fontWeight: 700 }}>
                                                Signature Layout Preview:
                                            </Typography>
                                            <Box sx={{ fontFamily: 'Times New Roman', p: 2, bgcolor: '#fff', border: '1px solid #ddd' }}>
                                                <Typography sx={{ mb: 1 }}>{settings?.city || 'Bandung'}, [Date]</Typography>
                                                <Typography>Approved by,</Typography>
                                                <Typography sx={{ mb: 6 }}>{settings?.hr_officer_position || 'Head of HR Development'},</Typography>
                                                <Typography sx={{ fontWeight: 'bold', textDecoration: 'underline' }}>{settings?.hr_officer_name || '[HR Officer Name]'}</Typography>
                                                <Typography>Universitas Telkom</Typography>
                                            </Box>
                                        </Paper>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                size="large"
                                                startIcon={isUpdating ? <CircularProgress size={20} color="inherit" /> : <TickCircle />}
                                                disabled={isUpdating}
                                                sx={{ px: 4, borderRadius: 2 }}
                                            >
                                                Save Changes
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </form>
                        )}
                    </CardContent>
                </Card>
            )}
        </Box>
    );
}
