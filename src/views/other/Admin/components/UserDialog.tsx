'use client';

import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Alert,
    TextField,
    MenuItem,
    Typography,
    Autocomplete,
    Button,
    Stack,
    InputAdornment,
    IconButton
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeSlash } from 'iconsax-react';

interface UserDialogProps {
    open: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    user: any;
    onSubmit: (values: any) => void;
    error: any;
    allUnitsData: any;
    allSupervisorsData: any;
    isLoading?: boolean;
}

const UserDialog = ({
    open,
    onClose,
    mode,
    user,
    onSubmit,
    error,
    allUnitsData,
    allSupervisorsData,
    isLoading
}: UserDialogProps) => {
    const theme = useTheme();
    const [showPassword, setShowPassword] = React.useState(false);

    const validationSchema = Yup.object().shape({
        name: Yup.string().max(255).required('Full Name is required'),
        email: Yup.string().max(255).required('Email or Username is required'),
        telegram_username: Yup.string().nullable(),
        password: Yup.string().when(['mode', 'role'], {
            is: (mode: string, role: string) => mode === 'create' && role !== 'admin',
            then: (schema) => schema.min(6, 'Password must be at least 6 characters').required('Password is required'),
            otherwise: (schema) => schema.min(6, 'Password must be at least 6 characters')
        }),
        id_number: Yup.string().nullable(),
        role: Yup.string().required('Role is required'),
        unit_id: Yup.string().nullable(),
        status: Yup.string().required('Status is required'),
        internship_start: Yup.date().nullable(),
        internship_end: Yup.date().nullable(),
        institution_name: Yup.string().nullable(),
        mode: Yup.string().oneOf(['create', 'edit']).required(),
        institution_type: Yup.string().oneOf(['UNIVERSITAS', 'SMK', 'SMA', 'LAINNYA']).required('Institution type is required')
    });

    const formik = useFormik({
        initialValues: {
            name: user?.name || '',
            email: user?.email || '',
            telegram_username: user?.telegram_username || '',
            password: '',
            role: user?.role || 'participant',
            id_number: user?.id_number || '',
            unit_id: user?.unit_id || '',
            supervisor_id: user?.supervisor_id || '',
            status: user?.status || 'active',
            internship_start: user?.internship_start ? new Date(user.internship_start) : null,
            internship_end: user?.internship_end ? new Date(user.internship_end) : null,
            institution_name: user?.institution_name || '',
            institution_type: user?.institution_type || 'UNIVERSITAS',
            duration: '', // Helper field for automatic date calculation
            mode // passing mode to schema validation context
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: (values, { setSubmitting }) => {
            // Remove helper fields before submit
            const { duration, mode: _, ...submitValues } = values;
            onSubmit(submitValues);
            setSubmitting(false);
        }
    });

    // Auto-calculate End Date based on duration and institution type
    React.useEffect(() => {
        if (formik.values.duration && formik.values.internship_start) {
            const start = new Date(formik.values.internship_start);
            const durationNum = parseInt(formik.values.duration);
            if (!isNaN(durationNum)) {
                let monthsToAdd = 0;
                if (formik.values.institution_type === 'UNIVERSITAS') {
                    monthsToAdd = durationNum * 6; // 1 Semester = 6 Months
                } else if (formik.values.institution_type === 'SMK' || formik.values.institution_type === 'SMA') {
                    monthsToAdd = durationNum; // 1 Month = 1 Month
                } else {
                    monthsToAdd = durationNum; // Default to months
                }

                const end = new Date(start);
                end.setMonth(start.getMonth() + monthsToAdd);
                formik.setFieldValue('internship_end', end);
            }
        }
    }, [formik.values.duration, formik.values.internship_start, formik.values.institution_type]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>{mode === 'create' ? 'Add User' : 'Edit User'}</DialogTitle>
            <form onSubmit={formik.handleSubmit}>
                <DialogContent dividers>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        {error && (
                            <Alert severity="error" sx={{ borderRadius: 2 }}>
                                {error.message || 'An error occurred while saving user data'}
                            </Alert>
                        )}

                        <TextField
                            fullWidth
                            name="name"
                            label="Full Name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            error={formik.touched.name && Boolean(formik.errors.name)}
                            helperText={formik.touched.name && formik.errors.name as string}
                        />

                        <TextField
                            fullWidth
                            name="email"
                            label="Email Address / Username"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email as string}
                        />

                        <TextField
                            fullWidth
                            name="telegram_username"
                            label="Telegram ID (Chat ID)"
                            placeholder="e.g. 123456789 (from @userinfobot)"
                            value={formik.values.telegram_username}
                            onChange={formik.handleChange}
                            error={formik.touched.telegram_username && Boolean(formik.errors.telegram_username)}
                            helperText={formik.touched.telegram_username && formik.errors.telegram_username as string}
                        />

                        {formik.values.role !== 'admin' && (
                            <TextField
                                fullWidth
                                name="password"
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder={mode === 'edit' ? 'Leave blank to keep current' : 'Enter password'}
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                error={formik.touched.password && Boolean(formik.errors.password)}
                                helperText={formik.touched.password && formik.errors.password as string}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                size="small"
                                            >
                                                {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        )}

                        <TextField
                            fullWidth
                            select
                            name="role"
                            label="Role"
                            value={formik.values.role}
                            onChange={formik.handleChange}
                            error={formik.touched.role && Boolean(formik.errors.role)}
                            helperText={formik.touched.role && formik.errors.role as string}
                            sx={{
                                '& .MuiSelect-select': { display: 'flex', alignItems: 'center', gap: 1.5 }
                            }}
                        >
                            <MenuItem value="participant">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 0.5 }}>
                                    <Box sx={{ width: 32, height: 32, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: theme.palette.success.lighter, color: theme.palette.success.main }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>person</span>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Participant</Typography>
                                        <Typography variant="caption" color="text.secondary">Default access for internship students</Typography>
                                    </Box>
                                </Box>
                            </MenuItem>
                            <MenuItem value="supervisor">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 0.5 }}>
                                    <Box sx={{ width: 32, height: 32, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: theme.palette.warning.lighter, color: theme.palette.warning.main }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>manage_accounts</span>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Supervisor</Typography>
                                        <Typography variant="caption" color="text.secondary">Management access for unit leads</Typography>
                                    </Box>
                                </Box>
                            </MenuItem>
                            <MenuItem value="admin">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 0.5 }}>
                                    <Box sx={{ width: 32, height: 32, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: theme.palette.primary.lighter, color: theme.palette.primary.main }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>admin_panel_settings</span>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Administrator</Typography>
                                        <Typography variant="caption" color="text.secondary">Full system access and configuration</Typography>
                                    </Box>
                                </Box>
                            </MenuItem>
                        </TextField>

                        {(formik.values.role === 'supervisor' || formik.values.role === 'admin') && (
                            <TextField
                                fullWidth
                                name="id_number"
                                label="NIP / NIK (Supervisor)"
                                value={formik.values.id_number}
                                onChange={formik.handleChange}
                                placeholder="Masukkan NIP atau NIK"
                                helperText="Identitas ini akan dicantumkan sebagai evaluator pada sertifikat."
                            />
                        )}

                        <TextField
                            fullWidth
                            select
                            name="unit_id"
                            label="Assigned Unit"
                            value={formik.values.unit_id}
                            onChange={formik.handleChange}
                        >
                            <MenuItem value=""><em>None / Unassigned</em></MenuItem>
                            {allUnitsData?.data?.map((unit: any) => (
                                <MenuItem key={unit.id} value={unit.id}>
                                    {unit.name} ({unit.department})
                                </MenuItem>
                            ))}
                        </TextField>

                        {formik.values.role === 'participant' && (
                            <Stack spacing={3} sx={{ p: 2.5, bgcolor: alpha(theme.palette.primary.main, 0.04), borderRadius: 3, border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}` }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>assignment_ind</span>
                                    Internship Details
                                </Typography>

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <TextField
                                        fullWidth
                                        select
                                        name="institution_type"
                                        label="Institution Type"
                                        value={formik.values.institution_type}
                                        onChange={formik.handleChange}
                                    >
                                        <MenuItem value="UNIVERSITAS">University (Semester)</MenuItem>
                                        <MenuItem value="SMK">SMK (Month)</MenuItem>
                                        <MenuItem value="SMA">SMA (Month)</MenuItem>
                                        <MenuItem value="LAINNYA">Other</MenuItem>
                                    </TextField>
                                    <TextField
                                        fullWidth
                                        name="institution_name"
                                        label="School / University Name"
                                        value={formik.values.institution_name}
                                        onChange={formik.handleChange}
                                    />
                                </Stack>

                                <Autocomplete
                                    fullWidth
                                    options={
                                        formik.values.unit_id
                                            ? (allSupervisorsData?.data || []).filter((s: any) => s.unit_id === formik.values.unit_id)
                                            : (allSupervisorsData?.data || [])
                                    }
                                    getOptionLabel={(option: any) => option.name}
                                    isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
                                    value={allSupervisorsData?.data?.find((s: any) => s.id === formik.values.supervisor_id) || null}
                                    onChange={(_, newValue) => formik.setFieldValue('supervisor_id', newValue?.id || '')}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Assign Mentor / Supervisor"
                                            helperText={
                                                formik.values.unit_id
                                                    ? `Showing supervisors from the selected unit`
                                                    : "Select a unit first to filter supervisors"
                                            }
                                        />
                                    )}
                                    noOptionsText={formik.values.unit_id ? "No supervisors found in this unit" : "Please select unit first"}
                                />

                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                        <DatePicker
                                            label="Start Date"
                                            value={formik.values.internship_start}
                                            onChange={(date) => formik.setFieldValue('internship_start', date)}
                                            slotProps={{ textField: { fullWidth: true } }}
                                        />
                                        <TextField
                                            fullWidth
                                            name="duration"
                                            label={formik.values.institution_type === 'UNIVERSITAS' ? "Duration (Semesters)" : "Duration (Months)"}
                                            type="number"
                                            value={formik.values.duration}
                                            onChange={formik.handleChange}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">{formik.values.institution_type === 'UNIVERSITAS' ? 'Sem' : 'Mo'}</InputAdornment>
                                            }}
                                        />
                                        <DatePicker
                                            label="End Date"
                                            value={formik.values.internship_end}
                                            onChange={(date) => formik.setFieldValue('internship_end', date)}
                                            slotProps={{ textField: { fullWidth: true } }}
                                        />
                                    </Stack>
                                </LocalizationProvider>

                                <TextField
                                    fullWidth
                                    select
                                    name="status"
                                    label="Account Status"
                                    value={formik.values.status}
                                    onChange={formik.handleChange}
                                >
                                    <MenuItem value="active">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: theme.palette.success.main }} />
                                            Active Student
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="inactive">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: theme.palette.error.main }} />
                                            Inactive / Finished
                                        </Box>
                                    </MenuItem>
                                </TextField>
                            </Stack>
                        )}
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
                        {isLoading ? 'Processing...' : (mode === 'create' ? 'Create User' : 'Save Changes')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default UserDialog;


