import { Search, Bell, User, LogOut, Sparkles, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

interface NavbarProps {
  userRole: 'student' | 'faculty' | 'admin' | null;
  userName?: string;
  onLogout: () => void;
}

export function Navbar({ userRole, userName = 'John Doe', onLogout }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/20">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Smart NoteX
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes, discussions, blogs..."
              className="w-full pl-12 pr-4 py-2.5 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2.5 hover:bg-white/50 rounded-xl transition-all"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </motion.button>

          {/* Messages */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2.5 hover:bg-white/50 rounded-xl transition-all"
          >
            <MessageSquare className="w-5 h-5 text-gray-600" />
          </motion.button>

          {/* Profile Menu */}
          <div className="flex items-center gap-3 pl-3 ml-3 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {userName}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {userRole}
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
              {userName.split(' ').map(n => n[0]).join('')}
            </div>
          </div>

          {/* Logout */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="p-2.5 hover:bg-red-50 rounded-xl transition-all group"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600" />
          </motion.button>
        </div>
      </div>
    </nav>
  );
}
