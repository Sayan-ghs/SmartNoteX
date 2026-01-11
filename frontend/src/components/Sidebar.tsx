import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookOpen, 
  Upload, 
  MessageSquare, 
  Shield,
  FileText,
  Brain,
  User,
  Mail
} from 'lucide-react';

type Page = 'dashboard' | 'resources' | 'upload' | 'forum' | 'blogs' | 'profile' | 'ai-assistant' | 'admin' | 'messages';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: any) => void;
  userRole: 'student' | 'faculty' | 'admin' | null;
}

export function Sidebar({ currentPage, onNavigate, userRole }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard, showFor: ['student', 'faculty', 'admin'] },
    { id: 'resources' as Page, label: 'Resources', icon: BookOpen, showFor: ['student', 'faculty', 'admin'] },
    { id: 'messages' as Page, label: 'Messages', icon: Mail, showFor: ['student', 'faculty', 'admin'] },
    { id: 'forum' as Page, label: 'Community', icon: MessageSquare, showFor: ['student', 'faculty', 'admin'] },
    { id: 'blogs' as Page, label: 'Blogs', icon: FileText, showFor: ['student', 'faculty', 'admin'] },
    { id: 'ai-assistant' as Page, label: 'AI Assistant', icon: Brain, showFor: ['student', 'faculty', 'admin'] },
    { id: 'profile' as Page, label: 'Profile', icon: User, showFor: ['student', 'faculty', 'admin'] },
    { id: 'admin' as Page, label: 'Admin', icon: Shield, showFor: ['admin'] },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <nav className="space-y-1">
        {menuItems.map((item) => {
          if (!item.showFor.includes(userRole || '')) return null;
          
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`} />
              <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="mt-8 p-4 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl border border-indigo-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full text-left text-sm text-gray-700 hover:text-indigo-600 transition-colors flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Note
          </button>
          <button className="w-full text-left text-sm text-gray-700 hover:text-indigo-600 transition-colors flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Write Blog
          </button>
        </div>
      </div>
    </aside>
  );
}
