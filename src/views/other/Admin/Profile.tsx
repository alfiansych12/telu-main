'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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
  CircularProgress
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

// PROJECT IMPORTS
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import { updateUser } from 'utils/api/users';
import { openAlert } from 'api/alert';

// ICONS
import { Eye, EyeSlash, Personalcard, Global, PasswordCheck, Edit, User as UserIcon, CalendarTick } from 'iconsax-react';

// ==============================|| PROFILE PAGE ||============================== //

export default function ProfilePage() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { data: session, update: updateSession } = useSession();
  const user = session?.user as any;

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    telegram_username: user?.telegram_username || '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: any) => updateUser(user?.id, data),
    onSuccess: async () => {
      await updateSession({
        name: formData.name,
        email: formData.email,
        telegram_username: formData.telegram_username
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
      telegram_username: formData.telegram_username
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
                src="/assets/images/users/user-round.png"
                sx={{ width: 120, height: 120, mb: 2, border: `4px solid ${theme.palette.background.paper}`, boxShadow: theme.customShadows.z1 }}
              />
              <IconButton
                size="small"
                color="primary"
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
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{user?.name}</Typography>
            <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 3 }}>
              {user?.role === 'admin' ? 'System Administrator' : user?.role === 'supervisor' ? 'Field Supervisor' : 'Internship Participant'}
            </Typography>

            <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

            <Stack spacing={2} sx={{ textAlign: 'left' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Personalcard size={20} color={theme.palette.primary.main} />
                <Box>
                  <Typography variant="caption" color="textSecondary">Username</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.email}</Typography>
                </Box>
              </Box>
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
                  <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>{user?.role}</Typography>
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
                    <InputLabel>Username (Email)</InputLabel>
                    <TextField
                      fullWidth
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter username"
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <InputLabel>Telegram Username</InputLabel>
                    <TextField
                      fullWidth
                      value={formData.telegram_username}
                      onChange={(e) => setFormData({ ...formData, telegram_username: e.target.value })}
                      placeholder="e.g. adityamnss"
                      helperText={
                        <Typography variant="caption" color="textSecondary" component="div">
                          Gunakan username Telegram tanpa tanda @.
                        </Typography>
                      }
                    />
                  </Stack>
                </Grid>

                <Grid item xs={12}>
                  <Alert severity="info" variant="outlined" sx={{ borderStyle: 'dashed' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Cara Mengaktifkan Notifikasi Telegram:
                    </Typography>
                    <ol style={{ margin: '8px 0', paddingLeft: '20px', fontSize: '0.875rem' }}>
                      <li>Buka Telegram dan pastikan anda sudah memiliki <b>Username</b> di pengaturan Telegram.</li>
                      <li>Masukkan username tersebut (contoh: <b>adityamnss</b>) pada kolom di atas.</li>
                      <li><b>WAJIB:</b> Cari dan buka <b>@puti_servicedesk_bot</b> lalu klik tombol <b>START</b>.</li>
                    </ol>
                    <Typography variant="caption">
                      Tanpa menekan <b>START</b> pada @puti_servicedesk_bot, sistem tidak diizinkan mengirim pesan ke anda.
                    </Typography>
                  </Alert>
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
                    <Button variant="outlined" color="secondary" onClick={() => setFormData({ name: user.name, email: user.email, telegram_username: user.telegram_username, password: '', confirmPassword: '' })}>Reset</Button>
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