'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import {
    Box,
    Typography,
    Grid,
    Button,
    Stack,
    CircularProgress,
    Alert,
    AlertTitle,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    TextField,
    useTheme,
    alpha
} from '@mui/material';
import {
    Refresh,
    Send2,
    Eye,
    TickCircle,
    CloseCircle,
    InfoCircle,
    CalendarTick
} from 'iconsax-react';

// PROJECT IMPORTS
import MainCard from 'components/MainCard';

interface PreviewData {
    supervisor_name: string;
    supervisor_email: string;
    telegram_username: string;
    absent_count: number;
    absent_interns: Array<{
        intern_name: string;
        unit_name: string;
    }>;
    preview_message: string;
}

interface SendResult {
    supervisor: string;
    telegram_username: string;
    absent_count: number;
    success: boolean;
    error?: string;
}

export default function TelegramNotificationManager() {
    const theme = useTheme();
    const [preview, setPreview] = useState<PreviewData[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [sendResults, setSendResults] = useState<SendResult[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Settings State
    const [settings, setSettings] = useState({
        check_in: { time: '09:00', enabled: true, target: 'participant' },
        break: { time: '12:00', enabled: false, target: 'participant' },
        check_out: { time: '17:00', enabled: true, target: 'participant' }
    });
    const [savingSettings, setSavingSettings] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/admin/telegram-settings');
            if (response.ok) {
                const data = await response.json();
                setSettings(data);
            }
        } catch (err) {
            console.error('Failed to fetch settings:', err);
        }
    };

    const saveSettings = async () => {
        setSavingSettings(true);
        setSuccessMessage(null);
        try {
            const response = await fetch('/api/admin/telegram-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (response.ok) {
                setSuccessMessage('Pengaturan jadwal berhasil disimpan!');
                setTimeout(() => setSuccessMessage(null), 3000);
            } else {
                throw new Error('Gagal menyimpan pengaturan');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Gagal menyimpan pengaturan');
        } finally {
            setSavingSettings(false);
        }
    };

    const fetchPreview = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/notifications/telegram/send-attendance-alerts');
            if (!response.ok) throw new Error('Failed to fetch preview');

            const data = await response.json();
            setPreview(data.preview || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const sendNotifications = async () => {
        if (!confirm('Apakah Anda yakin ingin mengirim notifikasi ke semua supervisor?')) {
            return;
        }

        setSending(true);
        setError(null);
        setSendResults(null);

        try {
            const response = await fetch('/api/notifications/telegram/send-attendance-alerts', {
                method: 'POST'
            });

            if (!response.ok) throw new Error('Failed to send notifications');

            const data = await response.json();
            setSendResults(data.results || []);

            // Refresh preview after sending
            await fetchPreview();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
        fetchPreview();
        fetchSettings();
    }, []);

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
                        Pengelola Notifikasi Telegram
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Atur jadwal otomatis untuk anak magang atau supervisor
                    </Typography>
                </Stack>
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
            </Box>

            {/* Schedule Settings Section */}
            <MainCard title="Jadwal Notifikasi Otomatis" sx={{ mb: 4 }}>
                <Grid container spacing={3}>
                    {(['check_in', 'break', 'check_out'] as const).map((type) => (
                        <Grid item xs={12} md={4} key={type}>
                            <Box sx={{
                                p: 2.5,
                                borderRadius: 2,
                                border: `1px solid ${theme.palette.divider}`,
                                bgcolor: settings[type].enabled ? alpha(theme.palette.primary.lighter, 0.1) : 'transparent',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    borderColor: theme.palette.primary.main,
                                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`
                                }
                            }}>
                                <Stack spacing={2}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
                                            {type.replace('_', ' ')}
                                        </Typography>
                                        <Chip
                                            label={settings[type].enabled ? 'Aktif' : 'Nonaktif'}
                                            color={settings[type].enabled ? 'primary' : 'default'}
                                            size="small"
                                            onClick={() => {
                                                const newSettings = {
                                                    ...settings,
                                                    [type]: { ...settings[type] as any, enabled: !settings[type].enabled }
                                                };
                                                setSettings(newSettings);
                                            }}
                                            sx={{ cursor: 'pointer', fontWeight: 600 }}
                                        />
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
                                            Penerima Notifikasi
                                        </Typography>
                                        <Stack direction="row" spacing={1}>
                                            <Chip
                                                label="Anak Magang"
                                                variant={settings[type].target === 'participant' ? 'filled' : 'outlined'}
                                                color={settings[type].target === 'participant' ? 'primary' : 'default'}
                                                size="small"
                                                onClick={() => setSettings({
                                                    ...settings,
                                                    [type]: { ...settings[type] as any, target: 'participant' }
                                                })}
                                                sx={{ flex: 1 }}
                                            />
                                            <Chip
                                                label="Supervisor"
                                                variant={settings[type].target === 'supervisor' ? 'filled' : 'outlined'}
                                                color={settings[type].target === 'supervisor' ? 'primary' : 'default'}
                                                size="small"
                                                onClick={() => setSettings({
                                                    ...settings,
                                                    [type]: { ...settings[type] as any, target: 'supervisor' }
                                                })}
                                                sx={{ flex: 1 }}
                                            />
                                        </Stack>
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" color="textSecondary" sx={{ mb: 0.5, display: 'block' }}>
                                            Jam Pengiriman
                                        </Typography>
                                        <input
                                            type="time"
                                            value={settings[type].time}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                [type]: { ...settings[type] as any, time: e.target.value }
                                            })}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                border: `1px solid ${theme.palette.divider}`,
                                                fontSize: '1rem',
                                                fontFamily: 'inherit',
                                                backgroundColor: theme.palette.background.paper,
                                                color: theme.palette.text.primary,
                                                marginBottom: '8px'
                                            }}
                                        />
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" color="textSecondary" sx={{ mb: 0.5, display: 'block' }}>
                                            Pesan Notifikasi
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={2}
                                            value={(settings[type] as any).message || ''}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setSettings({
                                                ...settings,
                                                [type]: { ...settings[type] as any, message: e.target.value }
                                            })}
                                            placeholder="Masukkan pesan..."
                                            variant="outlined"
                                            sx={{
                                                '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: '0.85rem' }
                                            }}
                                        />
                                    </Box>
                                </Stack>
                            </Box>
                        </Grid>
                    ))}
                    <Grid item xs={12}>
                        <Stack direction="row" justifyContent="flex-end" spacing={2} alignItems="center">
                            {successMessage && (
                                <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                                    {successMessage}
                                </Typography>
                            )}
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={savingSettings ? <CircularProgress size={20} color="inherit" /> : <TickCircle size={20} />}
                                onClick={saveSettings}
                                disabled={savingSettings}
                                sx={{ px: 4 }}
                            >
                                Simpan Jadwal
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </MainCard>

            {/* Actions & Info */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={8}>
                    <Stack spacing={2}>
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Refresh size={20} />}
                                onClick={fetchPreview}
                                disabled={loading || sending}
                            >
                                {loading ? 'Memuat...' : 'Refresh Data'}
                            </Button>
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={sending ? <CircularProgress size={20} color="inherit" /> : <Send2 size={20} />}
                                onClick={sendNotifications}
                                disabled={sending || loading || preview.length === 0}
                            >
                                {sending ? 'Mengirim...' : `Kirim Notifikasi (${preview.length})`}
                            </Button>
                        </Stack>


                    </Stack>
                </Grid>
                <Grid item xs={12} md={4}>
                    <MainCard border={false} boxShadow sx={{ bgcolor: alpha(theme.palette.info.lighter, 0.1) }}>
                        <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="center">
                            <InfoCircle size={20} color={theme.palette.info.main} />
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Template Notifikasi</Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Pesan menggunakan template yang bisa dimodifikasi.{' '}
                                    <Button
                                        color="info"
                                        size="small"
                                        sx={{ minWidth: 0, p: 0, textTransform: 'none', verticalAlign: 'baseline', fontWeight: 700 }}
                                        href="/admin/notification-templates"
                                    >
                                        Kelola Template &rarr;
                                    </Button>
                                </Typography>
                            </Box>
                        </Stack>
                    </MainCard>
                </Grid>
            </Grid>

            {/* Error Message */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} icon={<CloseCircle />}>
                    <AlertTitle>Error</AlertTitle>
                    {error}
                </Alert>
            )}

            {/* Send Results */}
            {sendResults && (
                <MainCard title="Hasil Pengiriman" sx={{ mb: 4 }}>
                    <Grid container spacing={2}>
                        {sendResults.map((result, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Box sx={{
                                    p: 2,
                                    borderRadius: 1.5,
                                    border: '1px solid',
                                    borderColor: result.success ? alpha(theme.palette.success.main, 0.2) : alpha(theme.palette.error.main, 0.2),
                                    bgcolor: result.success ? alpha(theme.palette.success.lighter, 0.1) : alpha(theme.palette.error.lighter, 0.1)
                                }}>
                                    <Stack spacing={1}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{result.supervisor}</Typography>
                                            {result.success ? <TickCircle size={18} variant="Bold" color={theme.palette.success.main} /> : <CloseCircle size={18} variant="Bold" color={theme.palette.error.main} />}
                                        </Box>
                                        <Typography variant="caption" color="textSecondary">@{result.telegram_username}</Typography>
                                        <Chip
                                            label={`${result.absent_count} anak magang`}
                                            size="small"
                                            color={result.success ? 'success' : 'error'}
                                            variant="combined"
                                            sx={{ width: 'fit-content' }}
                                        />
                                        {result.error && (
                                            <Typography variant="caption" color="error">{result.error}</Typography>
                                        )}
                                    </Stack>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </MainCard>
            )}

            {/* Preview Section */}
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Daftar Belum Presensi</Typography>

            {preview.length === 0 && !loading ? (
                <MainCard sx={{ textAlign: 'center', py: 8 }}>
                    <Stack spacing={2} alignItems="center">
                        <Box sx={{ p: 2, bgcolor: alpha(theme.palette.success.lighter, 0.5), borderRadius: '50%' }}>
                            <TickCircle size={48} variant="Bold" color={theme.palette.success.main} />
                        </Box>
                        <Typography variant="h4">Semua Sudah Presensi! 🎉</Typography>
                        <Typography variant="body2" color="textSecondary">
                            Tidak ada anak magang yang belum melakukan presensi hari ini.
                        </Typography>
                    </Stack>
                </MainCard>
            ) : (
                <Grid container spacing={3}>
                    {preview.map((item, index) => (
                        <Grid item xs={12} lg={6} key={index}>
                            <MainCard>
                                <Stack spacing={2}>
                                    {/* Supervisor Info */}
                                    <Box sx={{ pb: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>{item.supervisor_name}</Typography>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Typography variant="caption" color="textSecondary">{item.supervisor_email}</Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                {item.telegram_username === 'TIDAK TERDAFTAR' ? (
                                                    <Chip
                                                        icon={<CloseCircle size={14} />}
                                                        label="Telegram tidak terdaftar"
                                                        size="small"
                                                        color="error"
                                                        variant="combined"
                                                    />
                                                ) : (
                                                    <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                                                        📱 @{item.telegram_username}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Stack>
                                    </Box>

                                    {/* Absent Interns */}
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ mb: 1, color: theme.palette.text.primary }}>
                                            Anak Magang Belum Presensi ({item.absent_count}):
                                        </Typography>
                                        <Stack spacing={1}>
                                            {item.absent_interns.map((intern, idx) => (
                                                <Box key={idx} sx={{
                                                    p: 1,
                                                    bgcolor: alpha(theme.palette.grey[100], 0.5),
                                                    borderRadius: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1.5
                                                }}>
                                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: theme.palette.primary.main }} />
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{intern.intern_name}</Typography>
                                                        <Typography variant="caption" color="textSecondary">{intern.unit_name}</Typography>
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Stack>
                                    </Box>

                                    {/* Preview Message */}
                                    <Accordion variant="outlined" sx={{ border: 'none', bgcolor: alpha(theme.palette.grey[100], 0.3) }}>
                                        <AccordionSummary expandIcon={<Eye size={18} />}>
                                            <Typography variant="subtitle2" color="primary">Preview Pesan</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Box sx={{
                                                p: 2,
                                                bgcolor: theme.palette.background.paper,
                                                borderRadius: 2,
                                                border: `1px solid ${theme.palette.divider}`,
                                                fontFamily: 'monospace',
                                                fontSize: '0.75rem',
                                                whiteSpace: 'pre-wrap'
                                            }}>
                                                {item.preview_message}
                                            </Box>
                                        </AccordionDetails>
                                    </Accordion>
                                </Stack>
                            </MainCard>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}
