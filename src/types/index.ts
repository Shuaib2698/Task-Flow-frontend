export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type Status = 'ToDo' | 'InProgress' | 'Review' | 'Completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: Priority;
  status: Status;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  assignedToId?: string;
  creator: Pick<User, 'id' | 'name' | 'email'>;
  assignedTo?: Pick<User, 'id' | 'name' | 'email'>;
}

// Add Activity interface
export interface Activity {
  id: string;
  action: string;
  details: Record<string, any>;
  taskId: string;
  userId: string;
  createdAt: string;
  user: Pick<User, 'id' | 'name'>;
}

export interface TaskWithActivities {
  task: Task;
  activities: Activity[];
}

export interface DashboardData {
  totalAssigned: number;
  totalCreated: number;
  overdueTasks: Task[];
  tasksByStatus: Array<{ status: Status; _count: number }>;
  tasksByPriority: Array<{ priority: Priority; _count: number }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}