'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import Layout from '@/components/Layout';
import { Task, Activity } from '@/types';
import { api } from '@/utils/api';
import { useSocket } from '@/contexts/SocketContext';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';


export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user, isLoading: authLoading } = useProtectedRoute();
  
  const { data: taskData, mutate: mutateTask } = useSWR<{ task: Task; activities: Activity[] }>(
    id ? `/tasks/${id}` : null
  );
  
  const { socket } = useSocket();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!socket || !id) return;

    const handleTaskUpdate = () => {
      mutateTask();
    };

    socket.on('task:updated', handleTaskUpdate);
    socket.on('task:deleted', () => {
      router.push('/tasks');
    });

    return () => {
      socket.off('task:updated', handleTaskUpdate);
      socket.off('task:deleted');
    };
  }, [socket, id, mutateTask, router]);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await api.deleteTask(id);
        toast.success('Task deleted successfully');
        router.push('/tasks');
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!taskData) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading task...</p>
        </div>
      </Layout>
    );
  }

  const { task, activities } = taskData;

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'ToDo': return 'bg-blue-100 text-blue-800';
      case 'InProgress': return 'bg-yellow-100 text-yellow-800';
      case 'Review': return 'bg-purple-100 text-purple-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary flex items-center"
            >
              <FaEdit className="mr-2" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="btn-secondary flex items-center bg-red-100 text-red-700 hover:bg-red-200"
            >
              <FaTrash className="mr-2" />
              Delete
            </button>
          </div>
        </div>

        {/* Main Task Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{task.title}</h1>
              <p className="text-gray-600">{task.description}</p>
            </div>
            <div className="flex space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <p className="text-gray-500 text-sm">Due Date</p>
              <p className="font-medium">
                {task.dueDate ? format(new Date(task.dueDate), 'PPP') : 'No due date'}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-gray-500 text-sm">Assigned To</p>
              <p className="font-medium">
                {task.assignedTo ? task.assignedTo.name : 'Unassigned'}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-gray-500 text-sm">Created By</p>
              <p className="font-medium">{task.creator.name}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-gray-500 text-sm">Created At</p>
              <p className="font-medium">{format(new Date(task.createdAt), 'PPP')}</p>
            </div>
          </div>
        </div>

        {/* Activity Log */}
        {activities && activities.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Activity Log</h2>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-gray-600">
                      {activity.user.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{activity.user.name}</p>
                      <span className="text-sm text-gray-500">
                        {format(new Date(activity.createdAt), 'PPp')}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-1">
                      <span className="font-medium">{activity.action}</span>
                      {activity.details && typeof activity.details === 'object' && (
                        <span className="text-gray-600 ml-2">
                          {JSON.stringify(activity.details)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}