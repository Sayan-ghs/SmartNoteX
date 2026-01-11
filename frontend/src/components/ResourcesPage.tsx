import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { FileText, Download, ExternalLink, Filter, Upload } from 'lucide-react';
import { UploadModal } from './UploadModal';

interface ResourcesPageProps {
  userRole: 'student' | 'faculty' | 'admin' | null;
  onNavigate: (page: any) => void;
  onLogout: () => void;
  onViewResource: (id: string) => void;
}

export function ResourcesPage({ userRole, onNavigate, onLogout, onViewResource }: ResourcesPageProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const resources = [
    {
      id: '1',
      title: 'Introduction to Machine Learning',
      description: 'Comprehensive guide to ML fundamentals including supervised and unsupervised learning.',
      subject: 'Computer Science',
      uploadedBy: 'Dr. Sarah Wilson',
      type: 'PDF',
      isFaculty: true,
      downloads: 234,
    },
    {
      id: '2',
      title: 'Quantum Physics Lecture Notes',
      description: 'Detailed notes covering quantum mechanics principles and applications.',
      subject: 'Physics',
      uploadedBy: 'Prof. Michael Chen',
      type: 'PDF',
      isFaculty: true,
      downloads: 189,
    },
    {
      id: '3',
      title: 'Database Design Patterns',
      description: 'Best practices and patterns for designing scalable databases.',
      subject: 'Computer Science',
      uploadedBy: 'Alex Kumar',
      type: 'Link',
      isFaculty: false,
      downloads: 156,
    },
    {
      id: '4',
      title: 'Organic Chemistry Study Guide',
      description: 'Complete study material for organic chemistry with practice problems.',
      subject: 'Chemistry',
      uploadedBy: 'Dr. Emily Rodriguez',
      type: 'PDF',
      isFaculty: true,
      downloads: 203,
    },
    {
      id: '5',
      title: 'Linear Algebra Solutions Manual',
      description: 'Worked solutions for common linear algebra problems.',
      subject: 'Mathematics',
      uploadedBy: 'James Park',
      type: 'PDF',
      isFaculty: false,
      downloads: 178,
    },
    {
      id: '6',
      title: 'Web Development Tutorial Series',
      description: 'Step-by-step tutorials for modern web development with React and Node.js.',
      subject: 'Computer Science',
      uploadedBy: 'Prof. David Lee',
      type: 'Link',
      isFaculty: true,
      downloads: 412,
    },
  ];

  const categories = ['all', 'Computer Science', 'Physics', 'Mathematics', 'Chemistry', 'Biology'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={userRole} onLogout={onLogout} />
      
      <div className="flex">
        <Sidebar currentPage="resources" onNavigate={onNavigate} userRole={userRole} />
        
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl text-gray-900 mb-2" style={{ fontWeight: 700 }}>
                Learning Resources
              </h1>
              <p className="text-gray-600">Browse and download academic materials shared by the community</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
              style={{ fontWeight: 600 }}
            >
              <Upload className="w-5 h-5" />
              Upload Resource
            </motion.button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center gap-3 flex-wrap">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600" style={{ fontWeight: 500 }}>
                Filter by:
              </span>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    selectedCategory === category
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{ fontWeight: 500 }}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Resources Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all overflow-hidden cursor-pointer"
                onClick={() => onViewResource(resource.id)}
              >
                {/* Card Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {resource.type}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg text-gray-900 mb-2" style={{ fontWeight: 600 }}>
                    {resource.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {resource.description}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {resource.subject}
                    </span>
                    {resource.isFaculty && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded flex items-center gap-1">
                        Faculty Verified
                      </span>
                    )}
                  </div>

                  {/* Author */}
                  <p className="text-xs text-gray-500 mb-4">
                    Uploaded by <span style={{ fontWeight: 500 }}>{resource.uploadedBy}</span>
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle download
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                      style={{ fontWeight: 500 }}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewResource(resource.id);
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Download count */}
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    {resource.downloads} downloads
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </main>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal onClose={() => setShowUploadModal(false)} />
      )}
    </div>
  );
}
