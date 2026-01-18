import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { 
  TrendingUp, 
  Download, 
  Heart, 
  Brain, 
  FileText, 
  Eye,
  ArrowUp,
  Sparkles
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (page: any) => void;
  onLogout: () => void;
  onViewResource: (id: string) => void;
  onViewBlog: (id: string) => void;
}

export function StudentDashboard({ onNavigate, onLogout, onViewResource, onViewBlog: _onViewBlog }: StudentDashboardProps) {
  const [notesCount, setNotesCount] = useState(0);
  const [downloadsCount, setDownloadsCount] = useState(0);
  const [likesCount, setLikesCount] = useState(0);
  const [aiUsageCount, setAiUsageCount] = useState(0);

  // Animate counters on load
  useEffect(() => {
    const animateCounter = (setter: any, target: number) => {
      let current = 0;
      const increment = target / 50;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(current));
        }
      }, 20);
    };

    animateCounter(setNotesCount, 24);
    animateCounter(setDownloadsCount, 156);
    animateCounter(setLikesCount, 89);
    animateCounter(setAiUsageCount, 12);
  }, []);

  const stats = [
    { 
      label: 'Notes Uploaded', 
      value: notesCount, 
      icon: FileText, 
      color: 'from-blue-500 to-cyan-500',
      change: '+12%'
    },
    { 
      label: 'Downloads Received', 
      value: downloadsCount, 
      icon: Download, 
      color: 'from-violet-500 to-purple-500',
      change: '+23%'
    },
    { 
      label: 'Likes & Saves', 
      value: likesCount, 
      icon: Heart, 
      color: 'from-pink-500 to-rose-500',
      change: '+8%'
    },
    { 
      label: 'AI Summaries Used', 
      value: aiUsageCount, 
      icon: Brain, 
      color: 'from-indigo-500 to-violet-500',
      change: '+15%'
    },
  ];

  const recentUploads = [
    {
      id: '1',
      title: 'Machine Learning Fundamentals',
      subject: 'Computer Science',
      views: 234,
      downloads: 56,
      likes: 23,
      timeAgo: '2 hours ago'
    },
    {
      id: '2',
      title: 'Quantum Physics Notes',
      subject: 'Physics',
      views: 189,
      downloads: 42,
      likes: 18,
      timeAgo: '1 day ago'
    },
    {
      id: '3',
      title: 'Data Structures Cheat Sheet',
      subject: 'Computer Science',
      views: 567,
      downloads: 128,
      likes: 67,
      timeAgo: '3 days ago'
    },
  ];

  const recommendedNotes = [
    {
      id: '4',
      title: 'Advanced Algorithms Guide',
      author: 'Dr. Sarah Wilson',
      subject: 'Computer Science',
      isFaculty: true
    },
    {
      id: '5',
      title: 'Organic Chemistry Lab Manual',
      author: 'Prof. Michael Chen',
      subject: 'Chemistry',
      isFaculty: true
    },
    {
      id: '6',
      title: 'Linear Algebra Study Guide',
      author: 'Alex Kumar',
      subject: 'Mathematics',
      isFaculty: false
    },
  ];

  const communityActivity = [
    { user: 'Emma Rodriguez', action: 'commented on', item: 'Database Design Patterns', time: '5 min ago' },
    { user: 'Dr. James Lee', action: 'uploaded', item: 'Web Development Tutorial', time: '20 min ago' },
    { user: 'Sarah Chen', action: 'liked', item: 'Machine Learning Fundamentals', time: '1 hour ago' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar userRole="student" onLogout={onLogout} />
      
      <div className="flex">
        <Sidebar currentPage="dashboard" onNavigate={onNavigate} userRole="student" />
        
        <main className="flex-1 p-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, John! 👋
            </h1>
            <p className="text-lg text-gray-600">Here's your learning overview today</p>
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
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <ArrowUp className="w-3 h-3" />
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Uploads */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Your Recent Uploads
                </h2>
                <button
                  onClick={() => onNavigate('resources')}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  View All
                </button>
              </div>
              <div className="p-6 space-y-4">
                {recentUploads.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => onViewResource(note.id)}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-all cursor-pointer border border-gray-100 group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {note.title}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                          {note.subject}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {note.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {note.downloads}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {note.likes}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{note.timeAgo}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Community Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  Community Activity
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {communityActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {activity.user.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">{activity.user}</span>
                        {' '}{activity.action}{' '}
                        <span className="font-semibold text-indigo-600">{activity.item}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Recommended Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                Recommended For You
              </h2>
            </div>
            <div className="p-6 grid md:grid-cols-3 gap-4">
              {recommendedNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => onViewResource(note.id)}
                  className="p-4 hover:bg-gray-50 rounded-xl transition-all cursor-pointer border border-gray-100 group"
                >
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {note.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">By {note.author}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                      {note.subject}
                    </span>
                    {note.isFaculty && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-medium">
                        Faculty
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
