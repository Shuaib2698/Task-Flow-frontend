'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import toast from 'react-hot-toast';

interface AuthResponse {
  success: boolean;
  data: User | User[];
  message: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();
  
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://task-flow-backend-bezf.onrender.com/api';

  // Add computed properties
  const isAuthenticated = !!user;
  const loading = isLoading;

  // Get current user profile
  // In useAuth.ts, update the getProfile function
const getProfile = useCallback(async (): Promise<User | null> => {
  if (isChecking) return user;
  
  setIsChecking(true);
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      credentials: 'include',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    
    if (response.status === 401 || response.status === 403) {
      setUser(null);
      return null;
    }
    
    if (response.ok) {
      const result: ApiResponse<User> = await response.json();
      
      if (result.success && result.data) {
        setUser(result.data);
        setIsLoading(false);
        return result.data;
      }
    }
    
    setUser(null);
    return null;
  } catch (error) {
    console.error('Auth error:', error);
    setUser(null);
    return null;
  } finally {
    setIsChecking(false);
    setIsLoading(false);
  }
}, [API_URL, isChecking, user]);

  // Get all users for assignment dropdown
  const getAllUsers = useCallback(async (): Promise<User[]> => {
    try {
      const response = await fetch(`${API_URL}/tasks/users`, {
        credentials: 'include',
        cache: 'no-store',
      });
      
      if (response.ok) {
        const result: ApiResponse<User[]> = await response.json();
        
        if (result.success && Array.isArray(result.data)) {
          setAllUsers(result.data);
          return result.data;
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      return [];
    }
  }, [API_URL]);

  const register = async (data: { name: string; email: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      const result: ApiResponse<User> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      setUser(result.data);
      await getAllUsers(); // Fetch users after registration
      toast.success('Registration successful!');
      router.push('/dashboard');
      return result.data;
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: { email: string; password: string }) => {
  setIsLoading(true);
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    const result: ApiResponse<{ user: User; token: string }> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    // Store token in localStorage
    if (result.data.token) {
      localStorage.setItem('auth_token', result.data.token);
    }
    
    setUser(result.data.user);
    await getAllUsers();
    toast.success('Login successful!');
    router.push('/dashboard');
    return result.data.user;
  } catch (error: any) {
    toast.error(error.message || 'Login failed');
    throw error;
  } finally {
    setIsLoading(false);
  }
};

  const logout = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setUser(null);
        setAllUsers([]);
        toast.success('Logged out successfully');
        router.push('/login');
      } else {
        toast.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed');
    }
  };

  // Initialize auth on mount
  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      if (mounted) {
        await getProfile();
        await getAllUsers();
      }
    };
    
    initAuth();
    
    return () => {
      mounted = false;
    };
  }, []);

  return {
    user,
    users: allUsers, // Return users for assignment dropdown
    isLoading,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    getProfile,
    getAllUsers,
  };
};