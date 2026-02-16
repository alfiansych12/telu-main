'use client';

import React, { useState } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Stack,
    TextField,
    Button,
    MenuItem,
    Checkbox,
    FormControlLabel,
    Alert,
    alpha,
    Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { TickCircle, DocumentUpload, Building } from 'iconsax-react';

const RegistrationFormRenderer = ({ slug }: { slug: string }) => {
    const theme = useTheme();
    const [submitted, setSubmitted] = useState(false);

    // Mock form structure (This would normally come from the DB based on slug)
    const formConfig = {
        title: 'Pendaftaran Magang Telkom University 2026',
        description: 'Silakan isi formulir di bawah ini untuk mengajukan pendaftaran magang student/siswa dari institusi Anda.',
        fields: [
            { id: '1', label: 'Nama Lengkap Siswa', type: 'text', required: true },
            { id: '2', label: 'Asal Sekolah/Universitas', type: 'text', required: true },
            { id: '3', label: 'Tipe Institusi', type: 'select', options: ['SMK', 'Universitas', 'SMA'], required: true },
            { id: '4', label: 'Email Aktif (Gmail)', type: 'text', required: true },
            { id: '5', label: 'Nomor WhatsApp', type: 'text', required: true },
            { id: '6', label: 'Periode Mulai Magang', type: 'date', required: true },
            { id: '7', label: 'Periode Berakhir Magang', type: 'date', required: true },
            { id: '8', label: 'Upload Surat Pengantar / CV', type: 'file', required: true }
        ]
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <Container maxWidth="sm" sx={{ py: 10 }}>
                <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                    <TickCircle size={80} variant="Bold" color={theme.palette.success.main} />
                    <Typography variant="h3" sx={{ fontWeight: 900, mt: 3, mb: 1 }}>Terima Kasih!</Typography>
                    <Typography variant="body1" color="textSecondary">
                        Pendaftaran siswa Anda telah berhasil kami terima. Mohon tunggu proses review dari admin kami.
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 2, fontWeight: 700, color: theme.palette.primary.main }}>
                        APPLICATION ID: #REG-{Math.floor(1000 + Math.random() * 9000)}
                    </Typography>
                    <Button variant="contained" fullWidth sx={{ mt: 4, borderRadius: 2 }} onClick={() => window.location.reload()}>
                        Kirim Pendaftaran Lain
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f4f7f9', py: { xs: 4, md: 8 } }}>
            <Container maxWidth="md">
                <Stack spacing={4}>
                    <Box sx={{ textAlign: 'center' }}>
                        <img src="/telkom-logo.png" alt="Logo" style={{ height: 60, marginBottom: 20 }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                        <Typography variant="h2" sx={{ fontWeight: 900, color: theme.palette.primary.main }}>Portal Registrasi Magang</Typography>
                        <Typography variant="subtitle1" color="textSecondary">{formConfig.title}</Typography>
                    </Box>

                    <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <Alert icon={<Building variant="Bold" />} severity="info" sx={{ mb: 4, borderRadius: 2 }}>
                            Satu formulir digunakan untuk pendaftaran satu siswa. Untuk pendaftaran masal dari institusi, mohon hubungi admin.
                        </Alert>

                        <form onSubmit={handleSubmit}>
                            <Stack spacing={3.5}>
                                {formConfig.fields.map((field) => (
                                    <Box key={field.id}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            {field.label} {field.required && <Box component="span" sx={{ color: 'red' }}>*</Box>}
                                        </Typography>

                                        {field.type === 'text' && (
                                            <TextField fullWidth variant="outlined" placeholder={`Masukkan ${field.label.toLowerCase()}`} required={field.required} />
                                        )}

                                        {field.type === 'select' && (
                                            <TextField select fullWidth defaultValue="" required={field.required}>
                                                {field.options?.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                                            </TextField>
                                        )}

                                        {field.type === 'date' && (
                                            <TextField type="date" fullWidth InputLabelProps={{ shrink: true }} required={field.required} />
                                        )}

                                        {field.type === 'file' && (
                                            <Box sx={{
                                                border: '2px dashed #e0e0e0',
                                                borderRadius: 3,
                                                p: 4,
                                                textAlign: 'center',
                                                bgcolor: '#fafafa',
                                                transition: '0.3s',
                                                cursor: 'pointer',
                                                '&:hover': { borderColor: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.02) }
                                            }}>
                                                <DocumentUpload size={40} color={theme.palette.text.secondary} />
                                                <Typography variant="body2" sx={{ mt: 1.5, fontWeight: 700 }}>Klik untuk pilih file</Typography>
                                                <Typography variant="caption" color="textSecondary">Format: PDF, JPG, PNG (Max 5MB)</Typography>
                                            </Box>
                                        )}
                                    </Box>
                                ))}

                                <Divider sx={{ my: 2 }} />

                                <FormControlLabel
                                    required
                                    control={<Checkbox defaultChecked />}
                                    label={<Typography variant="body2">Saya menyatakan bahwa data yang diisi adalah benar dan dapat dipertanggungjawabkan.</Typography>}
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    sx={{
                                        py: 1.5,
                                        borderRadius: 3,
                                        fontWeight: 900,
                                        fontSize: '1rem',
                                        boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.2)}`
                                    }}
                                >
                                    Kirim Pendaftaran
                                </Button>
                            </Stack>
                        </form>
                    </Paper>

                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="textSecondary">
                            &copy; 2026 Telkom University Internship Management System. All Rights Reserved.
                        </Typography>
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
};

export default RegistrationFormRenderer;
