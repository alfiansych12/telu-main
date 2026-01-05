'use client';
import { ReactNode, useEffect } from 'react';

// NEXT
import { usePathname } from 'next/navigation';

// ==============================|| NAVIGATION - SCROLL TO TOP ||============================== //

const ScrollTop = ({ children }: { children: ReactNode | null }) => {
  // const pathname = usePathname();
  const pathname = '/';

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return children || null;
};

export default ScrollTop;
