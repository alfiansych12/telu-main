'use client';

import React, { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Stack,
    alpha,
    useTheme,
    Tooltip
} from '@mui/material';
import {
    Add,
    DocumentDownload,
    Edit,
    Trash,
    ArchiveBook,
    Calendar,
    DocumentText
} from 'iconsax-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import ArsipDialog from './components/ArsipDialog';
import { openAlert } from 'api/alert';
import axios from 'utils/axios';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

// Data types
interface ArsipItem {
    id: string;
    institution_name: string;
    internship_period_start: Date;
    internship_period_end: Date;
    document_name: string;
    document_url?: string;
    created_at: Date;
}

const ArsipView = () => {
    const theme = useTheme();
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
    const [selectedItem, setSelectedItem] = useState<ArsipItem | null>(null);
    const [loading, setLoading] = useState(true);

    // Data state
    const [arsipList, setArsipList] = useState<ArsipItem[]>([]);

    const fetchArsip = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/arsip');
            const formattedData = response.data.map((item: any) => ({
                ...item,
                internship_period_start: new Date(item.internship_period_start),
                internship_period_end: new Date(item.internship_period_end),
                created_at: new Date(item.created_at)
            }));
            setArsipList(formattedData);
        } catch (error) {
            console.error('Failed to fetch arsip:', error);
            openAlert({
                variant: 'error',
                title: 'Fetch Failed',
                message: 'Gagal mengambil data arsip.'
            });
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchArsip();
    }, []);

    const handleAdd = () => {
        setDialogMode('create');
        setSelectedItem(null);
        setOpenDialog(true);
    };

    const handleEdit = (item: ArsipItem) => {
        setDialogMode('edit');
        setSelectedItem(item);
        setOpenDialog(true);
    };

    const handleView = (item: ArsipItem) => {
        if (item.document_url) {
            let url = item.document_url;

            // Check if it's metadata JSON (from registration form)
            try {
                const metadata = JSON.parse(url);
                if (metadata.source === 'registration_form') {
                    // Show metadata dialog instead of opening PDF
                    openAlert({
                        variant: 'info',
                        title: 'Detail Arsip Pendaftaran',
                        message: `
                            <div style="text-align: left;">
                                <p><strong>📋 Sumber:</strong> Formulir Pendaftaran Online</p>
                                <p><strong>👤 Nama Peserta:</strong> ${metadata.participant_name}</p>
                                <p><strong>📧 Email:</strong> ${metadata.participant_email}</p>
                                <p><strong>🆔 NIM/ID:</strong> ${metadata.participant_id_number || '-'}</p>
                                <p><strong>✅ Disetujui:</strong> ${new Date(metadata.approved_at).toLocaleString('id-ID')}</p>
                                <p><strong>📝 Catatan:</strong> ${metadata.note}</p>
                                <hr style="margin: 12px 0; border: none; border-top: 1px solid #eee;" />
                                <p style="color: #666; font-size: 0.9em;">
                                    <em>Arsip ini dibuat otomatis saat approval aplikasi pendaftaran. 
                                    Untuk melihat detail lengkap aplikasi, silakan cek menu "Registration Applications".</em>
                                </p>
                            </div>
                        `
                    });
                    return;
                }
            } catch (e) {
                // Not JSON metadata, continue with normal flow
            }

            // Handle dummy URL
            if (url.includes('dummy-url.com')) {
                url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
            }

            // Check if it's a base64 PDF
            if (url.startsWith('data:application/pdf')) {
                // Open base64 PDF in new tab
                const newWindow = window.open();
                if (newWindow) {
                    newWindow.document.write(`
                        <html>
                            <head><title>${item.document_name}</title></head>
                            <body style="margin:0">
                                <iframe src="${url}" width="100%" height="100%" style="border:none"></iframe>
                            </body>
                        </html>
                    `);
                }
            } else {
                // Regular URL
                window.open(url, '_blank');
            }
        } else {
            openAlert({
                variant: 'error',
                title: 'View Failed',
                message: 'URL dokumen tidak ditemukan.'
            });
        }
    };

    const handleDelete = async (id: string) => {
        openAlert({
            variant: 'error',
            title: 'Hapus Arsip',
            message: 'Apakah Anda yakin ingin menghapus data arsip ini? Tindakan ini tidak dapat dibatalkan.',
            showCancel: true,
            confirmText: 'Ya, Hapus',
            onConfirm: async () => {
                try {
                    await axios.delete(`/arsip/${id}`);
                    setArsipList(prev => prev.filter(item => item.id !== id));
                    openAlert({
                        variant: 'success',
                        title: 'Terhapus',
                        message: 'Data arsip berhasil dihapus.'
                    });
                } catch (error) {
                    console.error('Failed to delete arsip:', error);
                }
            }
        });
    };

    const handleSubmit = async (values: any) => {
        try {
            let documentBase64 = undefined;
            if (values.document) {
                documentBase64 = await fileToBase64(values.document as File);
            }

            if (dialogMode === 'create') {
                const response = await axios.post('/arsip', {
                    institution_name: values.institution_name,
                    internship_period_start: values.internship_period_start,
                    internship_period_end: values.internship_period_end,
                    document_name: values.document ? (values.document as File).name : 'Document.pdf',
                    document_url: documentBase64,
                });

                const newItem: ArsipItem = {
                    ...response.data,
                    internship_period_start: new Date(response.data.internship_period_start),
                    internship_period_end: new Date(response.data.internship_period_end),
                    created_at: new Date(response.data.created_at)
                };

                setArsipList(prev => [newItem, ...prev]);
                openAlert({
                    variant: 'success',
                    title: 'Arsip Ditambahkan',
                    message: 'Data arsip berhasil disimpan.'
                });
            } else if (selectedItem) {
                const response = await axios.put(`/arsip/${selectedItem.id}`, {
                    institution_name: values.institution_name,
                    internship_period_start: values.internship_period_start,
                    internship_period_end: values.internship_period_end,
                    document_name: values.document ? (values.document as File).name : selectedItem.document_name,
                    document_url: documentBase64 || selectedItem.document_url,
                });

                const updatedItem: ArsipItem = {
                    ...response.data,
                    internship_period_start: new Date(response.data.internship_period_start),
                    internship_period_end: new Date(response.data.internship_period_end),
                    created_at: new Date(response.data.created_at)
                };

                setArsipList(prev => prev.map(item => item.id === selectedItem.id ? updatedItem : item));
                openAlert({
                    variant: 'success',
                    title: 'Arsip Diperbarui',
                    message: 'Data arsip berhasil diperbarui.'
                });
            }
            setOpenDialog(false);
        } catch (error) {
            console.error('Failed to save arsip:', error);
            openAlert({
                variant: 'error',
                title: 'Gagal Menyimpan',
                message: 'Terjadi kesalahan saat menyimpan data.'
            });
        }
    };

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            sx={{ p: { xs: 2, md: 4 } }}
        >
            {/* Header Section */}
            <Box
                sx={{
                    mb: 4,
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 3,
                    position: 'relative',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -16,
                        left: 0,
                        width: '100%',
                        height: '1px',
                        background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, transparent 100%)`,
                        opacity: 0.2
                    }
                }}
            >
                <Stack spacing={0.5}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box
                            sx={{
                                width: 44,
                                height: 44,
                                borderRadius: 3,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                color: '#fff',
                                boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`
                            }}
                        >
                            <ArchiveBook size="24" variant="Bulk" />
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
                            Arsip Institusi
                        </Typography>
                    </Stack>
                    <Typography variant="body1" color="text.secondary" sx={{ opacity: 0.8, pl: 0.5 }}>
                        Manajemen dokumen kerjasama dan histori periode magang institusi
                    </Typography>
                </Stack>

                <Button
                    component={motion.button}
                    whileHover={{ scale: 1.05, boxShadow: `0 12px 20px -8px ${alpha(theme.palette.success.main, 0.5)}` }}
                    whileTap={{ scale: 0.98 }}
                    variant="contained"
                    color="success"
                    startIcon={<Add variant="Bold" />}
                    onClick={handleAdd}
                    sx={{
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        fontWeight: 700,
                        fontSize: '1rem',
                        textTransform: 'none',
                        background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                        boxShadow: `0 6px 12px ${alpha(theme.palette.success.main, 0.2)}`,
                    }}
                >
                    Tambah Arsip Baru
                </Button>
            </Box>

            {/* Content Table */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    border: `1px solid ${theme.palette.divider}`,
                    background: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 4px 24px -12px rgba(0,0,0,0.1)'
                }}
            >
                <TableContainer>
                    <Table sx={{ minWidth: 800 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.lighter, 0.3) }}>
                                <TableCell sx={{ fontWeight: 800, py: 2.5, color: theme.palette.primary.darker }}>Institusi</TableCell>
                                <TableCell sx={{ fontWeight: 800, py: 2.5, color: theme.palette.primary.darker }}>Periode Magang</TableCell>
                                <TableCell sx={{ fontWeight: 800, py: 2.5, color: theme.palette.primary.darker }}>Berkas Kerjasama</TableCell>
                                <TableCell sx={{ fontWeight: 800, py: 2.5, color: theme.palette.primary.darker }}>Terdaftar</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 800, py: 2.5, color: theme.palette.primary.darker }}>Aksi</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ py: 10, textAlign: 'center' }}>
                                            <Stack spacing={2} alignItems="center">
                                                <Box
                                                    component={motion.div}
                                                    animate={{ rotate: 360 }}
                                                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                                    sx={{ width: 40, height: 40, borderRadius: '50%', border: `4px solid ${theme.palette.primary.lighter}`, borderTopColor: theme.palette.primary.main }}
                                                />
                                                <Typography variant="h6" color="text.secondary">Menyelaraskan data...</Typography>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ) : arsipList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ py: 10, textAlign: 'center' }}>
                                            <Stack spacing={1} alignItems="center">
                                                <ArchiveBook size="60" color={theme.palette.grey[300]} variant="Bulk" />
                                                <Typography variant="h5" color="text.secondary" sx={{ fontWeight: 600 }}>Belum ada arsip ditemukan</Typography>
                                                <Typography variant="body2" color="text.secondary">Klik tombol 'Tambah Arsip' untuk memulai.</Typography>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    arsipList.map((row, index) => (
                                        <TableRow
                                            component={motion.tr}
                                            layout
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: index * 0.05 }}
                                            key={row.id}
                                            sx={{
                                                '&:hover': {
                                                    bgcolor: alpha(theme.palette.primary.lighter, 0.15),
                                                    transition: 'all 0.2s ease',
                                                },
                                                '& td': { borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }
                                            }}
                                        >
                                            <TableCell sx={{ py: 2.5 }}>
                                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                                    <Box
                                                        sx={{
                                                            width: 40,
                                                            height: 40,
                                                            borderRadius: 2,
                                                            bgcolor: alpha(theme.palette.info.main, 0.1),
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: theme.palette.info.main
                                                        }}
                                                    >
                                                        <DocumentText size="22" variant="Bulk" />
                                                    </Box>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                                        {row.institution_name}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Chip
                                                        icon={<Calendar size="14" />}
                                                        label={format(row.internship_period_start, 'dd MMM yyyy')}
                                                        size="small"
                                                        sx={{
                                                            fontWeight: 600,
                                                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                                                            color: theme.palette.primary.main,
                                                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                                                        }}
                                                    />
                                                    <Box sx={{ width: 8, height: 2, bgcolor: theme.palette.grey[300] }} />
                                                    <Chip
                                                        label={format(row.internship_period_end, 'dd MMM yyyy')}
                                                        size="small"
                                                        sx={{
                                                            fontWeight: 600,
                                                            bgcolor: alpha(theme.palette.error.main, 0.08),
                                                            color: theme.palette.error.main,
                                                            border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`
                                                        }}
                                                    />
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title="Buka Dokumen">
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Button
                                                            variant="text"
                                                            color="primary"
                                                            startIcon={<DocumentDownload size="20" variant="Bulk" />}
                                                            onClick={() => handleView(row)}
                                                            sx={{
                                                                textTransform: 'none',
                                                                fontWeight: 600,
                                                                borderRadius: 2,
                                                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) }
                                                            }}
                                                        >
                                                            {row.document_name.length > 25 ? `${row.document_name.substring(0, 22)}...` : row.document_name}
                                                        </Button>
                                                        {(() => {
                                                            try {
                                                                const metadata = JSON.parse(row.document_url || '{}');
                                                                if (metadata.source === 'registration_form') {
                                                                    return (
                                                                        <Chip
                                                                            label="Auto"
                                                                            size="small"
                                                                            sx={{
                                                                                height: 20,
                                                                                fontSize: '0.7rem',
                                                                                fontWeight: 700,
                                                                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                                                                color: theme.palette.success.main,
                                                                                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                                                                            }}
                                                                        />
                                                                    );
                                                                }
                                                            } catch (e) {
                                                                // Not metadata, ignore
                                                            }
                                                            return null;
                                                        })()}
                                                    </Stack>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                                    {format(row.created_at, 'dd/MM/yyyy')}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.6 }}>
                                                    {format(row.created_at, 'HH:mm')} WIB
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Stack direction="row" spacing={1} justifyContent="center">
                                                    <Tooltip title="Edit">
                                                        <IconButton
                                                            component={motion.button}
                                                            whileHover={{ scale: 1.1, y: -2 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleEdit(row)}
                                                            sx={{
                                                                color: theme.palette.info.main,
                                                                bgcolor: alpha(theme.palette.info.lighter, 0.4),
                                                                '&:hover': { bgcolor: theme.palette.info.main, color: '#fff' }
                                                            }}
                                                        >
                                                            <Edit size="18" variant="Bold" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Hapus">
                                                        <IconButton
                                                            component={motion.button}
                                                            whileHover={{ scale: 1.1, y: -2 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleDelete(row.id)}
                                                            sx={{
                                                                color: theme.palette.error.main,
                                                                bgcolor: alpha(theme.palette.error.lighter, 0.4),
                                                                '&:hover': { bgcolor: theme.palette.error.main, color: '#fff' }
                                                            }}
                                                        >
                                                            <Trash size="18" variant="Bold" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <ArsipDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                mode={dialogMode}
                initialValues={selectedItem}
                onSubmit={handleSubmit}
            />
        </Box>
    );
};

export default ArsipView;

