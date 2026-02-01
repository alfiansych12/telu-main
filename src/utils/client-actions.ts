'use client';

import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { signOut } from 'next-auth/react';
import { openAlert } from 'api/alert';

const handleGlobalError = (error: any) => {
  const message = error.message || 'An unexpected error occurred';
  const isUnauthorized = message.toLowerCase().includes('unauthorized') || message.toLowerCase().includes('session');
  const isForbidden = message.toLowerCase().includes('forbidden') || message.toLowerCase().includes('allowed');

  if (isUnauthorized) {
    openAlert({
      title: 'Session Expired',
      message: 'Please log in again to continue.',
      variant: 'error'
    });
    // Optional: auto logout if unauthorized
    // handleLogout(); 
  } else if (isForbidden) {
    openAlert({
      title: 'Access Denied',
      message: 'You do not have permission to perform this action.',
      variant: 'warning'
    });
  } else {
    openAlert({
      title: 'System Error',
      message: message,
      variant: 'error'
    });
  }
};

export const createQueryClient = () => new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => handleGlobalError(error)
  }),
  mutationCache: new MutationCache({
    onError: (error) => handleGlobalError(error)
  }),
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    }
  }
});

export const handleLogout = async (client?: QueryClient) => {
  try {
    // Clear query client cache
    if (client) {
      client.clear();
    }

    // Clear all cookies to prevent HTTP 431 errors
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    }

    // Clear local storage
    localStorage.clear();
    sessionStorage.clear();

    // Sign out with NextAuth
    await signOut({ callbackUrl: '/login', redirect: true });
  } catch (err) {
    console.error('Logout failed:', err);
    // Fallback: clear everything and redirect manually
    document.cookie.split(';').forEach(c => {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  }
};


