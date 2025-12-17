'use client';

import React, { useState } from 'react';
import { Task, User } from '@/types';
import { FaClock, FaUser, FaEdit, FaTrash, FaFlag, FaCheck } from 'react-icons/fa';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

interface TaskCardProps {
  task: Task;
  onUpdate: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate }) => {
  const router = useRouter();
  const { user, users } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    setIsLoading(true);
    try {
      await api.deleteTask(task.id);
      toast.success('Task deleted successfully');
      onUpdate();
    } catch (error) {
      toast.error('Failed to delete task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: Task['status']) => {
    setIsLoading(true);
    try {
      await api.updateTask(task.id, {
        ...task,
        status: newStatus,
      });
      toast.success('Task status updated');
      onUpdate();
    } catch (error) {
      toast.error('Failed to update task status');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if current user can edit this task
  const canEditTask = user?.id === task.creatorId || user?.id === task.assignedTo?.id;

  // Find assigned user details
  const assignedUser = users.find(u => u.id === task.assignedTo?.id);
  const creatorUser = users.find(u => u.id === task.creatorId);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)} flex items-center`}>
              <FaFlag className="mr-1" size={10} />
              {task.priority}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
          
          {task.description && (
            <p className="text-gray-600 text-sm mt-2 line-clamp-2">{task.description}</p>
          )}
        </div>
        
        {canEditTask && (
          <div className="flex space-x-2 ml-4">
            <button
              onClick={() => router.push(`/tasks/${task.id}`)}
              className="p-2 text-gray-600 hover:text-blue-600 disabled:opacity-50"
              disabled={isLoading}
              title="Edit task"
            >
              <FaEdit />
            </button>
            {(user?.id === task.creatorId) && (
              <button
                onClick={handleDelete}
                className="p-2 text-gray-600 hover:text-red-600 disabled:opacity-50"
                disabled={isLoading}
                title="Delete task"
              >
                <FaTrash />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Assignment Information */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <FaUser className="mr-2" />
            <div>
              <span className="font-medium">Assigned to:</span>
              <span className="ml-2 text-gray-800">
                {assignedUser ? assignedUser.name : 'Unassigned'}
              </span>
            </div>
          </div>
          
          {creatorUser && creatorUser.id !== assignedUser?.id && (
            <div className="flex items-center">
              <FaUser className="mr-2" />
              <div>
                <span className="font-medium">Created by:</span>
                <span className="ml-2 text-gray-800">{creatorUser.name}</span>
              </div>
            </div>
          )}
          
          <div className="flex items-center">
            <FaClock className="mr-2" />
            <div>
              <span className="font-medium">Due:</span>
              <span className={`ml-2 ${new Date(task.dueDate) < new Date() ? 'text-red-600' : 'text-gray-800'}`}>
                {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'No due date'}
              </span>
            </div>
          </div>
        </div>

        {/* Status Update Buttons (visible to assigned user and creator) */}
        {canEditTask && task.status !== 'Completed' && (
          <div className="mt-4 flex space-x-2">
            {task.status !== 'InProgress' && (
              <button
                onClick={() => handleStatusUpdate('InProgress')}
                disabled={isLoading}
                className="flex-1 py-2 px-3 bg-yellow-100 text-yellow-800 text-sm rounded-md hover:bg-yellow-200 disabled:opacity-50"
              >
                Start
              </button>
            )}
            {task.status !== 'Review' && (
              <button
                onClick={() => handleStatusUpdate('Review')}
                disabled={isLoading}
                className="flex-1 py-2 px-3 bg-purple-100 text-purple-800 text-sm rounded-md hover:bg-purple-200 disabled:opacity-50"
              >
                Mark for Review
              </button>
            )}
            <button
              onClick={() => handleStatusUpdate('Completed')}
              disabled={isLoading}
              className="flex-1 py-2 px-3 bg-green-100 text-green-800 text-sm rounded-md hover:bg-green-200 disabled:opacity-50 flex items-center justify-center"
            >
              <FaCheck className="mr-2" />
              Complete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;