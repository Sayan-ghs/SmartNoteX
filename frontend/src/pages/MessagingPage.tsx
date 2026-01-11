import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Search, Plus } from 'lucide-react';
import ChatList from '../components/Messaging/ChatList';
import ChatWindow from '../components/Messaging/ChatWindow';
import CommunityList from '../components/Messaging/CommunityList';
import CommunityChat from '../components/Messaging/CommunityChat';

type Tab = 'direct' | 'community';

const MessagingPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>('direct');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>
          
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('direct')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'direct'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Direct</span>
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'community'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Communities</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={activeTab === 'direct' ? 'Search conversations...' : 'Search communities...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* New Chat/Community Button */}
          <button
            onClick={() => setShowNewChat(true)}
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{activeTab === 'direct' ? 'New Chat' : 'New Community'}</span>
          </button>
        </div>

        {/* Chat/Community List */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'direct' ? (
            <ChatList
              searchQuery={searchQuery}
              selectedConversationId={selectedConversationId}
              onSelectConversation={setSelectedConversationId}
            />
          ) : (
            <CommunityList
              searchQuery={searchQuery}
              selectedCommunityId={selectedCommunityId}
              onSelectCommunity={setSelectedCommunityId}
            />
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeTab === 'direct' ? (
          selectedConversationId ? (
            <ChatWindow conversationId={selectedConversationId} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2">No conversation selected</h3>
                <p>Choose a conversation from the list or start a new one</p>
              </div>
            </div>
          )
        ) : selectedCommunityId ? (
          <CommunityChat communityId={selectedCommunityId} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">No community selected</h3>
              <p>Choose a community from the list or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingPage;
