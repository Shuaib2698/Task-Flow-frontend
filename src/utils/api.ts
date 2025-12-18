const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://task-flow-backend-bezf.onrender.com/api';

// Track active requests to avoid duplicates
const activeRequests = new Map();

export const fetcher = async (url: string) => {
  // Cancel previous request for same URL
  const controller = new AbortController();
  const requestKey = url;
  
  if (activeRequests.has(requestKey)) {
    activeRequests.get(requestKey).abort();
  }
  
  activeRequests.set(requestKey, controller);
  
  try {
    const response = await fetch(`${API_URL}${url}`, {
      credentials: 'include',
      cache: 'no-store',
      signal: controller.signal,
    });
    
    // Remove from active requests
    activeRequests.delete(requestKey);
    
    if (!response.ok) {
      if (response.status === 401) {
        // Don't redirect if we're on auth pages
        if (typeof window !== 'undefined' && 
            !window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
        return null;
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
  } catch (error: any) {
    // Don't throw for aborted requests
    if (error.name === 'AbortError') {
      return;
    }
    throw error;
  }
};

interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

// Enhanced API functions with proper typing
export const api = {
  // Auth
  login: async (data: { email: string; password: string }): Promise<ApiResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  register: async (data: { name: string; email: string; password: string }): Promise<ApiResponse> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    return response.json();
  },

  getProfile: (): Promise<any> => fetcher('/auth/me'),
  
  updateProfile: async (data: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  // Tasks - returns ApiResponse with data array
  getTasks: async (params?: Record<string, string>): Promise<ApiResponse<any[]>> => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    const response = await fetch(`${API_URL}/tasks${queryString}`, {
      credentials: 'include',
      cache: 'no-store',
    });
    return response.json();
  },
  
  getTask: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      credentials: 'include',
      cache: 'no-store',
    });
    return response.json();
  },
  
  createTask: async (data: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  updateTask: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  
  deleteTask: async (id: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: { 'Cache-Control': 'no-cache' },
      credentials: 'include',
    });
    return response.json();
  },
  
  // Dashboard
  getDashboard: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_URL}/tasks/dashboard`, {
      credentials: 'include',
      cache: 'no-store',
    });
    return response.json();
  },
  
  // Users (for assignment dropdown)
  getUsers: async (): Promise<ApiResponse<any[]>> => {
    const response = await fetch(`${API_URL}/tasks/users`, {
      credentials: 'include',
      cache: 'no-store',
    });
    return response.json();
  },
  
  // Enhanced task functions with user filtering
  getAssignedTasks: async (userId?: string): Promise<ApiResponse<any[]>> => {
    const params: Record<string, string> = {};
    if (userId) params.assignedTo = userId;
    const queryString = Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '';
    const response = await fetch(`${API_URL}/tasks${queryString}`, {
      credentials: 'include',
      cache: 'no-store',
    });
    return response.json();
  },
  
  getCreatedTasks: async (userId?: string): Promise<ApiResponse<any[]>> => {
    const params: Record<string, string> = {};
    if (userId) params.createdBy = userId;
    const queryString = Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '';
    const response = await fetch(`${API_URL}/tasks${queryString}`, {
      credentials: 'include',
      cache: 'no-store',
    });
    return response.json();
  },
  
  // Task status updates
  updateTaskStatus: async (id: string, status: string): Promise<ApiResponse> => {
    return api.updateTask(id, { status });
  },
  
  // Search tasks
  searchTasks: async (query: string, userId?: string): Promise<ApiResponse<any[]>> => {
    const params: Record<string, string> = { search: query };
    if (userId) params.userId = userId;
    const queryString = `?${new URLSearchParams(params).toString()}`;
    const response = await fetch(`${API_URL}/tasks${queryString}`, {
      credentials: 'include',
      cache: 'no-store',
    });
    return response.json();
  },
  
  // Get task statistics
  getTaskStats: async (userId?: string): Promise<ApiResponse> => {
    const url = userId ? `/tasks/dashboard?userId=${userId}` : '/tasks/dashboard';
    const response = await fetch(`${API_URL}${url}`, {
      credentials: 'include',
      cache: 'no-store',
    });
    return response.json();
  },
};

// SWR fetcher for use with useSWR hook
export const swrFetcher = async <T = any>(url: string): Promise<T> => {
  const response = await fetch(`${API_URL}${url}`, {
    credentials: 'include',
    cache: 'no-store',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  
  const result: ApiResponse<T> = await response.json();
  return result.data;
};

// Task-specific API helpers
export const taskApi = {
  // Create task with validation
  createTaskWithValidation: async (taskData: {
    title: string;
    description?: string;
    status: string;
    priority: string;
    dueDate?: string;
    assignedToId: string;
    creatorId: string;
  }): Promise<ApiResponse> => {
    // Validate required fields
    if (!taskData.title?.trim()) {
      throw new Error('Title is required');
    }
    
    if (!taskData.assignedToId) {
      throw new Error('Please assign the task to a user');
    }
    
    return api.createTask(taskData);
  },
  
  // Bulk update tasks
  updateMultipleTasks: async (updates: Array<{ id: string; status: string }>): Promise<ApiResponse[]> => {
    const promises = updates.map(update => api.updateTaskStatus(update.id, update.status));
    return Promise.all(promises);
  },
  
  // Get tasks by status
  getTasksByStatus: async (status: string, userId?: string): Promise<ApiResponse<any[]>> => {
    const params: Record<string, string> = { status };
    if (userId) params.userId = userId;
    const queryString = `?${new URLSearchParams(params).toString()}`;
    const response = await fetch(`${API_URL}/tasks${queryString}`, {
      credentials: 'include',
      cache: 'no-store',
    });
    return response.json();
  },
  
  // Get tasks by priority
  getTasksByPriority: async (priority: string, userId?: string): Promise<ApiResponse<any[]>> => {
    const params: Record<string, string> = { priority };
    if (userId) params.userId = userId;
    const queryString = `?${new URLSearchParams(params).toString()}`;
    const response = await fetch(`${API_URL}/tasks${queryString}`, {
      credentials: 'include',
      cache: 'no-store',
    });
    return response.json();
  },
  
  // Get overdue tasks
  getOverdueTasks: async (userId?: string): Promise<ApiResponse<any[]>> => {
    const params: Record<string, string> = { overdue: 'true' };
    if (userId) params.userId = userId;
    const queryString = `?${new URLSearchParams(params).toString()}`;
    const response = await fetch(`${API_URL}/tasks${queryString}`, {
      credentials: 'include',
      cache: 'no-store',
    });
    return response.json();
  },
};

export default api;