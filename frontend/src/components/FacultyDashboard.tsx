import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { 
  Users, 
  CheckCircle, 
  TrendingUp, 
  FileText,
  AlertCircle,
  ArrowUp
} from 'lucide-react';

interface FacultyDashboardProps {
  onNavigate: (page: any) => void;
  onLogout: () => void;
  onViewResource: (id: string) => void;
}

export function FacultyDashboard({ onNavigate, onLogout, onViewResource }: FacultyDashboardProps) {
  const [notesApproved, setNotesApproved] = useState(0);
  const [activeStudents, setActiveStudents] = useState(0);
  const [engagement, setEngagement] = useState(0);

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

    animateCounter(setNotesApproved, 48);
    animateCounter(setActiveStudents, 234);
    animateCounter(setEngagement, 89);
  }, []);

  const stats = [
    { 
      label: 'Notes Approved', 
      value: notesApproved, 
      icon: CheckCircle, 
      color: 'from-green-500 to-emerald-500',
      change: '+15%'
    },
    { 
      label: 'Active Students', 
      value: activeStudents, 
      icon: Users, 
      color: 'from-blue-500 to-cyan-500',
      change: '+8%'
    },
    { 
      label: 'Engagement Rate', 
      value: `${engagement}%`, 
      icon: TrendingUp, 
      color: 'from-violet-500 to-purple-500',
      change: '+12%'
    },
    { 
      label: 'Pending Reviews', 
      value: 5, 
      icon: AlertCircle, 
      color: 'from-orange-500 to-amber-500',
      change: ''
    },
  ];

  const submissions = [
    {
      id: '1',
      title: 'Advanced Algorithms Study Guide',
      student: 'John Smith',
      course: 'CS401',
      submittedAt: '2 hours ago',
      status: 'pending'
    },
    {
      id: '2',
      title: 'Database Normalization Notes',
      student: 'Sarah Johnson',
      course: 'CS301',
      submittedAt: '5 hours ago',
      status: 'pending'
    },
  ];

  const aiInsights = [
    { insight: 'Students are most active on Database topics', trend: 'up', percentage: '23%' },
    { insight: 'Engagement increased in afternoon sessions', trend: 'up', percentage: '15%' },
    { insight: 'Request for more Algorithm examples', trend: 'neutral', percentage: null },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar userRole="faculty" userName="Dr. Sarah Wilson" onLogout={onLogout} />
      
      <div className="flex">
        <Sidebar currentPage="dashboard" onNavigate={onNavigate} userRole="faculty" />
        
        <main className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Faculty Dashboard
            </h1>
            <p className="text-lg text-gray-600">Monitor student engagement and review submissions</p>
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
                    {stat.change && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <ArrowUp className="w-3 h-3" />
                        {stat.change}
                      </span>
                    )}
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Student Submissions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">
                  Pending Submissions
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="p-4 hover:bg-gray-50 rounded-xl transition-all border border-gray-100"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {submission.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                      <span>By {submission.student}</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                        {submission.course}
                      </span>
                      <span>•</span>
                      <span>{submission.submittedAt}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                        Approve
                      </button>
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                        Review
                      </button>
                      <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium">
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* AI Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">
                  AI Insights
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {aiInsights.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl border border-indigo-100"
                  >
                    <p className="text-sm text-gray-900 font-medium mb-2">
                      {item.insight}
                    </p>
                    {item.percentage && (
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                        item.trend === 'up' ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {item.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                        {item.percentage}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
