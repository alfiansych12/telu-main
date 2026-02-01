'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

const DashboardsuperView = dynamic(() => import('views/other/Supervisors/DashboardPage'), {
  ssr: false,
  loading: () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  )
});

const DashboardPage = () => {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    }>
      <DashboardsuperView />
    </Suspense>
  );
};

export default DashboardPage;