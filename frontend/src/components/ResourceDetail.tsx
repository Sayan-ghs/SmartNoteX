import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ArrowLeft, Download, FileText, MessageSquare, Send } from 'lucide-react';

interface ResourceDetailProps {
  resourceId: string | null;
  userRole: 'student' | 'faculty' | 'admin' | null;
  onNavigate: (page: any) => void;
  onLogout: () => void;
  onBack: () => void;
}

export function ResourceDetail({ resourceId, userRole, onNavigate, onLogout, onBack }: ResourceDetailProps) {
  const [newComment, setNewComment] = useState('');

  const resource = {
    id: resourceId,
    title: 'Introduction to Machine Learning',
    description: 'Comprehensive guide to ML fundamentals including supervised and unsupervised learning. This resource covers essential concepts, algorithms, and practical applications of machine learning in modern software development.',
    subject: 'Computer Science',
    uploadedBy: 'Dr. Sarah Wilson',
    uploadedDate: 'January 5, 2026',
    type: 'PDF',
    size: '4.2 MB',
    isFaculty: true,
    downloads: 234,
  };

  const comments = [
    {
      id: '1',
      author: 'Alex Kumar',
      role: 'student',
      content: 'This is an excellent resource! Very clear explanations of complex concepts.',
      timestamp: '2 hours ago',
      avatar: 'AK',
    },
    {
      id: '2',
      author: 'Prof. Michael Chen',
      role: 'faculty',
      content: 'Great supplementary material. I recommend all my students review this.',
      timestamp: '5 hours ago',
      avatar: 'MC',
    },
    {
      id: '3',
      author: 'Emma Wilson',
      role: 'student',
      content: 'Thanks for sharing! The examples are really helpful for understanding the theory.',
      timestamp: '1 day ago',
      avatar: 'EW',
    },
  ];

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      // Add comment logic here
      setNewComment('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={userRole} onLogout={onLogout} />
      
      <div className="flex">
        <Sidebar currentPage="resources" onNavigate={onNavigate} userRole={userRole} />
        
        <main className="flex-1 p-8">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span style={{ fontWeight: 500 }}>Back to Resources</span>
          </button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Resource Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Main Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-8">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs px-2 py-1 bg-white/20 text-white rounded backdrop-blur-sm">
                          {resource.type}
                        </span>
                        <span className="text-xs px-2 py-1 bg-white/20 text-white rounded backdrop-blur-sm">
                          {resource.subject}
                        </span>
                        {resource.isFaculty && (
                          <span className="text-xs px-2 py-1 bg-green-500/30 text-white rounded backdrop-blur-sm">
                            Faculty Verified
                          </span>
                        )}
                      </div>
                      <h1 className="text-3xl text-white mb-2" style={{ fontWeight: 700 }}>
                        {resource.title}
                      </h1>
                      <p className="text-indigo-100 text-sm">
                        Uploaded by <span style={{ fontWeight: 500 }}>{resource.uploadedBy}</span> • {resource.uploadedDate}
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <h2 className="text-xl text-gray-900 mb-3" style={{ fontWeight: 600 }}>
                    Description
                  </h2>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {resource.description}
                  </p>

                  <div className="flex items-center gap-4 py-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Download className="w-4 h-4" />
                      <span>{resource.downloads} downloads</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span>{resource.size}</span>
                    </div>
                  </div>

                  {/* Download Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg mt-6"
                    style={{ fontWeight: 600 }}
                  >
                    <Download className="w-5 h-5" />
                    Download Resource
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* Right: Discussion Panel */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-24"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl text-gray-900 flex items-center gap-2" style={{ fontWeight: 600 }}>
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                    Discussion
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">{comments.length} comments</p>
                </div>

                {/* Comments */}
                <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                  {comments.map((comment, index) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0" style={{ fontWeight: 600 }}>
                          {comment.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-gray-900" style={{ fontWeight: 600 }}>
                              {comment.author}
                            </span>
                            {comment.role === 'faculty' && (
                              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                                Faculty
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {comment.content}
                          </p>
                          <span className="text-xs text-gray-500">{comment.timestamp}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Add Comment */}
                <div className="p-6 border-t border-gray-100">
                  <form onSubmit={handleSubmitComment} className="space-y-3">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-sm"
                      rows={3}
                      placeholder="Add a comment..."
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ fontWeight: 500 }}
                    >
                      <Send className="w-4 h-4" />
                      Post Comment
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
