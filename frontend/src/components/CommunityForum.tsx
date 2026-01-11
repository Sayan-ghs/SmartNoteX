import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { 
  Users, 
  Send, 
  Smile, 
  Paperclip,
  Hash,
  Plus,
  Search
} from 'lucide-react';

interface CommunityForumProps {
  userRole: 'student' | 'faculty' | 'admin' | null;
  onNavigate: (page: any) => void;
  onLogout: () => void;
  onViewProfile: (userId: string) => void;
}

export function CommunityForum({ userRole, onNavigate, onLogout, onViewProfile }: CommunityForumProps) {
  const [selectedCommunity, setSelectedCommunity] = useState('computer-science');
  const [newMessage, setNewMessage] = useState('');

  const communities = [
    { id: 'computer-science', name: 'Computer Science', members: 1234, online: 145, icon: '💻' },
    { id: 'mathematics', name: 'Mathematics', members: 892, online: 67, icon: '📐' },
    { id: 'physics', name: 'Physics', members: 654, online: 45, icon: '⚛️' },
    { id: 'chemistry', name: 'Chemistry', members: 523, online: 34, icon: '🧪' },
    { id: 'general', name: 'General Discussion', members: 2345, online: 234, icon: '💬' },
  ];

  const messages = [
    {
      id: '1',
      user: 'Alex Kumar',
      avatar: 'AK',
      role: 'student',
      message: 'Has anyone finished the Data Structures assignment? I\'m stuck on the binary tree implementation.',
      timestamp: '10:45 AM',
      reactions: { likes: 3, replies: 5 }
    },
    {
      id: '2',
      user: 'Dr. Sarah Wilson',
      avatar: 'SW',
      role: 'faculty',
      message: 'Remember to check the lecture notes from Week 5. The binary tree example there should help!',
      timestamp: '10:48 AM',
      reactions: { likes: 12, replies: 0 }
    },
    {
      id: '3',
      user: 'Emma Chen',
      avatar: 'EC',
      role: 'student',
      message: 'Thanks Dr. Wilson! Also, I found this helpful video tutorial that explains tree traversal really well.',
      timestamp: '10:52 AM',
      reactions: { likes: 8, replies: 2 }
    },
  ];

  const members = [
    { name: 'Alex Kumar', status: 'online', avatar: 'AK', role: 'student' },
    { name: 'Dr. Sarah Wilson', status: 'online', avatar: 'SW', role: 'faculty' },
    { name: 'Emma Chen', status: 'online', avatar: 'EC', role: 'student' },
    { name: 'Michael Lee', status: 'away', avatar: 'ML', role: 'student' },
    { name: 'Prof. David Kim', status: 'offline', avatar: 'DK', role: 'faculty' },
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      // Add message logic
      setNewMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar userRole={userRole} onLogout={onLogout} />
      
      <div className="flex">
        <Sidebar currentPage="forum" onNavigate={onNavigate} userRole={userRole} />
        
        <div className="flex-1 flex h-[calc(100vh-73px)]">
          {/* Left: Community List */}
          <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                <Plus className="w-5 h-5" />
                Create Community
              </button>
            </div>

            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search communities..."
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {communities.map((community) => (
                <motion.button
                  key={community.id}
                  whileHover={{ x: 4 }}
                  onClick={() => setSelectedCommunity(community.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    selectedCommunity === community.id
                      ? 'bg-gradient-to-r from-indigo-50 to-violet-50 shadow-sm'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">{community.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900 text-sm">{community.name}</div>
                    <div className="text-xs text-gray-500">
                      {community.online} online • {community.members} members
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Center: Messages */}
          <div className="flex-1 flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Hash className="w-5 h-5 text-gray-500" />
                    {communities.find(c => c.id === selectedCommunity)?.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Academic discussions and collaboration
                  </p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Users className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div
                    onClick={() => onViewProfile(message.id)}
                    className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:scale-110 transition-transform flex-shrink-0"
                  >
                    {message.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{message.user}</span>
                      {message.role === 'faculty' && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                          Faculty
                        </span>
                      )}
                      <span className="text-xs text-gray-500">{message.timestamp}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-2">{message.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <button className="hover:text-indigo-600 transition-colors">
                        👍 {message.reactions.likes}
                      </button>
                      <button className="hover:text-indigo-600 transition-colors">
                        💬 {message.reactions.replies} replies
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <Paperclip className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    type="button"
                    className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <Smile className="w-5 h-5 text-gray-600" />
                  </button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
              </form>
            </div>
          </div>

          {/* Right: Members */}
          <div className="w-64 bg-white border-l border-gray-200 p-4">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Members ({members.length})
            </h3>
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.name}
                  onClick={() => onViewProfile(member.name)}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {member.avatar}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        member.status === 'online'
                          ? 'bg-green-500'
                          : member.status === 'away'
                          ? 'bg-yellow-500'
                          : 'bg-gray-400'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                    {member.role === 'faculty' && (
                      <p className="text-xs text-green-600">Faculty</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
