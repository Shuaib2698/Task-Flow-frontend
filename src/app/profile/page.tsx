'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';

export default function ProfilePage() {
  const { user: authUser, isLoading: authLoading } = useProtectedRoute();
  const { getProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: authUser?.name || '',
    avatar: authUser?.avatar || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        await getProfile(); // Refresh user data
      } else {
        toast.error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: authUser?.name || '',
      avatar: authUser?.avatar || '',
    });
    setIsEditing(false);
  };

  if (authLoading || !authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-white">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                {authUser.avatar ? (
                  <img 
                    src={authUser.avatar} 
                    alt={authUser.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-blue-600 text-4xl font-bold">
                    {authUser.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{authUser.name}</h1>
                <p className="opacity-90">{authUser.email}</p>
                <p className="text-sm opacity-75 mt-2">
                  Member since {format(new Date(authUser.createdAt), 'MMMM yyyy')}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="p-8">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avatar URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.avatar || ''}
                    onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                    className="input-field"
                    placeholder="https://example.com/avatar.jpg"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter a URL for your profile picture
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary flex items-center"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    ) : (
                      <FaSave className="mr-2" />
                    )}
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-secondary flex items-center"
                  >
                    <FaTimes className="mr-2" />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1 text-lg">{authUser.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Account Created</h3>
                    <p className="mt-1 text-lg">
                      {format(new Date(authUser.createdAt), 'PPP')}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-primary flex items-center"
                  >
                    <FaEdit className="mr-2" />
                    Edit Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Info Card */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">User ID</h3>
                <p className="text-sm text-gray-500">Unique identifier for your account</p>
              </div>
              <code className="text-sm bg-gray-100 px-3 py-1 rounded">
                {authUser.id}
              </code>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Email Verified</h3>
                <p className="text-sm text-gray-500">Email verification status</p>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                Not Verified
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}