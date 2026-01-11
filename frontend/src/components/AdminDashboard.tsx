import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Shield, CheckCircle, XCircle, Users, FileText, AlertTriangle } from 'lucide-react';

interface AdminDashboardProps {
  userRole: 'student' | 'faculty' | 'admin' | null;
  onNavigate: (page: any) => void;
  onLogout: () => void;
}

export function AdminDashboard({ userRole, onNavigate, onLogout }: AdminDashboardProps) {
  const [pendingResources, setPendingResources] = useState([
    {
      id: '1',
      title: 'Advanced Algorithms Study Guide',
      uploadedBy: 'John Smith',
      category: 'Computer Science',
      uploadDate: '2 hours ago',
      size: '3.4 MB',
    },
    {
      id: '2',
      title: 'Organic Chemistry Lab Manual',
      uploadedBy: 'Sarah Johnson',
      category: 'Chemistry',
      uploadDate: '5 hours ago',
      size: '8.1 MB',
    },
    {
      id: '3',
      title: 'Statistical Analysis Tutorial',
      uploadedBy: 'Mike Davis',
      category: 'Mathematics',
      uploadDate: '1 day ago',
      size: '2.7 MB',
    },
  ]);

  const users = [
    { id: '1', name: 'Alex Kumar', email: 'alex@university.edu', role: 'student', status: 'active' },
    { id: '2', name: 'Dr. Sarah Wilson', email: 'sarah@university.edu', role: 'faculty', status: 'active' },
    { id: '3', name: 'Emma Chen', email: 'emma@university.edu', role: 'student', status: 'active' },
    { id: '4', name: 'Prof. Michael Lee', email: 'michael@university.edu', role: 'faculty', status: 'pending' },
  ];

  const stats = [
    { label: 'Pending Approvals', value: pendingResources.length, icon: AlertTriangle, color: 'from-orange-500 to-amber-500' },
    { label: 'Total Users', value: users.length, icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'Total Resources', value: '1,234', icon: FileText, color: 'from-purple-500 to-pink-500' },
  ];

  const handleApprove = (id: string) => {
    setPendingResources(prev => prev.filter(r => r.id !== id));
    // Show success toast
  };

  const handleReject = (id: string) => {
    setPendingResources(prev => prev.filter(r => r.id !== id));
    // Show rejection toast
  };

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar userRole={userRole} onLogout={onLogout} />
        <div className="flex">
          <Sidebar currentPage="dashboard" onNavigate={onNavigate} userRole={userRole} />
          <main className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl text-gray-900 mb-2" style={{ fontWeight: 700 }}>
                Access Denied
              </h2>
              <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={userRole} onLogout={onLogout} />
      
      <div className="flex">
        <Sidebar currentPage="admin" onNavigate={onNavigate} userRole={userRole} />
        
        <main className="flex-1 p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl text-gray-900" style={{ fontWeight: 700 }}>
                Admin Dashboard
              </h1>
            </div>
            <p className="text-gray-600">Manage platform resources, users, and content moderation</p>
          </motion.div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-2xl text-gray-900 mb-1" style={{ fontWeight: 700 }}>
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Pending Approvals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl text-gray-900 flex items-center gap-2" style={{ fontWeight: 600 }}>
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Pending Resource Approvals
              </h2>
            </div>
            <div className="p-6">
              {pendingResources.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-600">All resources have been reviewed!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingResources.map((resource) => (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1">
                        <h3 className="text-sm text-gray-900 mb-1" style={{ fontWeight: 600 }}>
                          {resource.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {resource.category}
                          </span>
                          <span>•</span>
                          <span>By {resource.uploadedBy}</span>
                          <span>•</span>
                          <span>{resource.uploadDate}</span>
                          <span>•</span>
                          <span>{resource.size}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleApprove(resource.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          style={{ fontWeight: 500 }}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleReject(resource.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          style={{ fontWeight: 500 }}
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* User Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl text-gray-900 flex items-center gap-2" style={{ fontWeight: 600 }}>
                <Users className="w-5 h-5 text-indigo-600" />
                User Management
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-gray-600" style={{ fontWeight: 600 }}>
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600" style={{ fontWeight: 600 }}>
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600" style={{ fontWeight: 600 }}>
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600" style={{ fontWeight: 600 }}>
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-gray-600" style={{ fontWeight: 600 }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900" style={{ fontWeight: 500 }}>
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.role === 'faculty'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button className="text-indigo-600 hover:text-indigo-700 transition-colors" style={{ fontWeight: 500 }}>
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
