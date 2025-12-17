'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Only redirect if not loading, user exists, and hasn't redirected yet
    if (!isLoading && user && !hasRedirected) {
      setHasRedirected(true);
      router.push('/dashboard');
    }
  }, [user, isLoading, router, hasRedirected]);

  // Show loading only when checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user exists, show nothing (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {children}
    </div>
  );
}