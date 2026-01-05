'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
// import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// MATERIAL - UI
import {
  Grid,
  Typography,
  Box,
  CircularProgress,
  Stack,
  Avatar,
  Chip,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

// ICONS
import {
  Edit,
  Trash,
  User as UserIcon,
  Building as BuildingIcon
} from 'iconsax-react';

// PROJECT IMPORTS
import MainCard from 'components/MainCard';
import CustomBreadcrumbs from 'components/@extended/CustomBreadcrumbs';
import { getUsers, createUser, updateUser, deleteUser, type UserWithUnit } from 'utils/api/users';
import { getUnits, createUnit, updateUnit, deleteUnit, type UnitWithManager } from 'utils/api/units';

// ==============================|| MANAGEMENT DATA PAGE ||============================== //

const ManagementDataView = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [selectedTable, setSelectedTable] = useState<'users' | 'units'>('users');

  // State untuk Users
  const [usersPage, setUsersPage] = useState(1);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersRoleFilter, setUsersRoleFilter] = useState('all');
  const [usersPageSize, setUsersPageSize] = useState(10);

  // State untuk Units
  const [unitsPage, setUnitsPage] = useState(1);
  const [unitsSearch, setUnitsSearch] = useState('');
  const [unitsStatusFilter, setUnitsStatusFilter] = useState('all');
  const [unitsPageSize, setUnitsPageSize] = useState(10);

  // Dialog states
  const [userDialog, setUserDialog] = useState({ open: false, mode: 'create' as 'create' | 'edit', user: null as UserWithUnit | null });
  const [selectedRoleInDialog, setSelectedRoleInDialog] = useState<string>('participant');
  const [unitDialog, setUnitDialog] = useState({ open: false, mode: 'create' as 'create' | 'edit', unit: null as UnitWithManager | null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '' as 'user' | 'unit', id: '' });

  // Fetch Users
  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['users', usersPage, usersSearch, usersRoleFilter, usersPageSize],
    queryFn: () => getUsers({
      page: usersPage,
      pageSize: usersPageSize,
      search: usersSearch || undefined,
      role: usersRoleFilter !== 'all' ? usersRoleFilter as any : undefined,
    }),
  });

  // Fetch Units for page
  const { data: unitsData, isLoading: unitsLoading, error: unitsError } = useQuery({
    queryKey: ['units', unitsPage, unitsSearch, unitsStatusFilter, unitsPageSize],
    queryFn: () => getUnits({
      page: unitsPage,
      pageSize: unitsPageSize,
      search: unitsSearch || undefined,
      status: unitsStatusFilter !== 'all' ? unitsStatusFilter as any : undefined,
    }),
  });

  // Fetch All Units for Selectors (no pagination)
  const { data: allUnitsData } = useQuery({
    queryKey: ['units', 'all-for-selector'],
    queryFn: () => getUnits({ pageSize: 100 }),
  });

  // Fetch All Supervisors for Selectors
  const { data: allSupervisorsData } = useQuery({
    queryKey: ['users', 'supervisors-for-selector'],
    queryFn: () => getUsers({ role: 'supervisor', pageSize: 100 }),
  });

  // Mutations for Users
  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setUserDialog({ open: false, mode: 'create', user: null });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setUserDialog({ open: false, mode: 'create', user: null });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteDialog({ open: false, type: 'user', id: '' });
    },
  });

  // Mutations for Units
  const createUnitMutation = useMutation({
    mutationFn: createUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      setUnitDialog({ open: false, mode: 'create', unit: null });
    },
  });

  const updateUnitMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateUnit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      setUnitDialog({ open: false, mode: 'create', unit: null });
    },
  });

  const deleteUnitMutation = useMutation({
    mutationFn: deleteUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      setDeleteDialog({ open: false, type: 'unit', id: '' });
    },
  });

  // Handle submit user form
  const handleUserSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string || null,
      name: formData.get('name') as string,
      role: formData.get('role') as any,
      unit_id: formData.get('unit_id') as string || null,
      supervisor_id: formData.get('supervisor_id') as string || null,
      status: (formData.get('status') || 'active') as any,
      internship_start: formData.get('internship_start') as string || null,
      internship_end: formData.get('internship_end') as string || null,
    };

    console.log('Attempting to create/update user with data:', data);

    if (userDialog.mode === 'create') {
      createUserMutation.mutate(data);
    } else if (userDialog.user) {
      updateUserMutation.mutate({ id: userDialog.user.id, data });
    }
  };

  // Handle submit unit form
  const handleUnitSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      department: formData.get('department') as string,
      manager_id: formData.get('manager_id') as string || null,
      status: (formData.get('status') || 'active') as any,
    };

    if (unitDialog.mode === 'create') {
      createUnitMutation.mutate(data);
    } else if (unitDialog.unit) {
      updateUnitMutation.mutate({ id: unitDialog.unit.id, data });
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (deleteDialog.type === 'user') {
      deleteUserMutation.mutate(deleteDialog.id);
    } else {
      deleteUnitMutation.mutate(deleteDialog.id);
    }
  };

  // Table Users
  const UsersTable = (
    <MainCard border={false} shadow={theme.customShadows.z1} sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'stretch', md: 'center' }, gap: 2, mb: 2 }}>
        <Typography variant="h5" sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 28, verticalAlign: 'middle' }}>groups</span>
          User Management
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <TextField
            select
            label="Role"
            size="small"
            value={usersRoleFilter}
            onChange={(e) => setUsersRoleFilter(e.target.value)}
            sx={{
              minWidth: 160,
              '& .MuiSelect-select': { display: 'flex', alignItems: 'center', gap: 1 }
            }}
          >
            <MenuItem value="all">
              <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 8 }}>list</span>
              All Roles
            </MenuItem>
            <MenuItem value="participant">
              <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 8, color: theme.palette.success.main }}>person</span>
              Participants
            </MenuItem>
            <MenuItem value="supervisor">
              <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 8, color: theme.palette.warning.main }}>manage_accounts</span>
              Supervisors
            </MenuItem>
          </TextField>
          <TextField
            size="small"
            placeholder="Search user..."
            value={usersSearch}
            onChange={(e) => setUsersSearch(e.target.value)}
            sx={{ minWidth: 200 }}
          />
          <Button
            variant="contained"
            onClick={() => {
              setUserDialog({ open: true, mode: 'create', user: null });
              setSelectedRoleInDialog('participant');
            }}
            startIcon={<span className="material-symbols-outlined">add</span>}
          >
            Add User
          </Button>
        </Box>
      </Box>

      {usersError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading users: {(usersError as Error).message}
        </Alert>
      )}

      <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
        {usersLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress size={30} />
          </Box>
        ) : (
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: theme.palette.grey[50] }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>User Profile</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Username / Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>System Role</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Assigned Unit</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Mentor/Lead</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Current Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usersData?.users && usersData.users.length > 0 ? (
                usersData.users.map((user) => (
                  <TableRow key={user.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{
                          width: 40,
                          height: 40,
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                        }}>
                          {user.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{user.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>{user.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <BuildingIcon size={14} variant="Bold" style={{ opacity: 0.5 }} />
                        {user.unit?.name || 'Unassigned'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {user.role === 'participant' ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ width: 22, height: 22, fontSize: '0.6rem', bgcolor: theme.palette.warning.light }}>
                            {user.supervisor?.name?.charAt(0) || '?'}
                          </Avatar>
                          <Typography variant="body2">{user.supervisor?.name || 'Not Paired'}</Typography>
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="textSecondary">N/A</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        size="small"
                        color={user.status === 'active' ? 'success' : 'error'}
                        variant="filled"
                        sx={{
                          px: 1,
                          height: 24,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          borderRadius: 1
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Edit Profile">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setUserDialog({ open: true, mode: 'edit', user });
                              setSelectedRoleInDialog(user.role);
                            }}
                            sx={{ color: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.05) }}
                          >
                            <Edit size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Account">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteDialog({ open: true, type: 'user', id: user.id })}
                            sx={{ bgcolor: alpha(theme.palette.error.main, 0.05) }}
                          >
                            <Trash size={18} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <UserIcon size={48} variant="Bulk" style={{ opacity: 0.2 }} />
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>No user data available</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 2 }}>
        <Typography variant="body2" sx={{ mr: 1 }}>Rows per page:</Typography>
        <TextField
          select
          size="small"
          value={usersPageSize}
          onChange={(e) => setUsersPageSize(Number(e.target.value))}
          sx={{ width: 80 }}
        >
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={25}>25</MenuItem>
        </TextField>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
          <Button
            size="small"
            variant="outlined"
            disabled={usersPage === 1}
            onClick={() => setUsersPage(p => Math.max(1, p - 1))}
          >
            ←
          </Button>
          <Typography variant="body2">{usersPage} of {usersData?.totalPages || 1}</Typography>
          <Button
            size="small"
            variant="outlined"
            disabled={!usersData || usersPage >= usersData.totalPages}
            onClick={() => setUsersPage(p => p + 1)}
          >
            →
          </Button>
        </Box>
      </Box>
    </MainCard>
  );

  // Table Units
  const UnitsTable = (
    <MainCard border={false} shadow={theme.customShadows.z1} sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'stretch', md: 'center' }, gap: 2, mb: 2 }}>
        <Typography variant="h5" sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 28, verticalAlign: 'middle' }}>apartment</span>
          Units Management
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <TextField
            select
            label="Status"
            size="small"
            value={unitsStatusFilter}
            onChange={(e) => setUnitsStatusFilter(e.target.value)}
            sx={{
              minWidth: 160,
              '& .MuiSelect-select': { display: 'flex', alignItems: 'center', gap: 1 }
            }}
          >
            <MenuItem value="all">
              <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 8 }}>list</span>
              All Status
            </MenuItem>
            <MenuItem value="active">
              <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 8, color: theme.palette.success.main }}>check_circle</span>
              Active
            </MenuItem>
            <MenuItem value="inactive">
              <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 8, color: theme.palette.error.main }}>cancel</span>
              Inactive
            </MenuItem>
          </TextField>
          <TextField
            size="small"
            placeholder="Search unit..."
            value={unitsSearch}
            onChange={(e) => setUnitsSearch(e.target.value)}
            sx={{ minWidth: 200 }}
          />
          <Button
            variant="contained"
            onClick={() => setUnitDialog({ open: true, mode: 'create', unit: null })}
            startIcon={<span className="material-symbols-outlined">add</span>}
          >
            Add Unit
          </Button>
        </Box>
      </Box>

      {unitsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading units: {(unitsError as Error).message}
        </Alert>
      )}

      <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
        {unitsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress size={30} />
          </Box>
        ) : (
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: theme.palette.grey[50] }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Unit Information</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Manager</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Employee Count</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {unitsData?.units && unitsData.units.length > 0 ? (
                unitsData.units.map((unit) => (
                  <TableRow key={unit.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main
                        }}>
                          <BuildingIcon variant="Bulk" size={20} />
                        </Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{unit.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">{unit.department}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.65rem' }}>
                          {unit.manager?.name.charAt(0)}
                        </Avatar>
                        <Typography variant="body2">{unit.manager?.name || '-'}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${unit.employee_count || 0} Members`}
                        size="small"
                        variant="outlined"
                        color="secondary"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={unit.status}
                        size="small"
                        color={unit.status === 'active' ? 'success' : 'error'}
                        variant="filled"
                        sx={{
                          px: 1,
                          height: 24,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          borderRadius: 1
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Edit Unit">
                          <IconButton
                            size="small"
                            onClick={() => setUnitDialog({ open: true, mode: 'edit', unit })}
                            sx={{ color: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.05) }}
                          >
                            <Edit size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Unit">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteDialog({ open: true, type: 'unit', id: unit.id })}
                            sx={{ bgcolor: alpha(theme.palette.error.main, 0.05) }}
                          >
                            <Trash size={18} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <BuildingIcon size={48} variant="Bulk" style={{ opacity: 0.2 }} />
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>No unit data available</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 2 }}>
        <Typography variant="body2" sx={{ mr: 1 }}>Rows per page:</Typography>
        <TextField
          select
          size="small"
          value={unitsPageSize}
          onChange={(e) => setUnitsPageSize(Number(e.target.value))}
          sx={{ width: 80 }}
        >
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={25}>25</MenuItem>
        </TextField>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
          <Button
            size="small"
            variant="outlined"
            disabled={unitsPage === 1}
            onClick={() => setUnitsPage(p => Math.max(1, p - 1))}
          >
            ←
          </Button>
          <Typography variant="body2">{unitsPage} of {unitsData?.totalPages || 1}</Typography>
          <Button
            size="small"
            variant="outlined"
            disabled={!unitsData || unitsPage >= unitsData.totalPages}
            onClick={() => setUnitsPage(p => p + 1)}
          >
            →
          </Button>
        </Box>
      </Box>
    </MainCard>
  );

  return (
    <>
      <MainCard border={false} shadow={theme.customShadows.z1} sx={{ mb: 3, p: 0 }}>
        <CustomBreadcrumbs
          items={['Dashboard', 'Management Data']}
          showDate
          showExport
        />
      </MainCard>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Paper
            elevation={selectedTable === 'users' ? 8 : 0}
            onClick={() => setSelectedTable('users')}
            sx={{
              p: 3,
              borderRadius: 3,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: selectedTable === 'users' ? 'scale(1.02)' : 'none',
              boxShadow: selectedTable === 'users' ? `0 12px 30px ${alpha(theme.palette.primary.main, 0.4)}` : 'none',
              opacity: selectedTable === 'users' ? 1 : 0.7,
              '&:hover': { opacity: 1, transform: 'translateY(-4px)' }
            }}
          >
            <Stack spacing={1}>
              <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500 }}>Management</Typography>
              <Typography variant="h2" sx={{ fontWeight: 800 }}>Users</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.15)', fontSize: '0.75rem', fontWeight: 600 }}>
                  {usersData?.total || 0} Registered Members
                </Box>
              </Stack>
            </Stack>
            <span
              className="material-symbols-outlined"
              style={{ position: 'absolute', right: -20, bottom: -20, fontSize: 130, opacity: 0.2, color: '#fff' }}
            >
              groups
            </span>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Paper
            elevation={selectedTable === 'units' ? 8 : 0}
            onClick={() => setSelectedTable('units')}
            sx={{
              p: 3,
              borderRadius: 3,
              background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: selectedTable === 'units' ? 'scale(1.02)' : 'none',
              boxShadow: selectedTable === 'units' ? `0 12px 30px ${alpha(theme.palette.success.main, 0.4)}` : 'none',
              opacity: selectedTable === 'units' ? 1 : 0.7,
              '&:hover': { opacity: 1, transform: 'translateY(-4px)' }
            }}
          >
            <Stack spacing={1}>
              <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 500 }}>Organization</Typography>
              <Typography variant="h2" sx={{ fontWeight: 800 }}>Units</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.15)', fontSize: '0.75rem', fontWeight: 600 }}>
                  {unitsData?.total || 0} Active Departments
                </Box>
              </Stack>
            </Stack>
            <span
              className="material-symbols-outlined"
              style={{ position: 'absolute', right: -20, bottom: -20, fontSize: 130, opacity: 0.2, color: '#fff' }}
            >
              apartment
            </span>
          </Paper>
        </Grid>
      </Grid>

      {selectedTable === 'users' ? UsersTable : UnitsTable}

      {/* User Dialog */}
      <Dialog open={userDialog.open} onClose={() => setUserDialog({ open: false, mode: 'create', user: null })} maxWidth="sm" fullWidth>
        <DialogTitle>{userDialog.mode === 'create' ? 'Add User' : 'Edit User'}</DialogTitle>
        <form onSubmit={handleUserSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {(createUserMutation.error || updateUserMutation.error) && (
                <Alert severity="error">
                  {((createUserMutation.error || updateUserMutation.error) as any)?.message || 'An error occurred while saving user data'}
                </Alert>
              )}
              <TextField
                name="name"
                label="Full Name"
                defaultValue={userDialog.user?.name}
                required
                fullWidth
              />
              <TextField
                name="email"
                label="Username / Email"
                type="email"
                defaultValue={userDialog.user?.email}
                required
                fullWidth
              />
              <TextField
                name="password"
                label="Password"
                type="password"
                placeholder={userDialog.mode === 'edit' ? 'Leave blank to keep current' : 'Enter password'}
                required={userDialog.mode === 'create'}
                fullWidth
              />
              <TextField
                name="role"
                label="Role"
                select
                value={selectedRoleInDialog}
                onChange={(e) => setSelectedRoleInDialog(e.target.value)}
                required
                fullWidth
                sx={{
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                  }
                }}
              >
                <MenuItem value="participant">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 0.5 }}>
                    <Box sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: theme.palette.success.lighter,
                      color: theme.palette.success.main
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>person</span>
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Participant</Typography>
                      <Typography variant="caption" color="text.secondary">Default access for internship students</Typography>
                    </Box>
                  </Box>
                </MenuItem>
                <MenuItem value="supervisor">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 0.5 }}>
                    <Box sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: theme.palette.warning.lighter,
                      color: theme.palette.warning.main
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>manage_accounts</span>
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Supervisor</Typography>
                      <Typography variant="caption" color="text.secondary">Management access for unit leads</Typography>
                    </Box>
                  </Box>
                </MenuItem>
              </TextField>
              <TextField
                name="unit_id"
                label="Assigned Unit"
                select
                defaultValue={userDialog.user?.unit_id || ''}
                fullWidth
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {allUnitsData?.units.map((unit) => (
                  <MenuItem key={unit.id} value={unit.id}>
                    {unit.name} ({unit.department})
                  </MenuItem>
                ))}
              </TextField>

              {selectedRoleInDialog === 'participant' && (
                <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.03), borderRadius: 2, border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}` }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>assignment_ind</span>
                    Mentor/Supervisor Assignment
                  </Typography>
                  <TextField
                    name="supervisor_id"
                    label="Assign Supervisor"
                    select
                    defaultValue={userDialog.user?.supervisor_id || ''}
                    fullWidth
                    helperText="Mentor who will oversee this participant"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {allSupervisorsData?.users.map((sup) => (
                      <MenuItem key={sup.id} value={sup.id}>
                        {sup.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              )}

              {selectedRoleInDialog === 'participant' && (
                <>
                  <TextField
                    name="status"
                    label="Status"
                    select
                    defaultValue={userDialog.user?.status || 'active'}
                    required
                    fullWidth
                    sx={{
                      '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5
                      }
                    }}
                  >
                    <MenuItem value="active">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: theme.palette.success.main }} />
                        Active
                      </Box>
                    </MenuItem>
                    <MenuItem value="inactive">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: theme.palette.error.main }} />
                        Inactive
                      </Box>
                    </MenuItem>
                  </TextField>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      name="internship_start"
                      label="Internship Start"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      defaultValue={userDialog.user?.internship_start || ''}
                      fullWidth
                    />
                    <TextField
                      name="internship_end"
                      label="Internship End"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      defaultValue={userDialog.user?.internship_end || ''}
                      fullWidth
                    />
                  </Box>
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUserDialog({ open: false, mode: 'create', user: null })}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createUserMutation.isPending || updateUserMutation.isPending}
            >
              {createUserMutation.isPending || updateUserMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog >

      {/* Unit Dialog */}
      <Dialog open={unitDialog.open} onClose={() => setUnitDialog({ open: false, mode: 'create', unit: null })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2.5 }}>
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: theme.palette.primary.lighter,
            color: theme.palette.primary.main
          }}>
            <span className="material-symbols-outlined">{unitDialog.mode === 'create' ? 'add_business' : 'edit_note'}</span>
          </Box>
          <Box>
            <Typography variant="h4">{unitDialog.mode === 'create' ? 'Create New Unit' : 'Edit Unit Details'}</Typography>
            <Typography variant="caption" color="text.secondary">Organize your teams and departments</Typography>
          </Box>
        </DialogTitle>
        <form onSubmit={handleUnitSubmit}>
          <DialogContent sx={{ px: 3, pt: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {(createUnitMutation.error || updateUnitMutation.error) && (
                <Alert severity="error" variant="outlined">
                  {((createUnitMutation.error || updateUnitMutation.error) as any)?.message || 'An error occurred while saving unit data'}
                </Alert>
              )}

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>Basic Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      name="name"
                      label="Unit Name"
                      placeholder="e.g., Frontend Engineering"
                      defaultValue={unitDialog.unit?.name}
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="department"
                      label="Department / Division"
                      placeholder="e.g., Technology & Product"
                      defaultValue={unitDialog.unit?.department}
                      required
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>Management & Status</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      name="manager_id"
                      label="Unit Manager"
                      select
                      defaultValue={unitDialog.unit?.manager_id || ''}
                      fullWidth
                      helperText="Associate a supervisor as the lead of this unit"
                    >
                      <MenuItem value="">
                        <em>Not Assigned</em>
                      </MenuItem>
                      {usersData?.users?.filter(u => u.role === 'supervisor')?.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      name="status"
                      label="Operational Status"
                      select
                      defaultValue={unitDialog.unit?.status || 'active'}
                      required
                      fullWidth
                      sx={{
                        '& .MuiSelect-select': {
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5
                        }
                      }}
                    >
                      <MenuItem value="active">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.palette.success.main, boxShadow: `0 0 8px ${theme.palette.success.main}` }} />
                          <Typography sx={{ fontWeight: 500 }}>Active</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="inactive">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.palette.error.main, boxShadow: `0 0 8px ${theme.palette.error.main}` }} />
                          <Typography sx={{ fontWeight: 500 }}>Inactive</Typography>
                        </Box>
                      </MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setUnitDialog({ open: false, mode: 'create', unit: null })}
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createUnitMutation.isPending || updateUnitMutation.isPending}
              sx={{ borderRadius: 2, px: 4 }}
            >
              {createUnitMutation.isPending || updateUnitMutation.isPending ? 'Processing...' : 'Save Unit'}
            </Button>
          </DialogActions>
        </form>
      </Dialog >

      {/* Delete Confirmation Dialog */}
      < Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, type: 'user', id: '' })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {deleteDialog.type}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, type: 'user', id: '' })}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={deleteUserMutation.isPending || deleteUnitMutation.isPending}
          >
            {deleteUserMutation.isPending || deleteUnitMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog >
    </>
  );
};

export default ManagementDataView;
