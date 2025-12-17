'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Layout from '@/components/Layout';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { DashboardData, Task } from '@/types';
import { format } from 'date-fns';
import { api, swrFetcher } from '@/utils/api';
import Link from 'next/link';
import TaskCard from '@/components/TaskCard';
import TaskModal from '@/components/TaskModal';
import { 
  FaPlus, FaTasks, FaCheckCircle, FaClock, FaUser, 
  FaExclamationTriangle, FaListUl 
} from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, isLoading: authLoading } = useProtectedRoute();
  const { users } = useAuth();
  const { data: dashboardData, mutate: mutateDashboard } = useSWR<DashboardData>(
    '/tasks/dashboard', 
    swrFetcher
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'assigned' | 'created' | 'overdue'>('all');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;
      
      setIsLoadingTasks(true);
      try {
        const response = await api.getTasks();
        if (response.success) {
          setTasks(response.data || []);
        } else {
          toast.error(response.message || 'Failed to load tasks');
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        setIsLoadingTasks(false);
      }
    };
    
    fetchTasks();
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'assigned':
        return task.assignedTo?.id === user.id;
      case 'created':
        return task.creatorId === user.id;
      case 'overdue':
        return new Date(task.dueDate) < new Date() && task.status !== 'Completed';
      default:
        return task.assignedTo?.id === user.id || task.creatorId === user.id;
    }
  });

  // Calculate stats
  const stats = {
    totalAssigned: tasks.filter(t => t.assignedTo?.id === user.id).length,
    totalCreated: tasks.filter(t => t.creatorId === user.id).length,
    overdueTasks: tasks.filter(t => 
      new Date(t.dueDate) < new Date() && t.status !== 'Completed'
    ).length,
    tasksInProgress: tasks.filter(t => 
      (t.assignedTo?.id === user.id || t.creatorId === user.id) && 
      t.status === 'InProgress'
    ).length,
  };

  const handleTaskCreated = async () => {
    // Refresh dashboard data
    mutateDashboard();
    
    // Refresh tasks
    try {
      const response = await api.getTasks();
      if (response.success) {
        setTasks(response.data || []);
      }
    } catch (error) {
      console.error('Error refreshing tasks:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user.name}!</h1>
              <p className="opacity-90 mt-1">Manage your tasks efficiently</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium flex items-center"
            >
              <FaPlus className="mr-2" />
              New Task
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaUser className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-gray-500 text-sm">Assigned to Me</p>
                <p className="text-2xl font-bold mt-1">{stats.totalAssigned}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FaTasks className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-gray-500 text-sm">Created by Me</p>
                <p className="text-2xl font-bold mt-1">{stats.totalCreated}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <FaExclamationTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-gray-500 text-sm">Overdue</p>
                <p className="text-2xl font-bold mt-1">{stats.overdueTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FaClock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-gray-500 text-sm">In Progress</p>
                <p className="text-2xl font-bold mt-1">{stats.tasksInProgress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <div className="flex space-x-4 p-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                All Tasks
              </button>
              <button
                onClick={() => setFilter('assigned')}
                className={`px-4 py-2 rounded-lg ${filter === 'assigned' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Assigned to Me
              </button>
              <button
                onClick={() => setFilter('created')}
                className={`px-4 py-2 rounded-lg ${filter === 'created' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Created by Me
              </button>
              <button
                onClick={() => setFilter('overdue')}
                className={`px-4 py-2 rounded-lg ${filter === 'overdue' ? 'bg-red-100 text-red-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Overdue
              </button>
            </div>
          </div>

          {/* Tasks List */}
          <div className="p-4">
            {isLoadingTasks ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <FaListUl className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No tasks found</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create your first task
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={handleTaskCreated}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/tasks" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <FaTasks className="mr-2" />
              View All Tasks
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <FaPlus className="mr-2" />
              Create New Task
            </button>
            <Link 
              href="/profile" 
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
            >
              <FaUser className="mr-2" />
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleTaskCreated}
      />
    </Layout>
  );
}