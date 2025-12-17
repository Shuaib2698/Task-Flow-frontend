'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Layout from '@/components/Layout';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { Task } from '@/types';
import TaskCard from '@/components/TaskCard';
import TaskModal from '@/components/TaskModal';
import { FaPlus, FaSearch, FaFilter } from 'react-icons/fa';
import { api, swrFetcher } from '@/utils/api';
import toast from 'react-hot-toast';

export default function TasksPage() {
  const { user, isLoading: authLoading } = useProtectedRoute();
  const { users } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch tasks
  const fetchTasks = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const handleTaskCreated = () => {
    fetchTasks();
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const response = await api.deleteTask(taskId);
      if (response.success) {
        toast.success('Task deleted successfully');
        fetchTasks();
      } else {
        toast.error(response.message || 'Failed to delete task');
      }
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    // Search filter
    const matchesSearch = search === '' || 
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    
    // Priority filter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    // User visibility filter (show tasks assigned to or created by current user)
    const isVisibleToUser = 
      task.assignedTo?.id === user.id || 
      task.creatorId === user.id ||
      user.id === task.assignedTo?.id;
    
    return matchesSearch && matchesStatus && matchesPriority && isVisibleToUser;
  });

  const statusOptions = ['all', 'ToDo', 'InProgress', 'Review', 'Completed'];
  const priorityOptions = ['all', 'Low', 'Medium', 'High', 'Urgent'];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600">Manage all your tasks in one place</p>
          </div>
          <button
            onClick={() => {
              setSelectedTask(null);
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center"
          >
            <FaPlus className="mr-2" />
            New Task
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : status}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority === 'all' ? 'All Priority' : priority}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading tasks...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-500">No tasks found</p>
              <button
                onClick={() => {
                  setSelectedTask(null);
                  setIsModalOpen(true);
                }}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Create your first task
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <div key={task.id} className="p-4 hover:bg-gray-50">
                  <TaskCard
                    task={task}
                    onUpdate={handleTaskCreated}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onSuccess={handleTaskCreated}
      />
    </Layout>
  );
}