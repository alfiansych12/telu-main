'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';
import { TextField, Button, Box, CircularProgress, Alert, Grid } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { CalendarTick } from 'iconsax-react';
import { getUnits } from 'utils/api/units';

const UnitsManagementView = () => {
  const theme = useTheme();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch units
  const { data: unitsData, isLoading, error } = useQuery({
    queryKey: ['units', page, search, pageSize],
    queryFn: () => getUnits({
      page,
      pageSize,
      search: search || undefined,
    }),
  });

  return (
    <Box sx={{ px: 1 }}>
      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Units Management</Typography>
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
          <MainCard border={false} shadow={theme.customShadows.z1} sx={{ height: '100%', cursor: 'pointer' }} onClick={() => router.push('/ManagementData')}>
            <Typography variant='h3' sx={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: { xs: '1.5rem', md: '2rem' } }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32, verticalAlign: 'middle' }}>groups</span>
              Users
            </Typography>
          </MainCard>
        </Grid>
        <Grid item xs={12} sm={6}>
          <MainCard border={false} shadow={theme.customShadows.z1} sx={{ height: '100%', cursor: 'pointer', background: '#e3f2fd', border: '2px solid #1976d2' }}>
            <Typography variant='h3' sx={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: { xs: '1.5rem', md: '2rem' } }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32, verticalAlign: 'middle' }}>apartment</span>
              Units
            </Typography>
          </MainCard>
        </Grid>
      </Grid>

      <MainCard border={false} shadow={theme.customShadows.z1} sx={{ mb: 3 }}>
        {/* Filter Bar */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'stretch', md: 'center' }, gap: 2, mb: 2 }}>
          <Typography variant="h5" sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 28, verticalAlign: 'middle', color: '#1976d2', background: '#e3f2fd', borderRadius: '50%', padding: 4, marginRight: 8, boxSizing: 'border-box' }}>apartment</span>
            Units Management
          </Typography>
          <TextField
            size="small"
            placeholder="Search unit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 200 }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error loading units: {(error as Error).message}
          </Alert>
        )}

        {/* Table */}
        <Box sx={{ overflowX: 'auto', minHeight: 400, position: 'relative' }}>
          {isLoading ? (
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
                  <th style={{ padding: 8, textAlign: 'left' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {unitsData?.data && unitsData.data.length > 0 ? (
                  unitsData.data.map((unit) => (
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
                      <td style={{ padding: 8 }}>{unit.created_at ? new Date(unit.created_at).toLocaleDateString() : '-'}</td>
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

        {/* Pagination */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 2 }}>
          <Typography variant="body2" sx={{ mr: 1 }}>Rows per page:</Typography>
          <TextField
            select
            size="small"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
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
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              ←
            </Button>
            <Typography variant="body2">{page} of {unitsData?.totalPages || 1}</Typography>
            <Button
              size="small"
              variant="outlined"
              disabled={!unitsData || page >= unitsData.totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              →
            </Button>
          </Box>
        </Box>
      </MainCard>
    </Box>
  );
};

export default UnitsManagementView;
