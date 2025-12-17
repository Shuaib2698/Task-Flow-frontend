'use client';

import { SWRConfig } from 'swr';

const fetcher = async (url: string) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  
  const response = await fetch(`${API_URL}${url}`, {
    credentials: 'include',
    cache: 'no-store',
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      window.location.href = '/login';
      return;
    }
    
    const error = new Error('An error occurred while fetching the data.');
    try {
      const errorData = await response.json();
      (error as any).info = errorData;
    } catch {
      (error as any).info = { message: 'No error details' };
    }
    (error as any).status = response.status;
    throw error;
  }
  
  const result = await response.json();
  return result.data;
};

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        shouldRetryOnError: false,
        dedupingInterval: 2000,
      }}
    >
      {children}
    </SWRConfig>
  );
}