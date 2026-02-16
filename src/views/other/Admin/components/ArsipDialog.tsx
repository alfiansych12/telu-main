'use client';

import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Stack,
    InputAdornment,
    Typography,
    Box,
    alpha,
    useTheme
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Building, Calendar, DocumentCloud, CloseCircle } from 'iconsax-react';

interface ArsipDialogProps {
    open: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    initialValues: any;
    onSubmit: (values: any) => void;
    isLoading?: boolean;
}

const ArsipDialog = ({
    open,
    onClose,
    mode,
    initialValues,
    onSubmit,
    isLoading
}: ArsipDialogProps) => {
    const theme = useTheme();

    const validationSchema = Yup.object().shape({
        institution_name: Yup.string().max(255).required('Nama Institusi wajib diisi'),
        internship_period_start: Yup.date().nullable().required('Tanggal mulai wajib diisi'),
        internship_period_end: Yup.date().nullable().required('Tanggal selesai wajib diisi'),
        document: Yup.mixed().when('mode', {
            is: 'create',
            then: (schema) => schema.required('Dokumen wajib diunggah'),
            otherwise: (schema) => schema.optional()
        })
    });

    const formik = useFormik({
        initialValues: {
            institution_name: initialValues?.institution_name || '',
            internship_period_start: initialValues?.internship_period_start ? new Date(initialValues.internship_period_start) : null,
            internship_period_end: initialValues?.internship_period_end ? new Date(initialValues.internship_period_end) : null,
            document: null,
            mode: mode
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: (values, { setSubmitting }) => {
            onSubmit(values);
            setSubmitting(false);
        }
    });

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 4, bgcolor: alpha(theme.palette.background.paper, 0.95), backdropFilter: 'blur(10px)' }
            }}
        >
            <DialogTitle sx={{ p: 3, pb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {mode === 'create' ? 'Tambah Arsip Baru' : 'Edit Arsip Institusi'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Isi detail kerjasama institusi di bawah ini.
                </Typography>
            </DialogTitle>

            <form onSubmit={formik.handleSubmit}>
                <DialogContent sx={{ p: 3, pt: 1 }}>
                    <Stack spacing={3}>
                        <TextField
                            fullWidth
                            name="institution_name"
                            label="Nama Institusi"
                            placeholder="Masukkan nama sekolah/universitas"
                            value={formik.values.institution_name}
                            onChange={formik.handleChange}
                            error={formik.touched.institution_name && Boolean(formik.errors.institution_name)}
                            helperText={formik.touched.institution_name && formik.errors.institution_name as string}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Building size="20" color={theme.palette.primary.main} variant="Bulk" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <DatePicker
                                    label="Periode Mulai"
                                    value={formik.values.internship_period_start}
                                    onChange={(date) => formik.setFieldValue('internship_period_start', date)}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            error: formik.touched.internship_period_start && Boolean(formik.errors.internship_period_start),
                                            helperText: formik.touched.internship_period_start && formik.errors.internship_period_start as string,
                                            InputProps: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Calendar size="20" color={theme.palette.info.main} variant="Bulk" />
                                                    </InputAdornment>
                                                ),
                                            }
                                        }
                                    }}
                                />
                                <DatePicker
                                    label="Periode Selesai"
                                    value={formik.values.internship_period_end}
                                    onChange={(date) => formik.setFieldValue('internship_period_end', date)}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            error: formik.touched.internship_period_end && Boolean(formik.errors.internship_period_end),
                                            helperText: formik.touched.internship_period_end && formik.errors.internship_period_end as string,
                                            InputProps: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Calendar size="20" color={theme.palette.error.main} variant="Bulk" />
                                                    </InputAdornment>
                                                ),
                                            }
                                        }
                                    }}
                                />
                            </Stack>
                        </LocalizationProvider>

                        <Box>
                            <Button
                                component="label"
                                fullWidth
                                variant="outlined"
                                sx={{
                                    height: 100,
                                    borderStyle: 'dashed',
                                    borderWidth: 2,
                                    borderRadius: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1,
                                    textTransform: 'none',
                                    borderColor: (formik.touched.document && formik.errors.document) ? 'error.main' : alpha(theme.palette.primary.main, 0.3),
                                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                                        borderColor: theme.palette.primary.main
                                    }
                                }}
                            >
                                <DocumentCloud size="32" variant="Bulk" color={theme.palette.primary.main} />
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                        {formik.values.document ? (formik.values.document as File).name : "Pilih atau Seret Berkas ke Sini"}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Support PDF, DOCX (Max 10MB)
                                    </Typography>
                                </Box>
                                <input
                                    type="file"
                                    hidden
                                    accept=".pdf,.doc,.docx"
                                    onChange={(event) => {
                                        if (event.currentTarget.files) {
                                            formik.setFieldValue("document", event.currentTarget.files[0]);
                                        }
                                    }}
                                />
                            </Button>
                            {formik.touched.document && formik.errors.document && (
                                <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <CloseCircle size="14" /> {formik.errors.document as string}
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button onClick={onClose} variant="text" color="inherit" sx={{ fontWeight: 700 }}>
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={formik.isSubmitting || isLoading}
                        sx={{
                            borderRadius: 2.5,
                            px: 4,
                            py: 1.2,
                            fontWeight: 700,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                            boxShadow: `0 6px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                        }}
                    >
                        {isLoading ? 'Memproses...' : (mode === 'create' ? 'Simpan Arsip' : 'Perbarui Data')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ArsipDialog;

