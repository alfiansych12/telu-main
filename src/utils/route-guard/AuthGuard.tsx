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
    if (status === 'loading') return;

    // 1. If session is not available, redirect to login
    if (status === 'unauthenticated' || !session) {
      console.log('[AuthGuard] Unauthenticated - Directing to login');
      router.push('/login');
      return;
    }

    const user = session.user as any;
    const role = user?.role;
    console.log(`[AuthGuard] Authenticated as ${role} for path: ${pathname}`);

    // 2. Role-based path protection (Security Tightening)
    // Map of roles to their dashboard entry points and allowed path prefixes
    const roleConfig: Record<string, { dashboard: string; allowed: string[] }> = {
      admin: {
        dashboard: '/dashboard',
        allowed: ['/dashboard', '/ManagementData', '/ReportsMonitoring', '/Profileadmin', '/UnitsManagement', '/MapSettings', '/AttendanceReport', '/CertificateScanner']
      },
      supervisor: {
        dashboard: '/dashboardsuper',
        allowed: ['/dashboardsuper', '/Monitoringsuper', '/Profilesuper', '/assessmentsuper', '/AttendanceReport']
      },
      participant: {
        dashboard: '/dashboarduser',
        allowed: ['/dashboarduser', '/Profilepart']
      }
    };

    const config = roleConfig[role];
    if (config) {
      const isAllowed = config.allowed.some(path => pathname === path || pathname.startsWith(`${path}/`));
      if (!isAllowed) {
        console.warn(`[AuthGuard] Path ${pathname} not allowed for role ${role}. Redirecting to ${config.dashboard}`);
        router.push(config.dashboard);
      }
    } else {
      console.error(`[AuthGuard] Unknown role: ${role}. Logging out.`);
      router.push('/login');
    }
  }, [session, router, pathname, status]);

  if (status === 'loading' || !session?.user) return <Loader />;

  return <>{children}</>;
};

export default AuthGuard;
