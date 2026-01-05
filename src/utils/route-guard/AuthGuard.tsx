'use client';

import { useEffect } from 'react';

// NEXT
import { usePathname, useRouter } from 'next/navigation';

// PROJECT IMPORTS
import Loader from 'components/Loader';

// TYPES
import { GuardProps } from 'types/auth';
import { useSession } from 'next-auth/react';

// ==============================|| AUTH GUARD ||============================== //

const AuthGuard = ({ children }: GuardProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If session is not available, redirect to login
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Role-based path protection (Security Tightening)
    const user = session?.user as any;
    const role = user?.role;

    if (role === 'admin') {
      const allowedPaths = ['/dashboard', '/ManagementData', '/ReportsMonitoring', '/Profileadmin', '/UnitsManagement', '/MapSettings'];
      const isAllowed = allowedPaths.some(path => pathname === path || pathname.startsWith(`${path}/`));
      if (!isAllowed) {
        router.push('/dashboard');
      }
    } else if (role === 'supervisor') {
      const allowedPaths = ['/dashboardsuper', '/Monitoringsuper', '/Profilesuper'];
      const isAllowed = allowedPaths.some(path => pathname === path || pathname.startsWith(`${path}/`));
      if (!isAllowed) {
        router.push('/dashboardsuper');
      }
    } else if (role === 'participant') {
      const allowedPaths = ['/dashboarduser', '/Profilepart'];
      const isAllowed = allowedPaths.some(path => pathname === path || pathname.startsWith(`${path}/`));
      if (!isAllowed) {
        router.push('/dashboarduser');
      }
    }
    // eslint-disable-next-line
  }, [session, router, pathname, status]);

  if (status == 'loading' || !session?.user) return <Loader />;

  return <>{children}</>;
};

export default AuthGuard;
