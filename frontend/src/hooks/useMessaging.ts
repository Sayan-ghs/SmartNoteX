import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Types
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommunityMessage {
  id: string;
  community_id: string;
  sender_id: string;
  content: string;
  reply_to_id: string | null;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  other_user_name?: string;
  last_message?: string;
  unread_count?: number;
}

export interface Community {
  id: string;
  name: string;
  description: string | null;
  subject: string | null;
  is_public: boolean;
  created_by: string;
  member_count: number;
  created_at: string;
  updated_at: string;
  is_member?: boolean;
}

// Hook: useMessages - Subscribe to real-time messages for a conversation
export const useMessages = (conversationId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    fetchMessages();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id ? (payload.new as Message) : msg
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, fetchMessages]);

  return { messages, loading, error, refetch: fetchMessages };
};

// Hook: useCommunityMessages - Subscribe to real-time community messages
export const useCommunityMessages = (communityId: string) => {
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_messages')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch community messages:', err);
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    if (!communityId) return;

    fetchMessages();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`community_messages:${communityId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `community_id=eq.${communityId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as CommunityMessage]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'community_messages',
          filter: `community_id=eq.${communityId}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id ? (payload.new as CommunityMessage) : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [communityId, fetchMessages]);

  return { messages, loading, error, refetch: fetchMessages };
};

// Hook: useConversations - Get user's conversations
export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      // Get conversations where user is a member
      const { data, error } = await supabase
        .from('conversation_members')
        .select('conversation_id, conversations(*)')
        .eq('user_id', user.id);

      if (error) throw error;

      const formattedConversations = data?.map((item: any) => item.conversations) || [];
      setConversations(formattedConversations);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return { conversations, loading, error, refetch: fetchConversations };
};

// Hook: useCommunities - Get user's communities
export const useCommunities = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCommunities = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      // Get all public communities and communities where user is a member
      const { data, error } = await supabase
        .from('communities')
        .select('*, community_members!inner(user_id)')
        .or(`is_public.eq.true,community_members.user_id.eq.${user?.id}`);

      if (error) throw error;

      // Check membership for each community
      const communitiesWithMembership = await Promise.all(
        (data || []).map(async (community: any) => {
          if (!user) return { ...community, is_member: false };

          const { data: membership } = await supabase
            .from('community_members')
            .select('id')
            .eq('community_id', community.id)
            .eq('user_id', user.id)
            .single();

          return { ...community, is_member: !!membership };
        })
      );

      setCommunities(communitiesWithMembership);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch communities:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  return { communities, loading, error, refetch: fetchCommunities };
};

// Helper: createOrGetConversation
export const createOrGetConversation = async (otherUserId: string): Promise<string> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Call the get_or_create_conversation function
    const { data, error } = await supabase.rpc('get_or_create_conversation', {
      p_user_id1: user.id,
      p_user_id2: otherUserId,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to create/get conversation:', error);
    throw error;
  }
};

// Helper: sendMessage
export const sendMessage = async (conversationId: string, content: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
};

// Helper: sendCommunityMessage
export const sendCommunityMessage = async (
  communityId: string,
  content: string,
  replyToId?: string
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.from('community_messages').insert({
      community_id: communityId,
      sender_id: user.id,
      content,
      reply_to_id: replyToId || null,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to send community message:', error);
    throw error;
  }
};

// Helper: joinCommunity
export const joinCommunity = async (communityId: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.from('community_members').insert({
      community_id: communityId,
      user_id: user.id,
      role: 'member',
    });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to join community:', error);
    throw error;
  }
};

// Helper: leaveCommunity
export const leaveCommunity = async (communityId: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to leave community:', error);
    throw error;
  }
};
