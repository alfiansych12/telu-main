'use client';

import { useEffect } from 'react';

// NEXT
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// PROJECT IMPORTS
import Loader from 'components/Loader';

// TYPES
import { GuardProps } from 'types/auth';

// ==============================|| GUEST GUARD ||============================== //

const GuestGuard = ({ children }: GuardProps) => {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`${basePath}/api/auth/protected`);

      const json = await res?.json();
      if (json?.protected) {
        const user = session?.user as any;
        const role = user?.role;

        if (role === 'admin') {
          router.push('/dashboard');
        } else if (role === 'supervisor') {
          router.push('/dashboardsuper');
        } else {
          router.push('/dashboarduser');
        }
      }
    };
    fetchData();

    // eslint-disable-next-line
  }, [session]);

  if (status === 'loading' || session?.user) return <Loader />;

  return <>{children}</>;
};

export default GuestGuard;
