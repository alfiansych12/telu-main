import { QueryClient } from '@tanstack/react-query';
import { signOut } from 'next-auth/react';

export const queryClient = new QueryClient();

export const handleLogout = async () => {
  try {
    queryClient.clear();
    await signOut();
  } catch (err) {
    console.error('Logout failed:', err);
  }
};
