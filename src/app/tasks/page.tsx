'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Layout from '@/components/Layout';
import TaskCard from '@/components/TaskCard';
import TaskModal from '@/components/TaskModal';
import { Task } from '@/types';
import { FaPlus, FaSearch } from 'react-icons/fa';

export default function TasksPage() {
  const { data: tasks, mutate } = useSWR<Task[]>('/tasks');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filteredTasks = tasks?.filter(task =>
    task.title.toLowerCase().includes(search.toLowerCase()) ||
    task.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>
            <p className="text-gray-600">Manage all your tasks in one place</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center"
          >
            <FaPlus className="mr-2" />
            New Task
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-12"
          />
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks?.map((task) => (
            <div key={task.id} onClick={() => handleEdit(task)} className="cursor-pointer">
              <TaskCard task={task} />
            </div>
          ))}
        </div>

        {(!filteredTasks || filteredTasks.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-500">No tasks found. Create your first task!</p>
          </div>
        )}

        {/* Task Modal */}
        {isModalOpen && (
          <TaskModal
            task={editingTask}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSuccess={() => {
              mutate();
              handleCloseModal();
            }}
          />
        )}
      </div>
    </Layout>
  );
}