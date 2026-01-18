import { useEffect } from 'react';
import { motion } from 'framer-motion';

import { useConversations } from '../../hooks/useMessaging';
import { useAuthStore } from '../../stores/useAuthStore';

interface ChatListProps {
  searchQuery: string;
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
}

const ChatList = ({ searchQuery, selectedConversationId, onSelectConversation }: ChatListProps) => {
  const { user } = useAuthStore();
  const { conversations, loading, error, refetch } = useConversations();

  useEffect(() => {
    if (user?.id) {
      refetch();
    }
  }, [user?.id, refetch]);

  const filteredConversations = conversations.filter(conv => {
    const name = conv.other_user_name || conv.name || 'Unknown';
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
        Error loading conversations: {error.message}
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
        const userName = conversation.other_user_name || conversation.name || 'Unknown User';
        const userInitial = userName[0]?.toUpperCase() || 'U';
        const isSelected = conversation.id === selectedConversationId;
        const hasUnread = (conversation.unread_count || 0) > 0;

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
                {userInitial}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-semibold truncate ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                    {userName}
                  </h3>
                  {conversation.updated_at && (
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {new Date(conversation.updated_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                {conversation.last_message && (
                  <p className={`text-sm truncate ${hasUnread ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                    {conversation.last_message}
                  </p>
                )}

                {hasUnread && conversation.unread_count && (
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
