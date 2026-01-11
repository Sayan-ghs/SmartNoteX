import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Clock, Heart, MessageSquare, BookmarkPlus, Plus } from 'lucide-react';

interface BlogsPageProps {
  userRole: 'student' | 'faculty' | 'admin' | null;
  onNavigate: (page: any) => void;
  onLogout: () => void;
  onViewBlog: (id: string) => void;
  onViewProfile: (userId: string) => void;
}

export function BlogsPage({ userRole, onNavigate, onLogout, onViewBlog, onViewProfile }: BlogsPageProps) {
  const blogs = [
    {
      id: '1',
      title: 'Understanding Machine Learning: A Beginner\'s Guide',
      excerpt: 'Dive into the fundamentals of machine learning, from basic concepts to practical applications in modern technology...',
      author: 'Dr. Sarah Wilson',
      authorAvatar: 'SW',
      role: 'faculty',
      readTime: '8 min read',
      likes: 234,
      comments: 45,
      publishedAt: '2 days ago',
      category: 'Computer Science',
      coverImage: '💻'
    },
    {
      id: '2',
      title: 'The Beauty of Mathematics in Nature',
      excerpt: 'Exploring the fascinating patterns and mathematical principles found in natural phenomena, from fractals to Fibonacci sequences...',
      author: 'Prof. Michael Chen',
      authorAvatar: 'MC',
      role: 'faculty',
      readTime: '6 min read',
      likes: 189,
      comments: 32,
      publishedAt: '4 days ago',
      category: 'Mathematics',
      coverImage: '📐'
    },
    {
      id: '3',
      title: 'My Journey Through Quantum Computing',
      excerpt: 'A student\'s perspective on learning quantum computing and the resources that helped me along the way...',
      author: 'Alex Kumar',
      authorAvatar: 'AK',
      role: 'student',
      readTime: '5 min read',
      likes: 156,
      comments: 28,
      publishedAt: '1 week ago',
      category: 'Physics',
      coverImage: '⚛️'
    },
    {
      id: '4',
      title: 'Effective Study Techniques for STEM Students',
      excerpt: 'Evidence-based study methods that have helped thousands of students improve their academic performance...',
      author: 'Emma Rodriguez',
      authorAvatar: 'ER',
      role: 'student',
      readTime: '7 min read',
      likes: 312,
      comments: 67,
      publishedAt: '1 week ago',
      category: 'Academic Tips',
      coverImage: '📚'
    },
    {
      id: '5',
      title: 'The Future of AI in Education',
      excerpt: 'How artificial intelligence is revolutionizing the way we learn and teach in academic institutions...',
      author: 'Dr. James Lee',
      authorAvatar: 'JL',
      role: 'faculty',
      readTime: '10 min read',
      likes: 278,
      comments: 52,
      publishedAt: '2 weeks ago',
      category: 'Technology',
      coverImage: '🤖'
    },
    {
      id: '6',
      title: 'Chemical Reactions in Everyday Life',
      excerpt: 'Understanding the chemistry behind common everyday phenomena and why they matter...',
      author: 'Dr. Emily Rodriguez',
      authorAvatar: 'ER',
      role: 'faculty',
      readTime: '6 min read',
      likes: 145,
      comments: 23,
      publishedAt: '3 weeks ago',
      category: 'Chemistry',
      coverImage: '🧪'
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar userRole={userRole} onLogout={onLogout} />
      
      <div className="flex">
        <Sidebar currentPage="blogs" onNavigate={onNavigate} userRole={userRole} />
        
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Academic Blogs
              </h1>
              <p className="text-lg text-gray-600">
                Insights, tutorials, and stories from the community
              </p>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Write Blog
            </motion.button>
          </div>

          {/* Featured Blog */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => onViewBlog(blogs[0].id)}
            className="mb-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden cursor-pointer border border-gray-100 group"
          >
            <div className="md:flex">
              <div className="md:w-1/3 bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center p-12">
                <span className="text-8xl">{blogs[0].coverImage}</span>
              </div>
              <div className="md:w-2/3 p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                    Featured
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {blogs[0].category}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">
                  {blogs[0].title}
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {blogs[0].excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewProfile(blogs[0].id);
                    }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {blogs[0].authorAvatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{blogs[0].author}</p>
                      <p className="text-sm text-gray-500">{blogs[0].publishedAt} • {blogs[0].readTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-gray-500">
                    <span className="flex items-center gap-1">
                      <Heart className="w-5 h-5" />
                      {blogs[0].likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-5 h-5" />
                      {blogs[0].comments}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Blog Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.slice(1).map((blog, index) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                whileHover={{ y: -8 }}
                onClick={() => onViewBlog(blog.id)}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden cursor-pointer border border-gray-100 group"
              >
                <div className="h-40 bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                  <span className="text-6xl">{blog.coverImage}</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {blog.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {blog.readTime}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                    {blog.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewProfile(blog.id);
                      }}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {blog.authorAvatar}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{blog.author}</p>
                        <p className="text-xs text-gray-500">{blog.publishedAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {blog.likes}
                      </span>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-indigo-600 transition-colors"
                      >
                        <BookmarkPlus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
