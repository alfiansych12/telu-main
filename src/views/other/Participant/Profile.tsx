'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// MATERIAL - UI
import {
  Grid,
  Typography,
  Box,
  TextField,
  Button,
  Stack,
  Avatar,
  Divider,
  Paper,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Alert,
  Chip,
  CircularProgress,
  MenuItem,
  Select,
  FormControl
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

// PROJECT IMPORTS
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import { updateUser, getUserById } from 'utils/api/users';
import { openAlert } from 'api/alert';

// ICONS
import { Eye, EyeSlash, Personalcard, Global, PasswordCheck, Edit, User as UserIcon, CalendarTick, Building, Call, Sms } from 'iconsax-react';

// ==============================|| PROFILE PAGE ||============================== //

export default function ProfilePage() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { data: session, update: updateSession } = useSession();
  const user = session?.user as any;
  const { data: userData } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: () => getUserById(user?.id),
    enabled: !!user?.id
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    photo: '',
    phone: '',
    institution_name: '',
    institution_type: 'UNIVERSITAS',
    personal_email: '',
    password: '',
    confirmPassword: ''
  });

  // Sync form data when userData matches
  React.useEffect(() => {
    if (userData) {
      setFormData(prev => ({
        ...prev,
        name: userData.name || '',
        email: userData.email || '',
        photo: userData.photo || '',
        phone: userData.phone || '',
        institution_name: userData.institution_name || '',
        institution_type: userData.institution_type || 'UNIVERSITAS',
        personal_email: userData.personal_email || ''
      }));
    }
  }, [userData]);

  const displayUser = userData || (session?.user as any);

  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: any) => updateUser(user?.id, data),
    onSuccess: async () => {
      await updateSession({
        name: formData.name,
        photo: formData.photo,
        email: formData.email,
        phone: formData.phone,
        institution_name: formData.institution_name,
        institution_type: formData.institution_type,
        personal_email: formData.personal_email
      });
      queryClient.invalidateQueries({ queryKey: ['user-profile', user?.id] });
      openAlert({
        title: 'Profile Updated',
        message: 'Your profile information has been successfully updated.',
        variant: 'success'
      });
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message || 'An error occurred while updating profile.');
    }
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (formData.password && formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const payload: any = {
      name: formData.name,
      email: formData.email,
      photo: formData.photo,
      phone: formData.phone,
      institution_name: formData.institution_name,
      institution_type: formData.institution_type,
      personal_email: formData.personal_email
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    mutation.mutate(payload);
  };

  if (!session) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ px: 1 }}>
      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Profile Settings</Typography>
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
            {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{
            p: 4,
            borderRadius: 4,
            textAlign: 'center',
            background: `linear-gradient(135deg, ${theme.palette.primary.lighter}, #fff)`,
            border: `1px solid ${theme.palette.divider}`,
            height: '100%',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 15px 35px -8px ${alpha(theme.palette.primary.main, 0.2)}`,
              borderColor: alpha(theme.palette.primary.main, 0.3)
            }
          }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                src={formData.photo || "/assets/images/users/user-round.png"}
                sx={{ width: 120, height: 120, mb: 2, border: `4px solid ${theme.palette.background.paper}`, boxShadow: theme.customShadows.z1 }}
              />
              <input
                type="file"
                id="profile-photo-upload"
                hidden
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFormData({ ...formData, photo: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <IconButton
                size="small"
                color="primary"
                onClick={() => document.getElementById('profile-photo-upload')?.click()}
                sx={{
                  position: 'absolute',
                  bottom: 15,
                  right: 5,
                  bgcolor: theme.palette.primary.main,
                  color: '#fff',
                  '&:hover': { bgcolor: theme.palette.primary.dark }
                }}
              >
                <Edit size={16} />
              </IconButton>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{displayUser?.name}</Typography>
            <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 3 }}>
              {displayUser?.role === 'admin' ? 'System Administrator' : displayUser?.role === 'supervisor' ? 'Field Supervisor' : 'Internship Participant'}
            </Typography>

            <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

            <Stack spacing={2} sx={{ textAlign: 'left' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Personalcard size={20} color={theme.palette.primary.main} />
                <Box>
                  <Typography variant="caption" color="textSecondary">Username</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{displayUser?.email}</Typography>
                </Box>
              </Box>

              {displayUser?.institution_name && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Building size={20} color={theme.palette.primary.main} />
                  <Box>
                    <Typography variant="caption" color="textSecondary">Institution ({displayUser?.institution_type})</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{displayUser?.institution_name}</Typography>
                  </Box>
                </Box>
              )}

              {displayUser?.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Call size={20} color={theme.palette.primary.main} />
                  <Box>
                    <Typography variant="caption" color="textSecondary">Phone Number</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{displayUser?.phone}</Typography>
                  </Box>
                </Box>
              )}

              {displayUser?.personal_email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Sms size={20} color={theme.palette.primary.main} />
                  <Box>
                    <Typography variant="caption" color="textSecondary">Personal Email</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{displayUser?.personal_email}</Typography>
                  </Box>
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Global size={20} color={theme.palette.primary.main} />
                <Box>
                  <Typography variant="caption" color="textSecondary">Account Status</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>Active</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <UserIcon size={20} color={theme.palette.primary.main} />
                <Box>
                  <Typography variant="caption" color="textSecondary">System Role</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>{displayUser?.role}</Typography>
                </Box>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Edit Form */}
        <Grid item xs={12} md={8}>
          <MainCard title="Account Settings" subheader="Review and update your system profile information">
            <form onSubmit={handleUpdateProfile}>
              <Grid container spacing={3}>
                {error && (
                  <Grid item xs={12}>
                    <Alert severity="error">{error}</Alert>
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <InputLabel>Full Name</InputLabel>
                    <TextField
                      fullWidth
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <InputLabel>Username</InputLabel>
                    <TextField
                      fullWidth
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter username"
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }}>
                    <Chip label="Personal Identity & Education" size="small" variant="outlined" />
                  </Divider>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <InputLabel>Institution Type</InputLabel>
                    <FormControl fullWidth>
                      <Select
                        value={formData.institution_type}
                        onChange={(e) => setFormData({ ...formData, institution_type: e.target.value })}
                      >
                        <MenuItem value="SMA">SMA</MenuItem>
                        <MenuItem value="SMK">SMK</MenuItem>
                        <MenuItem value="UNIVERSITAS">UNIVERSITY</MenuItem>
                        <MenuItem value="LAINNYA">OTHER</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <InputLabel>School / University Name</InputLabel>
                    <TextField
                      fullWidth
                      value={formData.institution_name}
                      onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                      placeholder="e.g. Universitas Telkom"
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <InputLabel>Phone Number</InputLabel>
                    <TextField
                      fullWidth
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0812xxxxxxxx"
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <InputLabel>Personal Gmail / Email</InputLabel>
                    <TextField
                      fullWidth
                      value={formData.personal_email}
                      onChange={(e) => setFormData({ ...formData, personal_email: e.target.value })}
                      placeholder="example@gmail.com"
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }}>
                    <Chip label="Security & Password" size="small" variant="outlined" />
                  </Divider>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <InputLabel>New Password</InputLabel>
                    <OutlinedInput
                      type={showPassword ? 'text' : 'password'}
                      fullWidth
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter new password"
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} onMouseDown={(e) => e.preventDefault()} edge="end" color="secondary">
                            {showPassword ? <Eye /> : <EyeSlash />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    <Typography variant="caption" color="textSecondary">Leave blank to keep current password (Min 6 chars)</Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <InputLabel>Confirm New Password</InputLabel>
                    <OutlinedInput
                      type={showPassword ? 'text' : 'password'}
                      fullWidth
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12}>
                  <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                    <Button variant="outlined" color="secondary" onClick={() => setFormData({
                      name: displayUser.name || '',
                      email: displayUser.email || '',
                      photo: displayUser.photo || '',
                      phone: displayUser.phone || '',
                      institution_name: displayUser.institution_name || '',
                      institution_type: displayUser.institution_type || 'UNIVERSITAS',
                      personal_email: displayUser.personal_email || '',
                      password: '',
                      confirmPassword: ''
                    })}>Reset</Button>
                    <Button
                      variant="contained"
                      type="submit"
                      disabled={mutation.isPending}
                      startIcon={mutation.isPending ? <CircularProgress size={16} color="inherit" /> : <PasswordCheck />}
                    >
                      {mutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </form>
          </MainCard>
        </Grid>
      </Grid>
    </Box>
  );
}