import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';
import Loader from 'components/Loader';

const AuthGuard = dynamic(() => import('utils/route-guard/AuthGuard'), {
  ssr: false,
  loading: () => <Loader />
});

const DashboardLayout = dynamic(() => import('layout/DashboardLayout'), {
  ssr: false,
  loading: () => <Loader />
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Loader />}>
      <AuthGuard>
        <DashboardLayout>{children}</DashboardLayout>
      </AuthGuard>
    </Suspense>
  );
}
