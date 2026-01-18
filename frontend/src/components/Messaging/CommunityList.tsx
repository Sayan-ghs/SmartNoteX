import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Lock, Globe } from 'lucide-react';
import { useCommunities } from '../../hooks/useMessaging';
import { useAuthStore } from '../../stores/useAuthStore';

interface CommunityListProps {
  searchQuery: string;
  selectedCommunityId: string | null;
  onSelectCommunity: (id: string) => void;
}

const CommunityList = ({ searchQuery, selectedCommunityId, onSelectCommunity }: CommunityListProps) => {
  const { user } = useAuthStore();
  const { communities, loading, error, refetch } = useCommunities();

  useEffect(() => {
    if (user?.id) {
      refetch();
    }
  }, [user?.id, refetch]);

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        Error loading communities: {error.message}
      </div>
    );
  }

  if (filteredCommunities.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        {searchQuery ? 'No communities found' : 'No communities yet'}
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {filteredCommunities.map((community, index) => {
        const isSelected = community.id === selectedCommunityId;
        const hasUnread = (community.unread_count || 0) > 0;
        const isPrivate = !community.is_public;

        return (
          <motion.div
            key={community.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectCommunity(community.id)}
            className={`p-4 cursor-pointer transition-colors ${
              isSelected ? 'bg-indigo-50' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white flex-shrink-0">
                <Users className="w-6 h-6" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-semibold truncate ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                    {community.name}
                  </h3>
                  {isPrivate ? (
                    <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                </div>

                {community.description && (
                  <p className="text-sm text-gray-600 truncate mb-2">
                    {community.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {community.member_count} member{community.member_count !== 1 ? 's' : ''}
                  </span>
                  {hasUnread && community.unread_count && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-600 text-white">
                      {community.unread_count} new
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default CommunityList;
