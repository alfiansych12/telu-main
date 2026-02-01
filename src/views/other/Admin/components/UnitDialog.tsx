'use client';

import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Alert,
    TextField,
    MenuItem,
    Button,
    Stack
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { useFormik } from 'formik';
import * as Yup from 'yup';

interface UnitDialogProps {
    open: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    unit: any;
    onSubmit: (values: any) => void;
    error: any;
    isLoading?: boolean;
}

const UnitDialog = ({
    open,
    onClose,
    mode,
    unit,
    onSubmit,
    error,
    isLoading
}: UnitDialogProps) => {
    const theme = useTheme();

    const validationSchema = Yup.object().shape({
        name: Yup.string().max(255).required('Unit Name is required'),
        department: Yup.string().max(255).required('Department is required'),
        manager_name: Yup.string().max(255).nullable(),
        status: Yup.string().required('Status is required'),
        capacity: Yup.number().min(0, 'Capacity cannot be negative').required('Capacity is required')
    });

    const formik = useFormik({
        initialValues: {
            name: unit?.name || '',
            department: unit?.department || '',
            manager_name: unit?.manager_name || '',
            status: unit?.status || 'active',
            capacity: unit?.capacity || 0
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: (values, { setSubmitting }) => {
            onSubmit(values);
            setSubmitting(false);
        }
    });

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 3, px: 3 }}>
                <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main
                }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 28 }}>{mode === 'create' ? 'add_business' : 'edit_note'}</span>
                </Box>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{mode === 'create' ? 'Create Unit' : 'Edit Unit'}</Typography>
                    <Typography variant="caption" color="text.secondary">Define and manage organizational structure</Typography>
                </Box>
            </DialogTitle>
            <form onSubmit={formik.handleSubmit}>
                <DialogContent dividers sx={{ px: 3, py: 3 }}>
                    <Stack spacing={4}>
                        {error && (
                            <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
                                {error.message || 'An error occurred while saving unit data'}
                            </Alert>
                        )}

                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>info</span>
                                Identity
                            </Typography>
                            <Stack spacing={2.5}>
                                <TextField
                                    fullWidth
                                    name="name"
                                    label="Unit Name"
                                    placeholder="e.g. Creative Digital Design"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    error={formik.touched.name && Boolean(formik.errors.name)}
                                    helperText={formik.touched.name && formik.errors.name as string}
                                />
                                <TextField
                                    fullWidth
                                    name="department"
                                    label="Department"
                                    placeholder="e.g. Multimedia Division"
                                    value={formik.values.department}
                                    onChange={formik.handleChange}
                                    error={formik.touched.department && Boolean(formik.errors.department)}
                                    helperText={formik.touched.department && formik.errors.department as string}
                                />
                            </Stack>
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>settings</span>
                                Configuration
                            </Typography>
                            <Stack spacing={2.5}>
                                <TextField
                                    fullWidth
                                    name="manager_name"
                                    label="Lead / Responsible Person"
                                    placeholder="Full name of unit manager"
                                    value={formik.values.manager_name}
                                    onChange={formik.handleChange}
                                    error={formik.touched.manager_name && Boolean(formik.errors.manager_name)}
                                    helperText={formik.touched.manager_name && formik.errors.manager_name as string}
                                />
                                <TextField
                                    fullWidth
                                    type="number"
                                    name="capacity"
                                    label="Unit Capacity (Slots)"
                                    placeholder="e.g. 10"
                                    value={formik.values.capacity}
                                    onChange={formik.handleChange}
                                    error={formik.touched.capacity && Boolean(formik.errors.capacity)}
                                    helperText={formik.touched.capacity && formik.errors.capacity as string}
                                />
                                <TextField
                                    fullWidth
                                    select
                                    name="status"
                                    label="Operational Status"
                                    value={formik.values.status}
                                    onChange={formik.handleChange}
                                >
                                    <MenuItem value="active">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: theme.palette.success.main }} />
                                            Active / Operational
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="inactive">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: theme.palette.error.main }} />
                                            Inactive / On Hold
                                        </Box>
                                    </MenuItem>
                                </TextField>
                            </Stack>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={onClose} color="inherit" size="large">Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={formik.isSubmitting || isLoading}
                        sx={{ borderRadius: 2, px: 4 }}
                    >
                        {isLoading ? 'Processing...' : (mode === 'create' ? 'Create Unit' : 'Save Changes')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default UnitDialog;
