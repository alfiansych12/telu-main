'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// MATERIAL - UI
import Typography from '@mui/material/Typography';
import {
  TextField,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  IconButton,
  Grid
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

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
  const [unitsPageSize, setUnitsPageSize] = useState(10);

  // Dialog states
  const [userDialog, setUserDialog] = useState({ open: false, mode: 'create' as 'create' | 'edit', user: null as UserWithUnit | null });
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

  // Fetch Units
  const { data: unitsData, isLoading: unitsLoading, error: unitsError } = useQuery({
    queryKey: ['units', unitsPage, unitsSearch, unitsPageSize],
    queryFn: () => getUnits({
      page: unitsPage,
      pageSize: unitsPageSize,
      search: unitsSearch || undefined,
    }),
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
      name: formData.get('name') as string,
      role: formData.get('role') as any,
      status: (formData.get('status') || 'active') as any,
      internship_start: formData.get('internship_start') as string || null,
      internship_end: formData.get('internship_end') as string || null,
    };

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
            SelectProps={{ native: true }}
            sx={{ minWidth: 140 }}
          >
            <option value="all">All Roles</option>
            <option value="participant">Participants</option>
            <option value="supervisor">Supervisors</option>
            <option value="admin">Admin</option>
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
            onClick={() => setUserDialog({ open: true, mode: 'create', user: null })}
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

      <Box sx={{ overflowX: 'auto', minHeight: 400, position: 'relative' }}>
        {usersLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: 8, textAlign: 'left' }}>Name</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Email</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Role</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Unit</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Status</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {usersData?.users && usersData.users.length > 0 ? (
                usersData.users.map((user) => (
                  <tr key={user.id}>
                    <td style={{ padding: 8 }}>{user.name}</td>
                    <td style={{ padding: 8 }}>{user.email}</td>
                    <td style={{ padding: 8 }}>{user.role}</td>
                    <td style={{ padding: 8 }}>{user.unit?.name || '-'}</td>
                    <td style={{ padding: 8 }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: '0.75rem',
                        background: user.status === 'active' ? '#4caf50' : '#f44336',
                        color: 'white'
                      }}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{ padding: 8 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1 }}
                        onClick={() => setUserDialog({ open: true, mode: 'edit', user })}
                        startIcon={<span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>}
                      >
                        Update
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => setDeleteDialog({ open: true, type: 'user', id: user.id })}
                        startIcon={<span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>}
                      >
                        Hapus
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: 24, textAlign: 'center' }}>
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 2 }}>
        <Typography variant="body2" sx={{ mr: 1 }}>Rows per page:</Typography>
        <TextField
          select
          size="small"
          value={usersPageSize}
          onChange={(e) => setUsersPageSize(Number(e.target.value))}
          SelectProps={{ native: true }}
          sx={{ width: 80 }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
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

      <Box sx={{ overflowX: 'auto', minHeight: 400, position: 'relative' }}>
        {unitsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: 8, textAlign: 'left' }}>Unit Name</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Department</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Manager</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Employees</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Status</th>
                <th style={{ padding: 8, textAlign: 'left' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {unitsData?.units && unitsData.units.length > 0 ? (
                unitsData.units.map((unit) => (
                  <tr key={unit.id}>
                    <td style={{ padding: 8 }}>{unit.name}</td>
                    <td style={{ padding: 8 }}>{unit.department}</td>
                    <td style={{ padding: 8 }}>{unit.manager?.name || '-'}</td>
                    <td style={{ padding: 8 }}>{unit.employee_count || 0}</td>
                    <td style={{ padding: 8 }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: '0.75rem',
                        background: unit.status === 'active' ? '#4caf50' : '#f44336',
                        color: 'white'
                      }}>
                        {unit.status}
                      </span>
                    </td>
                    <td style={{ padding: 8 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1 }}
                        onClick={() => setUnitDialog({ open: true, mode: 'edit', unit })}
                        startIcon={<span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>}
                      >
                        Update
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => setDeleteDialog({ open: true, type: 'unit', id: unit.id })}
                        startIcon={<span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>}
                      >
                        Hapus
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: 24, textAlign: 'center' }}>
                    No units found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 2 }}>
        <Typography variant="body2" sx={{ mr: 1 }}>Rows per page:</Typography>
        <TextField
          select
          size="small"
          value={unitsPageSize}
          onChange={(e) => setUnitsPageSize(Number(e.target.value))}
          SelectProps={{ native: true }}
          sx={{ width: 80 }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
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

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={6}>
          <MainCard
            border={selectedTable === 'users' ? `2px solid ${theme.palette.primary.main}` : false}
            shadow={theme.customShadows.z1}
            sx={{ height: '100%', cursor: 'pointer', background: selectedTable === 'users' ? theme.palette.primary.lighter : undefined, p: { xs: 0.5, md: 2 } }}
            onClick={() => setSelectedTable('users')}
          >
            <Typography variant='h3' sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '1rem', md: '1.5rem' } }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>groups</span>
              Users
            </Typography>
          </MainCard>
        </Grid>
        <Grid item xs={6} sm={6}>
          <MainCard
            border={selectedTable === 'units' ? `2px solid ${theme.palette.primary.main}` : false}
            shadow={theme.customShadows.z1}
            sx={{ height: '100%', cursor: 'pointer', background: selectedTable === 'units' ? theme.palette.primary.lighter : undefined, p: { xs: 0.5, md: 2 } }}
            onClick={() => setSelectedTable('units')}
          >
            <Typography variant='h3' sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '1rem', md: '1.5rem' } }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>apartment</span>
              Units
            </Typography>
          </MainCard>
        </Grid>
      </Grid>

      {selectedTable === 'users' ? UsersTable : UnitsTable}

      {/* User Dialog */}
      <Dialog open={userDialog.open} onClose={() => setUserDialog({ open: false, mode: 'create', user: null })} maxWidth="sm" fullWidth>
        <DialogTitle>{userDialog.mode === 'create' ? 'Add User' : 'Edit User'}</DialogTitle>
        <form onSubmit={handleUserSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                name="name"
                label="Full Name"
                defaultValue={userDialog.user?.name}
                required
                fullWidth
              />
              <TextField
                name="email"
                label="Email"
                type="email"
                defaultValue={userDialog.user?.email}
                required
                fullWidth
              />
              <TextField
                name="role"
                label="Role"
                select
                SelectProps={{ native: true }}
                defaultValue={userDialog.user?.role || 'participant'}
                required
                fullWidth
              >
                <option value="participant">Participant</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Admin</option>
              </TextField>
              <TextField
                name="status"
                label="Status"
                select
                SelectProps={{ native: true }}
                defaultValue={userDialog.user?.status || 'active'}
                required
                fullWidth
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
      </Dialog>

      {/* Unit Dialog */}
      <Dialog open={unitDialog.open} onClose={() => setUnitDialog({ open: false, mode: 'create', unit: null })} maxWidth="sm" fullWidth>
        <DialogTitle>{unitDialog.mode === 'create' ? 'Add Unit' : 'Edit Unit'}</DialogTitle>
        <form onSubmit={handleUnitSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                name="name"
                label="Unit Name"
                defaultValue={unitDialog.unit?.name}
                required
                fullWidth
              />
              <TextField
                name="department"
                label="Department"
                defaultValue={unitDialog.unit?.department}
                required
                fullWidth
              />
              <TextField
                name="status"
                label="Status"
                select
                SelectProps={{ native: true }}
                defaultValue={unitDialog.unit?.status || 'active'}
                required
                fullWidth
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUnitDialog({ open: false, mode: 'create', unit: null })}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createUnitMutation.isPending || updateUnitMutation.isPending}
            >
              {createUnitMutation.isPending || updateUnitMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, type: 'user', id: '' })}>
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
      </Dialog>
    </>
  );
};

export default ManagementDataView;
