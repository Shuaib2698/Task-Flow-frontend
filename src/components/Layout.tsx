'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaTasks, FaUser, FaBell, FaSignOutAlt, FaHome } from 'react-icons/fa';
import { useAuth } from '@/hooks/useAuth';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <FaHome /> },
    { href: '/tasks', label: 'Tasks', icon: <FaTasks /> },
    { href: '/profile', label: 'Profile', icon: <FaUser /> },
  ];

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">TaskFlow</h1>
          <p className="text-gray-500 text-sm mt-1">Manage tasks efficiently</p>
          <div className="mt-4 flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-blue-600 font-semibold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-sm">{user.name}</p>
              <p className="text-gray-500 text-xs">{user.email}</p>
            </div>
          </div>
        </div>
        
        <nav className="mt-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                pathname === item.href ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout button at bottom */}
        <div className="absolute bottom-0 w-full p-6 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-700 hover:text-red-600 transition-colors w-full"
          >
            <FaSignOutAlt className="mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="px-8 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {pathname === '/dashboard' ? 'Dashboard' : 
                 pathname === '/tasks' ? 'Tasks' : 
                 pathname === '/profile' ? 'Profile' : 'TaskFlow'}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;