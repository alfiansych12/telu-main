import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

const DashboarduserView = dynamic(() => import('views/other/Participant/DashboardPage'), {
  ssr: false,
  loading: () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  )
});

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    }>
      <DashboarduserView />
    </Suspense>
  );
}
