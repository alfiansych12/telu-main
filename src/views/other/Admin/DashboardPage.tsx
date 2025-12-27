'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// MATERIAL - UI
import Typography from '@mui/material/Typography';
import {
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// PROJECT IMPORTS
import MainCard from 'components/MainCard';
import CustomBreadcrumbs from 'components/@extended/CustomBreadcrumbs';
import { getDashboardStats } from 'utils/api/dashboard';
import { createUser } from 'utils/api/users';
import { createUnit } from 'utils/api/units';

// ==============================|| DASHBOARD PAGE ||============================== //

const DashboardView = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [openUser, setOpenUser] = useState(false);
  const [openUnit, setOpenUnit] = useState(false);

  // Fetch dashboard stats
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setOpenUser(false);
    },
  });

  // Create unit mutation
  const createUnitMutation = useMutation({
    mutationFn: createUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['units'] });
      setOpenUnit(false);
    },
  });

  // Handle user form submit
  const handleUserSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const userData = {
      email: formData.get('email') as string,
      name: formData.get('email')?.toString().split('@')[0] || 'User', // Extract name from email
      role: formData.get('role') as any,
      status: 'active' as any,
      internship_start: formData.get('internship_start') as string || null,
      internship_end: formData.get('internship_end') as string || null,
    };

    createUserMutation.mutate(userData);
  };

  // Handle unit form submit
  const handleUnitSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const unitData = {
      name: formData.get('name') as string,
      department: formData.get('department') as string,
      status: 'active' as any,
    };

    createUnitMutation.mutate(unitData);
  };

  return (
    <>
      <MainCard border={false} shadow={theme.customShadows.z1} sx={{ mb: 3, p: 0 }}>
        <CustomBreadcrumbs
          items={['Dashboard']}
          showDate
          showExport
        />
      </MainCard>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading dashboard: {(error as Error).message}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <MainCard border={false} shadow={theme.customShadows.z1} sx={{ height: '100%' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, verticalAlign: 'middle' }}>groups</span>
              Total Participants
            </Typography>
            {isLoading ? (
              <CircularProgress size={32} sx={{ mt: 1 }} />
            ) : (
              <Typography variant="h3" sx={{ mt: 1, fontSize: { xs: '1.5rem', md: '2.5rem' } }}>
                {stats?.totalParticipants || 0}
              </Typography>
            )}
          </MainCard>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MainCard border={false} shadow={theme.customShadows.z1} sx={{ height: '100%' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, verticalAlign: 'middle' }}>supervisor_account</span>
              Total Supervisors
            </Typography>
            {isLoading ? (
              <CircularProgress size={32} sx={{ mt: 1 }} />
            ) : (
              <Typography variant="h3" sx={{ mt: 1, fontSize: { xs: '1.5rem', md: '2.5rem' } }}>
                {stats?.totalSupervisors || 0}
              </Typography>
            )}
          </MainCard>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MainCard border={false} shadow={theme.customShadows.z1} sx={{ height: '100%' }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, verticalAlign: 'middle' }}>apartment</span>
              Total Units
            </Typography>
            {isLoading ? (
              <CircularProgress size={32} sx={{ mt: 1 }} />
            ) : (
              <Typography variant="h3" sx={{ mt: 1, fontSize: { xs: '1.5rem', md: '2.5rem' } }}>
                {stats?.totalUnits || 0}
              </Typography>
            )}
          </MainCard>
        </Grid>
      </Grid>

      {/* Action Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <MainCard
            border={false}
            shadow={theme.customShadows.z1}
            sx={{ height: '100%', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}
            onClick={() => setOpenUser(true)}
          >
            <Typography variant='h4' sx={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32, verticalAlign: 'middle' }}>add</span>
              Add User
            </Typography>
          </MainCard>
        </Grid>
        <Grid item xs={12} sm={6}>
          <MainCard
            border={false}
            shadow={theme.customShadows.z1}
            sx={{ height: '100%', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}
            onClick={() => setOpenUnit(true)}
          >
            <Typography variant='h4' sx={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
              <span className="material-symbols-outlined" style={{ fontSize: 34, verticalAlign: 'middle' }}>add</span>
              Add Unit
            </Typography>
          </MainCard>
        </Grid>
      </Grid>

      {/* Dialog Add Users */}
      <Dialog open={openUser} onClose={() => setOpenUser(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add User</DialogTitle>
        <form onSubmit={handleUserSubmit}>
          <DialogContent>
            <Box component="div" sx={{ mt: 1, minWidth: 300, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                margin="normal"
                label="Email"
                name="email"
                type="email"
                required
                fullWidth
              />
              <TextField
                margin="normal"
                label="Role"
                name="role"
                select
                fullWidth
                SelectProps={{ native: true }}
                defaultValue="participant"
              >
                <option value="participant">Participant</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Admin</option>
              </TextField>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  label="Internship Start"
                  name="internship_start"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="Internship End"
                  name="internship_end"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Box>
              {createUserMutation.isError && (
                <Alert severity="error">
                  {(createUserMutation.error as Error).message}
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenUser(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog Add Units */}
      <Dialog open={openUnit} onClose={() => setOpenUnit(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Unit</DialogTitle>
        <form onSubmit={handleUnitSubmit}>
          <DialogContent>
            <Box component="div" sx={{ mt: 1, minWidth: 300, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                margin="normal"
                label="Unit Name"
                name="name"
                required
                fullWidth
              />
              <TextField
                margin="normal"
                label="Department"
                name="department"
                required
                fullWidth
              />
              {createUnitMutation.isError && (
                <Alert severity="error">
                  {(createUnitMutation.error as Error).message}
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenUnit(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createUnitMutation.isPending}
            >
              {createUnitMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default DashboardView;
