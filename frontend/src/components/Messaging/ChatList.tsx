import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Clock } from 'lucide-react';
import { useConversations } from '../../hooks/useMessaging';
import { useAuthStore } from '../../stores/useAuthStore';

interface ChatListProps {
  searchQuery: string;
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

const ChatList = ({ searchQuery, selectedConversationId, onSelectConversation }: ChatListProps) => {
  const { user } = useAuthStore();
  const { conversations, loading, error, fetchConversations } = useConversations(user?.id || '');

  useEffect(() => {
    if (user?.id) {
      fetchConversations();
    }
  }, [user?.id]);

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = conv.participants.find(p => p.id !== user?.id);
    const name = otherParticipant?.username || otherParticipant?.email || 'Unknown';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        Error loading conversations: {error}
      </div>
    );
  }

  if (filteredConversations.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        {searchQuery ? 'No conversations found' : 'No conversations yet'}
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {filteredConversations.map((conversation, index) => {
        const otherParticipant = conversation.participants.find(p => p.id !== user?.id);
        const isSelected = conversation.id === selectedConversationId;
        const hasUnread = conversation.unread_count > 0;

        return (
          <motion.div
            key={conversation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectConversation(conversation.id)}
            className={`p-4 cursor-pointer transition-colors ${
              isSelected ? 'bg-indigo-50' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {otherParticipant?.username?.[0]?.toUpperCase() || <User className="w-6 h-6" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-semibold truncate ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                    {otherParticipant?.username || otherParticipant?.email || 'Unknown User'}
                  </h3>
                  {conversation.last_message_at && (
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {new Date(conversation.last_message_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                {conversation.last_message && (
                  <p className={`text-sm truncate ${hasUnread ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                    {conversation.last_message}
                  </p>
                )}

                {hasUnread && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-600 text-white">
                      {conversation.unread_count} new
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ChatList;
