'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// MATERIAL - UI
import {
    Box,
    Typography,
    Grid,
    Stack,
    Button,
    TextField,
    MenuItem,
    CircularProgress,
    Alert,
    Breadcrumbs,
    Link,
    Divider,
    LinearProgress,
    IconButton,
    Avatar,
    AvatarGroup,
    Tooltip
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

// ICONS
import {
    ArrowLeft,
    Setting5,
    Information,
    TickCircle,
    Personalcard
} from 'iconsax-react';

// PROJECT IMPORTS
import MainCard from 'components/MainCard';
import { getUnitById, updateUnit } from 'utils/api/units';
import { openAlert } from 'api/alert';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const UnitSettingsView = () => {
    const { id } = useParams();
    const theme = useTheme();
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: unit, isLoading, error } = useQuery({
        queryKey: ['unit-detail', id],
        queryFn: () => getUnitById(id as string),
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => updateUnit(id as string, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['unit-detail', id] });
            queryClient.invalidateQueries({ queryKey: ['management-page-data'] });
            openAlert({
                variant: 'success',
                title: 'Unit Updated',
                message: 'Unit configuration has been successfully saved.'
            });
        },
        onError: (err: any) => {
            openAlert({
                variant: 'error',
                title: 'Update Failed',
                message: err.message || 'An error occurred while saving unit data.'
            });
        }
    });

    const formik = useFormik({
        initialValues: {
            name: unit?.name || '',
            department: unit?.department || '',
            manager_name: unit?.manager_name || '',
            status: unit?.status || 'active',
            capacity: unit?.capacity || 0,
            description: unit?.description || ''
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            name: Yup.string().required('Unit Name is required'),
            department: Yup.string().required('Department is required'),
            capacity: Yup.number().min(0, 'Minimum capacity is 0').required('Capacity is required'),
        }),
        onSubmit: (values) => {
            updateMutation.mutate(values);
        }
    });

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !unit) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">Unit not found or an error occurred.</Alert>
                <Button startIcon={<ArrowLeft />} onClick={() => router.back()} sx={{ mt: 2 }}>Back</Button>
            </Box>
        );
    }

    const fillPercentage = unit.capacity ? Math.min(100, ((unit.employee_count || 0) / unit.capacity) * 100) : 0;
    const isOverCapacity = (unit.employee_count || 0) > (unit.capacity || 0);

    return (
        <Box sx={{ px: { xs: 1, md: 3 } }}>
            {/* Breadcrumbs & Header */}
            <Stack spacing={1} sx={{ mb: 4 }}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
                    <Link underline="hover" color="inherit" onClick={() => router.push('/ManagementData')} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        Management Data
                    </Link>
                    <Typography color="text.primary">Unit Settings</Typography>
                </Breadcrumbs>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <IconButton onClick={() => router.back()} sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                            <ArrowLeft />
                        </IconButton>
                        <Box>
                            <Typography variant="h3" sx={{ fontWeight: 700 }}>Unit Settings: {unit.name}</Typography>
                            <Typography variant="caption" color="textSecondary">{unit.department} • ID: {unit.id}</Typography>
                        </Box>
                    </Stack>
                </Stack>
            </Stack>

            <Grid container spacing={3}>
                {/* Left Column - Stats & Distribution */}
                <Grid item xs={12} md={4}>
                    <Stack spacing={3}>
                        {/* Capacity Card */}
                        <MainCard title="Capacity & Occupancy">
                            <Stack spacing={2}>
                                <Box>
                                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                        <Typography variant="body2" color="textSecondary">Occupancy Rate</Typography>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                            {unit.employee_count} / {unit.capacity || 0} Filled
                                        </Typography>
                                    </Stack>
                                    <LinearProgress
                                        variant="determinate"
                                        value={fillPercentage}
                                        color={isOverCapacity ? 'error' : fillPercentage > 80 ? 'warning' : 'primary'}
                                        sx={{ height: 8, borderRadius: 4 }}
                                    />
                                </Box>

                                <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>Available Slots Remaining</Typography>
                                    <Typography variant="h4" color="primary.main" sx={{ fontWeight: 800 }}>
                                        {Math.max(0, (unit.capacity || 0) - (unit.employee_count || 0))} Students
                                    </Typography>
                                </Box>

                                {isOverCapacity && (
                                    <Alert severity="warning" variant="outlined" sx={{ borderStyle: 'dashed' }}>
                                        This unit exceeds the specified capacity.
                                    </Alert>
                                )}
                            </Stack>
                        </MainCard>

                        {/* Supervisor Distribution Card */}
                        <MainCard title="Supervisor Distribution">
                            <Stack spacing={2.5}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2" color="textSecondary">Total Supervisors</Typography>
                                    <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main', fontWeight: 700, fontSize: '0.75rem' }}>
                                        {(unit as any).supervisors?.length || 0} Mentors
                                    </Box>
                                </Stack>

                                <Divider />

                                {(unit as any).supervisors?.length > 0 ? (
                                    <Stack spacing={2.5}>
                                        {(unit as any).supervisors.map((sup: any) => (
                                            <Box key={sup.id} sx={{ p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.grey[50], 0.3) }}>
                                                <Stack spacing={2}>
                                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                                        <Avatar src={sup.photo} sx={{ width: 40, height: 40, bgcolor: theme.palette.warning.light }}>
                                                            {sup.name.charAt(0)}
                                                        </Avatar>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{sup.name}</Typography>
                                                            <Typography variant="caption" color="textSecondary">{sup.email}</Typography>
                                                        </Box>
                                                    </Stack>

                                                    <Box>
                                                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                                            <Typography variant="caption" sx={{ fontWeight: 600 }}>Handle: {sup.subordinates?.length || 0} Participants</Typography>
                                                        </Stack>
                                                        <AvatarGroup max={4} sx={{ justifyContent: 'flex-start', '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.7rem' } }}>
                                                            {sup.subordinates?.map((sub: any) => (
                                                                <Tooltip key={sub.id} title={sub.name}>
                                                                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>{sub.name.charAt(0)}</Avatar>
                                                                </Tooltip>
                                                            ))}
                                                        </AvatarGroup>
                                                    </Box>
                                                </Stack>
                                            </Box>
                                        ))}
                                    </Stack>
                                ) : (
                                    <Box sx={{ py: 3, textAlign: 'center' }}>
                                        <Personalcard size={40} variant="Bulk" style={{ opacity: 0.2 }} />
                                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                                            No supervisors in this unit.
                                        </Typography>
                                    </Box>
                                )}

                                {(unit as any).unassigned_count > 0 && (
                                    <Alert severity="info" variant="outlined" sx={{ borderStyle: 'dashed' }}>
                                        There are <b>{(unit as any).unassigned_count} participants</b> who do not have a supervisor yet.
                                    </Alert>
                                )}
                            </Stack>
                        </MainCard>
                    </Stack>
                </Grid>

                {/* Right Column - Forms */}
                <Grid item xs={12} md={8}>
                    <form onSubmit={formik.handleSubmit}>
                        <MainCard
                            title="Unit Detail Configuration"
                            secondary={
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<TickCircle />}
                                    disabled={updateMutation.isPending}
                                >
                                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                                </Button>
                            }
                        >
                            <Stack spacing={4}>
                                {/* Basic Information */}
                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                                        <Information size={18} /> Basic Information
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Unit Name"
                                                name="name"
                                                value={formik.values.name}
                                                onChange={formik.handleChange}
                                                error={formik.touched.name && Boolean(formik.errors.name)}
                                                helperText={formik.touched.name && (formik.errors.name as string)}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Department"
                                                name="department"
                                                value={formik.values.department}
                                                onChange={formik.handleChange}
                                                error={formik.touched.department && Boolean(formik.errors.department)}
                                                helperText={formik.touched.department && (formik.errors.department as string)}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Person in Charge (Manager)"
                                                name="manager_name"
                                                value={formik.values.manager_name}
                                                onChange={formik.handleChange}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                select
                                                fullWidth
                                                label="Status"
                                                name="status"
                                                value={formik.values.status}
                                                onChange={formik.handleChange}
                                            >
                                                <MenuItem value="active">Active</MenuItem>
                                                <MenuItem value="inactive">Inactive</MenuItem>
                                            </TextField>
                                        </Grid>
                                    </Grid>
                                </Box>

                                <Divider />

                                {/* Capacity & JobDesk */}
                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                                        <Setting5 size={18} /> Capacity Planning & JobDesk
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                label="Maximum Capacity (Students)"
                                                name="capacity"
                                                value={formik.values.capacity}
                                                onChange={formik.handleChange}
                                                error={formik.touched.capacity && Boolean(formik.errors.capacity)}
                                                helperText={formik.touched.capacity && (formik.errors.capacity as string || 'Total students that can be accommodated by this unit')}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={6}
                                                label="Unit Description & JobDesk"
                                                name="description"
                                                placeholder="Write the job description or student criteria needed in this unit so schools can adjust accordingly..."
                                                value={formik.values.description}
                                                onChange={formik.handleChange}
                                                helperText="This information will appear in the Excel template to assist schools."
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Stack>
                        </MainCard>
                    </form>
                </Grid>
            </Grid>
        </Box>
    );
};

export default UnitSettingsView;
