import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { TrendingUp, Users, FileText, MessageSquare, Download, FileType } from 'lucide-react';

interface DashboardProps {
  userRole: 'student' | 'faculty' | 'admin' | null;
  onNavigate: (page: any) => void;
  onLogout: () => void;
  onViewResource: (id: string) => void;
}

export function Dashboard({ userRole, onNavigate, onLogout, onViewResource }: DashboardProps) {
  const stats = [
    { label: 'Total Resources', value: '1,234', icon: FileText, color: 'from-blue-500 to-cyan-500' },
    { label: 'Active Users', value: '856', icon: Users, color: 'from-purple-500 to-pink-500' },
    { label: 'Discussions', value: '432', icon: MessageSquare, color: 'from-green-500 to-emerald-500' },
    { label: 'Downloads', value: '5.2K', icon: Download, color: 'from-orange-500 to-amber-500' },
  ];

  const recentResources = [
    {
      id: '1',
      title: 'Introduction to Machine Learning',
      subject: 'Computer Science',
      uploadedBy: 'Dr. Sarah Wilson',
      type: 'PDF',
      isFaculty: true,
    },
    {
      id: '2',
      title: 'Quantum Physics Lecture Notes',
      subject: 'Physics',
      uploadedBy: 'Prof. Michael Chen',
      type: 'PDF',
      isFaculty: true,
    },
    {
      id: '3',
      title: 'Database Design Patterns',
      subject: 'Computer Science',
      uploadedBy: 'Alex Kumar',
      type: 'Link',
      isFaculty: false,
    },
  ];

  const trendingDiscussions = [
    {
      id: '1',
      title: 'How to prepare for Data Structures exam?',
      replies: 24,
      subject: 'Computer Science',
    },
    {
      id: '2',
      title: 'Best resources for learning React?',
      replies: 18,
      subject: 'Web Development',
    },
    {
      id: '3',
      title: 'Calculus II study group',
      replies: 12,
      subject: 'Mathematics',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={userRole} onLogout={onLogout} />
      
      <div className="flex">
        <Sidebar currentPage="dashboard" onNavigate={onNavigate} userRole={userRole} />
        
        <main className="flex-1 p-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl text-gray-900 mb-2" style={{ fontWeight: 700 }}>
              Welcome back, John! 👋
            </h1>
            <p className="text-gray-600">Here's what's happening with your academic community today.</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
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

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recently Uploaded Resources */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl text-gray-900" style={{ fontWeight: 600 }}>
                  Recently Uploaded
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {recentResources.map((resource) => (
                  <div
                    key={resource.id}
                    onClick={() => onViewResource(resource.id)}
                    className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-gray-100"
                  >
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileType className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm text-gray-900 mb-1" style={{ fontWeight: 600 }}>
                        {resource.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                          {resource.subject}
                        </span>
                        <span>•</span>
                        <span>{resource.uploadedBy}</span>
                        {resource.isFaculty && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                            Faculty
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => onNavigate('resources')}
                  className="w-full py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  View All Resources
                </button>
              </div>
            </motion.div>

            {/* Trending Discussions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl text-gray-900 flex items-center gap-2" style={{ fontWeight: 600 }}>
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  Trending Discussions
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {trendingDiscussions.map((discussion) => (
                  <div
                    key={discussion.id}
                    className="p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-gray-100"
                  >
                    <h3 className="text-sm text-gray-900 mb-2" style={{ fontWeight: 600 }}>
                      {discussion.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                        {discussion.subject}
                      </span>
                      <span>•</span>
                      <span>{discussion.replies} replies</span>
                    </div>
                  </div>
                ))}
                <button
                  className="w-full py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  View All Discussions
                </button>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
