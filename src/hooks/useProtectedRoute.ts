'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './useAuth';

export const useProtectedRoute = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const redirectTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Clear any existing timer
    if (redirectTimer.current) {
      clearTimeout(redirectTimer.current);
    }

    // Don't check for auth pages
    if (pathname?.includes('/login') || pathname?.includes('/register')) {
      return;
    }

    // If not loading and no user, redirect to login with delay
    if (!isLoading && !user) {
      redirectTimer.current = setTimeout(() => {
        router.push('/login');
      }, 100); // Small delay to prevent race conditions
    }

    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
      }
    };
  }, [user, isLoading, router, pathname]);

  return { user, isLoading };
};