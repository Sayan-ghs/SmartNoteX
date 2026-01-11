import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  MessageSquare,
  Award,
  TrendingUp,
  Edit
} from 'lucide-react';

interface ProfilePageProps {
  userId: string | null;
  userRole: 'student' | 'faculty' | 'admin' | null;
  onNavigate: (page: any) => void;
  onLogout: () => void;
  onViewResource: (id: string) => void;
  onViewBlog: (id: string) => void;
}

export function ProfilePage({ userId, userRole, onNavigate, onLogout, onViewResource, onViewBlog }: ProfilePageProps) {
  const profile = {
    name: 'John Doe',
    avatar: 'JD',
    role: 'Student',
    department: 'Computer Science',
    university: 'MIT',
    email: 'john.doe@mit.edu',
    location: 'Cambridge, MA',
    joinedDate: 'January 2025',
    bio: 'Passionate about machine learning and artificial intelligence. Always eager to learn and share knowledge with the community.',
    stats: {
      notesUploaded: 24,
      blogsWritten: 8,
      totalLikes: 456,
      followers: 123
    }
  };

  const uploadedNotes = [
    {
      id: '1',
      title: 'Machine Learning Fundamentals',
      subject: 'Computer Science',
      downloads: 234,
      likes: 56
    },
    {
      id: '2',
      title: 'Data Structures Cheat Sheet',
      subject: 'Computer Science',
      downloads: 567,
      likes: 128
    },
    {
      id: '3',
      title: 'Algorithms Study Guide',
      subject: 'Computer Science',
      downloads: 345,
      likes: 89
    },
  ];

  const blogs = [
    {
      id: '1',
      title: 'My Journey Through Quantum Computing',
      excerpt: 'A student\'s perspective on learning quantum computing...',
      readTime: '5 min read',
      likes: 156
    },
    {
      id: '2',
      title: 'Tips for Effective Code Reviews',
      excerpt: 'Best practices I\'ve learned from industry experience...',
      readTime: '4 min read',
      likes: 89
    },
  ];

  const achievements = [
    { icon: Award, label: 'Top Contributor', color: 'from-yellow-500 to-orange-500' },
    { icon: TrendingUp, label: 'Rising Star', color: 'from-blue-500 to-cyan-500' },
    { icon: MessageSquare, label: 'Community Helper', color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar userRole={userRole} onLogout={onLogout} />
      
      <div className="flex">
        <Sidebar currentPage="profile" onNavigate={onNavigate} userRole={userRole} />
        
        <main className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
          >
            {/* Profile Header */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
              <div className="h-32 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600" />
              <div className="px-8 pb-8">
                <div className="flex items-end justify-between -mt-16 mb-6">
                  <div className="flex items-end gap-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-2xl border-4 border-white">
                      {profile.avatar}
                    </div>
                    <div className="pb-2">
                      <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                      <p className="text-lg text-gray-600">{profile.role} • {profile.department}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mb-2 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    <Edit className="w-5 h-5" />
                    Edit Profile
                  </motion.button>
                </div>

                <p className="text-gray-700 leading-relaxed mb-6 max-w-3xl">
                  {profile.bio}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-600" />
                    {profile.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    {profile.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    Joined {profile.joinedDate}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Notes Uploaded', value: profile.stats.notesUploaded, color: 'from-blue-500 to-cyan-500' },
                { label: 'Blogs Written', value: profile.stats.blogsWritten, color: 'from-violet-500 to-purple-500' },
                { label: 'Total Likes', value: profile.stats.totalLikes, color: 'from-pink-500 to-rose-500' },
                { label: 'Followers', value: profile.stats.followers, color: 'from-green-500 to-emerald-500' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Achievements</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${achievement.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="font-semibold text-gray-900">{achievement.label}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Uploaded Notes */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100"
              >
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">Uploaded Notes</h2>
                </div>
                <div className="p-6 space-y-4">
                  {uploadedNotes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => onViewResource(note.id)}
                      className="p-4 hover:bg-gray-50 rounded-xl transition-all cursor-pointer border border-gray-100 group"
                    >
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {note.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium text-xs">
                          {note.subject}
                        </span>
                        <span>{note.downloads} downloads</span>
                        <span>{note.likes} likes</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Blogs */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100"
              >
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">Written Blogs</h2>
                </div>
                <div className="p-6 space-y-4">
                  {blogs.map((blog) => (
                    <div
                      key={blog.id}
                      onClick={() => onViewBlog(blog.id)}
                      className="p-4 hover:bg-gray-50 rounded-xl transition-all cursor-pointer border border-gray-100 group"
                    >
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {blog.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{blog.excerpt}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{blog.readTime}</span>
                        <span>•</span>
                        <span>{blog.likes} likes</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
