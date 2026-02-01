'use client';
import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// MATERIAL - UI
import {
  Grid,
  Typography,
  Box,
  Stack,
  Paper
} from '@mui/material';
import { format } from 'date-fns';
import { useTheme, alpha } from '@mui/material/styles';

// ICONS
import {
  CalendarTick
} from 'iconsax-react';

// PROJECT IMPORTS
import { createUser, updateUser, deleteUser, deleteUsers } from 'utils/api/users';
import { UserWithRelations as UserWithUnit } from 'types/api';
import { createUnit, updateUnit, deleteUnit, deleteUnits } from 'utils/api/units';
import { UnitWithRelations as UnitWithManager } from 'types/api';
import { openAlert } from 'api/alert';
import { getManagementPageData } from 'utils/api/batch';

// LOCAL COMPONENTS
import UserTable from './components/UserTable';
import UnitTable from './components/UnitTable';
import UserDialog from './components/UserDialog';
import UnitDialog from './components/UnitDialog';
import BulkImportDialog from './components/BulkImportDialog';
import ImportHistoryDialog from './components/ImportHistoryDialog';
import RecycleBinDialog from './components/RecycleBinDialog';
import { bulkImportParticipants } from 'utils/api/import-participants';

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

  const [userDialog, setUserDialog] = useState({ open: false, mode: 'create' as 'create' | 'edit', user: null as UserWithUnit | null });
  const [unitDialog, setUnitDialog] = useState({ open: false, mode: 'create' as 'create' | 'edit', unit: null as UnitWithManager | null });
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [recycleBinOpen, setRecycleBinOpen] = useState(false);

  // Auto reset to page 1 when filters/search change
  React.useEffect(() => {
    setUsersPage(1);
  }, [usersSearch, usersRoleFilter, usersPageSize]);

  React.useEffect(() => {
    setUnitsPage(1);
  }, [unitsSearch, unitsStatusFilter, unitsPageSize]);

  // 1. Query for Table Lists (Paginated & Filtered)
  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: ['management-list', usersPage, usersSearch, usersRoleFilter, usersPageSize, unitsPage, unitsSearch, unitsStatusFilter, unitsPageSize],
    queryFn: () => getManagementPageData({
      usersPage, usersPageSize, usersSearch, usersRoleFilter,
      unitsPage, unitsPageSize, unitsSearch, unitsStatusFilter,
      skipReferenceData: true // Optimize: don't fetch reference data for lists
    }),
    staleTime: 30000,
    refetchOnWindowFocus: 'always'
  });

  // 2. Query for Reference Data (Unit & Supervisor Options for Dialogs) - Fetch once
  const { data: referenceData } = useQuery({
    queryKey: ['management-reference-data'],
    queryFn: () => getManagementPageData({ fetchOnlyReference: true }),
    staleTime: 300000, // 5 minutes reference data
  });

  const usersData = listData?.usersData;
  const unitsData = listData?.unitsData;
  const allUnitsData = referenceData?.allUnitsData;
  const allSupervisorsData = referenceData?.allSupervisorsData;

  const usersLoading = listLoading;
  const unitsLoading = listLoading;
  const usersError = null;
  const unitsError = null;

  // Mutations for Users
  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: ['management-list'] });
      queryClient.invalidateQueries({ queryKey: ['management-reference'] });
      setUserDialog({ open: false, mode: 'create', user: null });
      openAlert({
        variant: 'success',
        title: 'User Created',
        message: `User ${newUser.name} has been successfully added to the system.`
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data, originalData }: { id: string; data: any; originalData?: any }) => updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['management-list'] });
      queryClient.invalidateQueries({ queryKey: ['management-reference'] });
      setUserDialog({ open: false, mode: 'create', user: null });

      // Detect what fields were changed
      if (variables.originalData) {
        const changedFields: string[] = [];
        const { data, originalData } = variables;

        // Helper function to normalize values for comparison (treat null, undefined, and empty string as equivalent)
        const normalize = (val: any) => {
          if (val === null || val === undefined || val === '') return null;
          return val;
        };

        if (normalize(data.name) !== normalize(originalData.name)) changedFields.push('Name');
        if (normalize(data.email) !== normalize(originalData.email)) changedFields.push('Username');
        if (data.password && data.password.trim() !== '') changedFields.push('Password');
        if (normalize(data.role) !== normalize(originalData.role)) changedFields.push('Role');
        if (normalize(data.unit_id) !== normalize(originalData.unit_id)) changedFields.push('Assigned Unit');
        if (normalize(data.supervisor_id) !== normalize(originalData.supervisor_id)) changedFields.push('Supervisor');
        if (normalize(data.status) !== normalize(originalData.status)) changedFields.push('Status');
        if (normalize(data.internship_start) !== normalize(originalData.internship_start)) changedFields.push('Internship Start Date');
        if (normalize(data.internship_end) !== normalize(originalData.internship_end)) changedFields.push('Internship End Date');

        let message = 'User profile has been updated successfully!';
        if (changedFields.length > 0) {
          message = `Successfully updated: ${changedFields.join(', ')}`;
        }

        openAlert({
          variant: 'success',
          title: 'Profile Updated',
          message: message
        });
      }
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: (result: any) => {
      if (result.success === false) {
        openAlert({
          variant: 'error',
          title: 'Delete Failed',
          message: result.message || 'Failed to delete user.'
        });
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['management-list'] });
      queryClient.invalidateQueries({ queryKey: ['management-reference'] });
      openAlert({
        variant: 'success',
        title: 'User Deleted',
        message: 'The user account has been successfully removed.'
      });
    },
  });

  // Mutations for Units
  const createUnitMutation = useMutation({
    mutationFn: createUnit,
    onSuccess: (newUnit) => {
      queryClient.invalidateQueries({ queryKey: ['management-list'] });
      queryClient.invalidateQueries({ queryKey: ['management-reference'] });
      setUnitDialog({ open: false, mode: 'create', unit: null });
      openAlert({
        variant: 'success',
        title: 'Unit Created',
        message: `Unit ${newUnit.name} has been successfully created.`
      });
    },
  });

  const updateUnitMutation = useMutation({
    mutationFn: ({ id, data, originalData }: { id: string; data: any; originalData?: any }) => updateUnit(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['management-list'] });
      queryClient.invalidateQueries({ queryKey: ['management-reference'] });
      setUnitDialog({ open: false, mode: 'create', unit: null });

      // Detect what fields were changed
      if (variables.originalData) {
        const changedFields: string[] = [];
        const { data, originalData } = variables;

        // Helper function to normalize values for comparison (treat null, undefined, and empty string as equivalent)
        const normalize = (val: any) => {
          if (val === null || val === undefined || val === '') return null;
          return val;
        };

        if (normalize(data.name) !== normalize(originalData.name)) changedFields.push('Unit Name');
        if (normalize(data.department) !== normalize(originalData.department)) changedFields.push('Department');
        if (normalize(data.manager_name) !== normalize(originalData.manager_name)) changedFields.push('Manager Name');
        if (normalize(data.status) !== normalize(originalData.status)) changedFields.push('Status');

        let message = 'Unit has been updated successfully!';
        if (changedFields.length > 0) {
          message = `Successfully updated: ${changedFields.join(', ')}`;
        }

        openAlert({
          variant: 'success',
          title: 'Unit Updated',
          message: message
        });
      }
    },
  });

  const deleteUnitMutation = useMutation({
    mutationFn: deleteUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['management-list'] });
      queryClient.invalidateQueries({ queryKey: ['management-reference'] });
      openAlert({
        variant: 'success',
        title: 'Unit Deleted',
        message: 'The unit has been successfully removed from the organization.'
      });
    },
  });

  const deleteUsersMutation = useMutation({
    mutationFn: deleteUsers,
    onSuccess: (result: any) => {
      if (result.success === false) {
        openAlert({
          variant: 'error',
          title: 'Bulk Delete Failed',
          message: result.message || 'Failed to delete users.'
        });
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['management-list'] });
      queryClient.invalidateQueries({ queryKey: ['management-reference'] });
      openAlert({
        variant: 'success',
        title: 'Users Moved',
        message: `${result.count} users have been moved to Recycle Bin.`
      });
    },
  });

  const deleteUnitsMutation = useMutation({
    mutationFn: deleteUnits,
    onSuccess: (result: any) => {
      if (result.success === false) {
        openAlert({
          variant: 'error',
          title: 'Bulk Delete Failed',
          message: result.message || 'Failed to delete units.'
        });
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['management-list'] });
      queryClient.invalidateQueries({ queryKey: ['management-reference'] });
      openAlert({
        variant: 'success',
        title: 'Units Moved',
        message: `${result.count} units have been moved to Recycle Bin.`
      });
    },
  });

  const bulkImportMutation = useMutation({
    mutationFn: ({ unitIds, participants }: { unitIds: string[], participants: any[] }) => bulkImportParticipants(unitIds, participants),
    onSuccess: (result) => {
      if (!result.success) {
        openAlert({
          variant: 'error',
          title: 'Import Failed',
          message: result.message || 'Data could not be imported.'
        });
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['management-list'] });
      queryClient.invalidateQueries({ queryKey: ['management-reference'] });

      // Close dialog immediately since info is in Alert & History
      setBulkImportOpen(false);

      openAlert({
        variant: 'success',
        title: 'Import Successful',
        message: result.message
      });
    },
    onError: (error: any) => {
      // This is for unexpected server crashes/network errors
      openAlert({
        variant: 'error',
        title: 'System Error',
        message: 'A system error occurred while processing data.'
      });
    }
  });

  const handleBulkImport = async (participants: any[], unitIds: string[]) => {
    return await bulkImportMutation.mutateAsync({ unitIds, participants });
  };

  const handleUserSubmit = (values: any) => {
    const data = {
      ...values,
      unit_id: values.unit_id || null,
      supervisor_id: values.role === 'participant' ? values.supervisor_id : null,
      internship_start: values.internship_start ? format(new Date(values.internship_start), 'yyyy-MM-dd') : null,
      internship_end: values.internship_end ? format(new Date(values.internship_end), 'yyyy-MM-dd') : null
    };

    if (userDialog.mode === 'create') {
      createUserMutation.mutate(data);
    } else if (userDialog.user) {
      // Prepare original data for comparison
      const originalData = {
        email: userDialog.user.email,
        name: userDialog.user.name,
        role: userDialog.user.role,
        unit_id: userDialog.user.unit_id,
        supervisor_id: userDialog.user.supervisor_id,
        status: userDialog.user.status,
        internship_start: userDialog.user.internship_start ? format(new Date(userDialog.user.internship_start), 'yyyy-MM-dd') : null,
        internship_end: userDialog.user.internship_end ? format(new Date(userDialog.user.internship_end), 'yyyy-MM-dd') : null
      };
      updateUserMutation.mutate({ id: userDialog.user.id, data, originalData });
    }
  };

  // Handle submit unit form
  const handleUnitSubmit = (data: any) => {
    if (unitDialog.mode === 'create') {
      createUnitMutation.mutate(data);
    } else if (unitDialog.unit) {
      // Prepare original data for comparison
      const originalData = {
        name: unitDialog.unit.name,
        department: unitDialog.unit.department,
        manager_name: unitDialog.unit.manager_name,
        status: unitDialog.unit.status
      };
      updateUnitMutation.mutate({ id: unitDialog.unit.id, data, originalData });
    }
  };



  // Tables removed and replaced by components in return

  return (
    <Box sx={{ px: 1 }}>
      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Management Data</Typography>
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

      {selectedTable === 'users' ? (
        <UserTable
          usersData={usersData}
          usersLoading={usersLoading}
          usersError={usersError}
          usersRoleFilter={usersRoleFilter}
          setUsersRoleFilter={setUsersRoleFilter}
          usersSearch={usersSearch}
          setUsersSearch={setUsersSearch}
          usersPage={usersPage}
          setUsersPage={setUsersPage}
          usersPageSize={usersPageSize}
          setUsersPageSize={setUsersPageSize}
          onAdd={() => {
            setUserDialog({ open: true, mode: 'create', user: null });
          }}
          onEdit={(user) => {
            setUserDialog({ open: true, mode: 'edit', user });
          }}
          onDelete={(id) => {
            openAlert({
              title: 'Confirm Delete',
              message: 'Are you sure you want to move this user to Recycle Bin? You can restore it within 48 hours.',
              variant: 'error',
              showCancel: true,
              confirmText: 'Move to Recycle Bin',
              onConfirm: () => deleteUserMutation.mutate(id)
            });
          }}
          onBulkImport={() => setBulkImportOpen(true)}
          onHistoryImport={() => setHistoryOpen(true)}
          onBulkDelete={(ids) => {
            openAlert({
              title: 'Confirm Bulk Delete',
              message: `Are you sure you want to move ${ids.length} users to Recycle Bin?`,
              variant: 'error',
              showCancel: true,
              confirmText: 'Move All to Recycle Bin',
              onConfirm: () => deleteUsersMutation.mutate(ids)
            });
          }}
          onOpenRecycleBin={() => setRecycleBinOpen(true)}
        />
      ) : (
        <UnitTable
          unitsData={unitsData}
          unitsLoading={unitsLoading}
          unitsError={unitsError}
          unitsStatusFilter={unitsStatusFilter}
          setUnitsStatusFilter={setUnitsStatusFilter}
          unitsSearch={unitsSearch}
          setUnitsSearch={setUnitsSearch}
          unitsPage={unitsPage}
          setUnitsPage={setUnitsPage}
          unitsPageSize={unitsPageSize}
          setUnitsPageSize={setUnitsPageSize}
          onAdd={() => setUnitDialog({ open: true, mode: 'create', unit: null })}
          onEdit={(unit) => setUnitDialog({ open: true, mode: 'edit', unit })}
          onDelete={(id) => {
            openAlert({
              title: 'Confirm Delete',
              message: 'Are you sure you want to move this unit to Recycle Bin?',
              variant: 'error',
              showCancel: true,
              confirmText: 'Move to Recycle Bin',
              onConfirm: () => deleteUnitMutation.mutate(id)
            });
          }}
          onBulkDelete={(ids) => {
            openAlert({
              title: 'Confirm Bulk Delete',
              message: `Are you sure you want to move ${ids.length} units to Recycle Bin?`,
              variant: 'error',
              showCancel: true,
              confirmText: 'Move All to Recycle Bin',
              onConfirm: () => deleteUnitsMutation.mutate(ids)
            });
          }}
          onOpenRecycleBin={() => setRecycleBinOpen(true)}
        />
      )}

      <RecycleBinDialog
        open={recycleBinOpen}
        onClose={() => setRecycleBinOpen(false)}
      />

      {/* User Dialog */}
      <UserDialog
        open={userDialog.open}
        onClose={() => setUserDialog({ ...userDialog, open: false })}
        mode={userDialog.mode}
        user={userDialog.user}
        onSubmit={handleUserSubmit}
        error={createUserMutation.error || updateUserMutation.error}
        isLoading={createUserMutation.isPending || updateUserMutation.isPending}
        allUnitsData={allUnitsData}
        allSupervisorsData={allSupervisorsData}
      />

      <ImportHistoryDialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />

      <BulkImportDialog
        open={bulkImportOpen}
        onClose={() => setBulkImportOpen(false)}
        units={allUnitsData?.data || []}
        isLoading={bulkImportMutation.isPending}
        onImport={handleBulkImport}
      />

      {/* Unit Dialog */}
      <UnitDialog
        open={unitDialog.open}
        onClose={() => setUnitDialog({ ...unitDialog, open: false })}
        mode={unitDialog.mode}
        unit={unitDialog.unit}
        onSubmit={handleUnitSubmit}
        error={createUnitMutation.error || updateUnitMutation.error}
        isLoading={createUnitMutation.isPending || updateUnitMutation.isPending}
      />


    </Box>
  );
};

export default ManagementDataView;
