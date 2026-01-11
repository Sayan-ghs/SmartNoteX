import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ArrowLeft, Heart, MessageSquare, BookmarkPlus, Share2, Clock } from 'lucide-react';

interface BlogDetailProps {
  blogId: string | null;
  userRole: 'student' | 'faculty' | 'admin' | null;
  onNavigate: (page: any) => void;
  onLogout: () => void;
  onBack: () => void;
  onViewProfile: (userId: string) => void;
}

export function BlogDetail({ blogId, userRole, onNavigate, onLogout, onBack, onViewProfile }: BlogDetailProps) {
  const [liked, setLiked] = useState(false);
  const [newComment, setNewComment] = useState('');

  const blog = {
    id: blogId,
    title: 'Understanding Machine Learning: A Beginner\'s Guide',
    author: 'Dr. Sarah Wilson',
    authorAvatar: 'SW',
    role: 'faculty',
    publishedAt: '2 days ago',
    readTime: '8 min read',
    likes: 234,
    comments: 45,
    category: 'Computer Science',
    content: `
      Machine learning has become one of the most exciting and transformative technologies of our time. 
      From recommending movies to diagnosing diseases, ML algorithms are revolutionizing how we interact 
      with technology and solve complex problems.

      ## What is Machine Learning?

      Machine learning is a subset of artificial intelligence that enables computers to learn and improve 
      from experience without being explicitly programmed. Instead of following rigid instructions, ML 
      algorithms identify patterns in data and make decisions based on those patterns.

      ## Types of Machine Learning

      There are three main types of machine learning:

      ### 1. Supervised Learning
      In supervised learning, the algorithm learns from labeled training data. The model is trained on 
      input-output pairs and learns to predict outputs for new, unseen inputs.

      ### 2. Unsupervised Learning
      Unsupervised learning works with unlabeled data. The algorithm tries to find hidden patterns or 
      structures in the data without explicit guidance.

      ### 3. Reinforcement Learning
      In reinforcement learning, an agent learns to make decisions by performing actions and receiving 
      feedback in the form of rewards or penalties.

      ## Getting Started

      If you're interested in learning machine learning, here are some recommended steps:

      1. Master the fundamentals of Python programming
      2. Learn statistics and linear algebra
      3. Study core ML algorithms
      4. Practice with real-world datasets
      5. Build your own projects

      ## Conclusion

      Machine learning is an incredibly rewarding field to explore. With dedication and the right resources, 
      anyone can start their journey into this exciting domain of computer science.
    `
  };

  const comments = [
    {
      id: '1',
      author: 'Alex Kumar',
      avatar: 'AK',
      role: 'student',
      comment: 'Great introduction! This really helped clarify some concepts I was struggling with.',
      timestamp: '1 day ago',
      likes: 12
    },
    {
      id: '2',
      author: 'Emma Chen',
      avatar: 'EC',
      role: 'student',
      comment: 'Could you recommend some good resources for learning Python for ML?',
      timestamp: '1 day ago',
      likes: 8
    },
  ];

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      // Add comment logic
      setNewComment('');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar userRole={userRole} onLogout={onLogout} />
      
      <div className="flex">
        <Sidebar currentPage="blogs" onNavigate={onNavigate} userRole={userRole} />
        
        <main className="flex-1 p-8">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Blogs</span>
          </button>

          {/* Blog Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium inline-block mb-4">
                {blog.category}
              </span>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {blog.title}
              </h1>
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => onViewProfile(blog.id)}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {blog.authorAvatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{blog.author}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{blog.publishedAt}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {blog.readTime}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setLiked(!liked)}
                    className={`p-3 rounded-xl transition-all ${
                      liked ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl transition-all"
                  >
                    <BookmarkPlus className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
              <div className="prose prose-lg max-w-none">
                {blog.content.split('\n').map((paragraph, index) => {
                  if (paragraph.trim().startsWith('##')) {
                    return (
                      <h2 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                        {paragraph.replace(/##/g, '').trim()}
                      </h2>
                    );
                  } else if (paragraph.trim().startsWith('###')) {
                    return (
                      <h3 key={index} className="text-xl font-bold text-gray-900 mt-6 mb-3">
                        {paragraph.replace(/###/g, '').trim()}
                      </h3>
                    );
                  } else if (paragraph.trim()) {
                    return (
                      <p key={index} className="text-gray-700 leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    );
                  }
                  return null;
                })}
              </div>
            </div>

            {/* Comments */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-indigo-600" />
                Comments ({comments.length})
              </h3>

              {/* Add Comment */}
              <form onSubmit={handleSubmitComment} className="mb-8">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={3}
                />
                <div className="flex justify-end mt-3">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Post Comment
                  </motion.button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div
                      onClick={() => onViewProfile(comment.id)}
                      className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:scale-110 transition-transform flex-shrink-0"
                    >
                      {comment.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">{comment.author}</span>
                        {comment.role === 'faculty' && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                            Faculty
                          </span>
                        )}
                        <span className="text-xs text-gray-500">{comment.timestamp}</span>
                      </div>
                      <p className="text-gray-700 mb-2">{comment.comment}</p>
                      <button className="text-xs text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {comment.likes} likes
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
