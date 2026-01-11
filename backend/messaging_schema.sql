-- ============================================================================
-- SMART NOTEX - MESSAGING & COMMUNITY CHAT SYSTEM
-- ============================================================================
-- Complete database schema with Row Level Security (RLS)
-- Supports: 1-1 Direct Chat + Community Group Chat + Real-time updates
-- ============================================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. CONVERSATIONS TABLE (Direct & Group Chats)
-- ============================================================================
-- Stores conversation metadata (both 1-1 and group conversations)

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    is_group BOOLEAN NOT NULL DEFAULT false,
    name TEXT,  -- Optional: for group conversations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_conversations_updated_at ON public.conversations(updated_at DESC);
CREATE INDEX idx_conversations_is_group ON public.conversations(is_group);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view conversations they are members of
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
CREATE POLICY "Users can view their conversations"
    ON public.conversations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversation_members
            WHERE conversation_members.conversation_id = conversations.id
            AND conversation_members.user_id = (auth.uid())::uuid
        )
    );

-- RLS Policy: Users can update conversations they are members of (e.g., mark as read)
DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;
CREATE POLICY "Users can update their conversations"
    ON public.conversations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.conversation_members
            WHERE conversation_members.conversation_id = conversations.id
            AND conversation_members.user_id = (auth.uid())::uuid
        )
    );

-- ============================================================================
-- 2. CONVERSATION_MEMBERS TABLE (Junction Table)
-- ============================================================================
-- Links users to conversations (supports both 1-1 and group chats)

CREATE TABLE IF NOT EXISTS public.conversation_members (
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE,
    is_admin BOOLEAN DEFAULT false,  -- For group chats
    PRIMARY KEY (conversation_id, user_id)
);

-- Indexes
CREATE INDEX idx_conversation_members_user_id ON public.conversation_members(user_id);
CREATE INDEX idx_conversation_members_conversation_id ON public.conversation_members(conversation_id);

-- Enable RLS
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view members of conversations they belong to
DROP POLICY IF EXISTS "Users can view conversation members" ON public.conversation_members;
CREATE POLICY "Users can view conversation members"
    ON public.conversation_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversation_members cm
            WHERE cm.conversation_id = conversation_members.conversation_id
            AND cm.user_id = (auth.uid())::uuid
        )
    );

-- RLS Policy: Users can join conversations (INSERT themselves)
DROP POLICY IF EXISTS "Users can join conversations" ON public.conversation_members;
CREATE POLICY "Users can join conversations"
    ON public.conversation_members FOR INSERT
    WITH CHECK (user_id = (auth.uid())::uuid);

-- RLS Policy: Users can leave conversations (DELETE themselves)
DROP POLICY IF EXISTS "Users can leave conversations" ON public.conversation_members;
CREATE POLICY "Users can leave conversations"
    ON public.conversation_members FOR DELETE
    USING (user_id = (auth.uid())::uuid);

-- ============================================================================
-- 3. MESSAGES TABLE (Conversation Messages)
-- ============================================================================
-- Stores all messages for conversations (1-1 and group)

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 5000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT false,
    is_edited BOOLEAN DEFAULT false
);

-- Indexes for performance
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view messages in conversations they are members of
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
CREATE POLICY "Users can view messages in their conversations"
    ON public.messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversation_members
            WHERE conversation_members.conversation_id = messages.conversation_id
            AND conversation_members.user_id = (auth.uid())::uuid
        )
    );

-- RLS Policy: Users can send messages to conversations they are members of
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;
CREATE POLICY "Users can send messages to their conversations"
    ON public.messages FOR INSERT
    WITH CHECK (
        sender_id = (auth.uid())::uuid
        AND EXISTS (
            SELECT 1 FROM public.conversation_members
            WHERE conversation_members.conversation_id = messages.conversation_id
            AND conversation_members.user_id = (auth.uid())::uuid
        )
    );

-- RLS Policy: Users can update their own messages
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
CREATE POLICY "Users can update their own messages"
    ON public.messages FOR UPDATE
    USING (sender_id = (auth.uid())::uuid);

-- RLS Policy: Users can delete their own messages
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;
CREATE POLICY "Users can delete their own messages"
    ON public.messages FOR DELETE
    USING (sender_id = (auth.uid())::uuid);

-- ============================================================================
-- 4. COMMUNITIES TABLE (Academic Communities/Groups)
-- ============================================================================
-- Stores community metadata (academic groups, study groups, etc.)

CREATE TABLE IF NOT EXISTS public.communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL CHECK (char_length(name) >= 3 AND char_length(name) <= 100),
    description TEXT,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    is_private BOOLEAN DEFAULT false,
    avatar_url TEXT,
    subject TEXT,  -- Academic subject (e.g., "Computer Science", "Mathematics")
    member_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_communities_is_private ON public.communities(is_private);
CREATE INDEX idx_communities_subject ON public.communities(subject);
CREATE INDEX idx_communities_created_by ON public.communities(created_by);
CREATE INDEX idx_communities_name ON public.communities(name);

-- Enable RLS
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Everyone can view public communities
DROP POLICY IF EXISTS "Anyone can view public communities" ON public.communities;
CREATE POLICY "Anyone can view public communities"
    ON public.communities FOR SELECT
    USING (is_private = false OR created_by = (auth.uid())::uuid);

-- RLS Policy: Members can view private communities they belong to
DROP POLICY IF EXISTS "Members can view their private communities" ON public.communities;
CREATE POLICY "Members can view their private communities"
    ON public.communities FOR SELECT
    USING (
        is_private = false
        OR created_by = (auth.uid())::uuid
        OR EXISTS (
            SELECT 1 FROM public.community_members
            WHERE community_members.community_id = communities.id
            AND community_members.user_id = (auth.uid())::uuid
        )
    );

-- RLS Policy: Authenticated users can create communities
DROP POLICY IF EXISTS "Authenticated users can create communities" ON public.communities;
CREATE POLICY "Authenticated users can create communities"
    ON public.communities FOR INSERT
    WITH CHECK (created_by = (auth.uid())::uuid);

-- RLS Policy: Community creators and admins can update communities
DROP POLICY IF EXISTS "Community admins can update communities" ON public.communities;
CREATE POLICY "Community admins can update communities"
    ON public.communities FOR UPDATE
    USING (
        created_by = (auth.uid())::uuid
        OR EXISTS (
            SELECT 1 FROM public.community_members
            WHERE community_members.community_id = communities.id
            AND community_members.user_id = (auth.uid())::uuid
            AND community_members.role = 'admin'
        )
    );

-- RLS Policy: Community creators can delete communities
DROP POLICY IF EXISTS "Community creators can delete communities" ON public.communities;
CREATE POLICY "Community creators can delete communities"
    ON public.communities FOR DELETE
    USING (created_by = (auth.uid())::uuid);

-- ============================================================================
-- 5. COMMUNITY_MEMBERS TABLE (Junction Table)
-- ============================================================================
-- Links users to communities with roles

CREATE TABLE IF NOT EXISTS public.community_members (
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (community_id, user_id)
);

-- Indexes
CREATE INDEX idx_community_members_user_id ON public.community_members(user_id);
CREATE INDEX idx_community_members_community_id ON public.community_members(community_id);
CREATE INDEX idx_community_members_role ON public.community_members(role);

-- Enable RLS
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Members can view other members in their communities
DROP POLICY IF EXISTS "Users can view community members" ON public.community_members;
CREATE POLICY "Users can view community members"
    ON public.community_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.community_members cm
            WHERE cm.community_id = community_members.community_id
            AND cm.user_id = (auth.uid())::uuid
        )
        OR EXISTS (
            SELECT 1 FROM public.communities
            WHERE communities.id = community_members.community_id
            AND communities.is_private = false
        )
    );

-- RLS Policy: Users can join public communities
DROP POLICY IF EXISTS "Users can join public communities" ON public.community_members;
CREATE POLICY "Users can join public communities"
    ON public.community_members FOR INSERT
    WITH CHECK (
        user_id = (auth.uid())::uuid
        AND EXISTS (
            SELECT 1 FROM public.communities
            WHERE communities.id = community_members.community_id
            AND communities.is_private = false
        )
    );

-- RLS Policy: Admins can add members to communities
DROP POLICY IF EXISTS "Admins can add members" ON public.community_members;
CREATE POLICY "Admins can add members"
    ON public.community_members FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.community_members cm
            WHERE cm.community_id = community_members.community_id
            AND cm.user_id = (auth.uid())::uuid
            AND cm.role IN ('admin', 'moderator')
        )
        OR EXISTS (
            SELECT 1 FROM public.communities
            WHERE communities.id = community_members.community_id
            AND communities.created_by = (auth.uid())::uuid
        )
    );

-- RLS Policy: Users can leave communities (delete themselves)
DROP POLICY IF EXISTS "Users can leave communities" ON public.community_members;
CREATE POLICY "Users can leave communities"
    ON public.community_members FOR DELETE
    USING (user_id = (auth.uid())::uuid);

-- RLS Policy: Admins can remove members
DROP POLICY IF EXISTS "Admins can remove members" ON public.community_members;
CREATE POLICY "Admins can remove members"
    ON public.community_members FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.community_members cm
            WHERE cm.community_id = community_members.community_id
            AND cm.user_id = (auth.uid())::uuid
            AND cm.role IN ('admin', 'moderator')
        )
        OR EXISTS (
            SELECT 1 FROM public.communities
            WHERE communities.id = community_members.community_id
            AND communities.created_by = (auth.uid())::uuid
        )
    );

-- ============================================================================
-- 6. COMMUNITY_MESSAGES TABLE (Community Chat Messages)
-- ============================================================================
-- Stores all messages in community chats

CREATE TABLE IF NOT EXISTS public.community_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 5000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT false,
    is_edited BOOLEAN DEFAULT false,
    reply_to_id UUID REFERENCES public.community_messages(id) ON DELETE SET NULL  -- For threading
);

-- Indexes
CREATE INDEX idx_community_messages_community_id ON public.community_messages(community_id, created_at DESC);
CREATE INDEX idx_community_messages_sender_id ON public.community_messages(sender_id);
CREATE INDEX idx_community_messages_created_at ON public.community_messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Members can view messages in their communities
DROP POLICY IF EXISTS "Members can view community messages" ON public.community_messages;
CREATE POLICY "Members can view community messages"
    ON public.community_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.community_members
            WHERE community_members.community_id = community_messages.community_id
            AND community_members.user_id = (auth.uid())::uuid
        )
    );

-- RLS Policy: Members can send messages to their communities
DROP POLICY IF EXISTS "Members can send community messages" ON public.community_messages;
CREATE POLICY "Members can send community messages"
    ON public.community_messages FOR INSERT
    WITH CHECK (
        sender_id = (auth.uid())::uuid
        AND EXISTS (
            SELECT 1 FROM public.community_members
            WHERE community_members.community_id = community_messages.community_id
            AND community_members.user_id = (auth.uid())::uuid
        )
    );

-- RLS Policy: Users can update their own messages
DROP POLICY IF EXISTS "Users can update their own community messages" ON public.community_messages;
CREATE POLICY "Users can update their own community messages"
    ON public.community_messages FOR UPDATE
    USING (sender_id = (auth.uid())::uuid);

-- RLS Policy: Users can delete their own messages, or admins can delete any message
DROP POLICY IF EXISTS "Users and admins can delete community messages" ON public.community_messages;
CREATE POLICY "Users and admins can delete community messages"
    ON public.community_messages FOR DELETE
    USING (
        sender_id = (auth.uid())::uuid
        OR EXISTS (
            SELECT 1 FROM public.community_members
            WHERE community_members.community_id = community_messages.community_id
            AND community_members.user_id = (auth.uid())::uuid
            AND community_members.role IN ('admin', 'moderator')
        )
    );

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_messages_updated_at ON public.messages;
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_communities_updated_at ON public.communities;
CREATE TRIGGER update_communities_updated_at
    BEFORE UPDATE ON public.communities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_community_messages_updated_at ON public.community_messages;
CREATE TRIGGER update_community_messages_updated_at
    BEFORE UPDATE ON public.community_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Update conversation's last_message_at when a new message is sent
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON public.messages;
CREATE TRIGGER trigger_update_conversation_last_message
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Function: Update community member count
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.communities
        SET member_count = member_count + 1
        WHERE id = NEW.community_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.communities
        SET member_count = GREATEST(member_count - 1, 0)
        WHERE id = OLD.community_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_community_member_count ON public.community_members;
CREATE TRIGGER trigger_update_community_member_count
    AFTER INSERT OR DELETE ON public.community_members
    FOR EACH ROW EXECUTE FUNCTION update_community_member_count();

-- Function: Get or create direct conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_conversation(user1_id UUID, user2_id UUID)
RETURNS UUID AS $$
DECLARE
    conversation_id UUID;
BEGIN
    -- Check if conversation already exists
    SELECT cm1.conversation_id INTO conversation_id
    FROM public.conversation_members cm1
    JOIN public.conversation_members cm2 ON cm1.conversation_id = cm2.conversation_id
    JOIN public.conversations c ON c.id = cm1.conversation_id
    WHERE cm1.user_id = user1_id
      AND cm2.user_id = user2_id
      AND c.is_group = false
    LIMIT 1;
    
    -- If not found, create new conversation
    IF conversation_id IS NULL THEN
        INSERT INTO public.conversations (is_group)
        VALUES (false)
        RETURNING id INTO conversation_id;
        
        -- Add both users as members
        INSERT INTO public.conversation_members (conversation_id, user_id)
        VALUES (conversation_id, user1_id), (conversation_id, user2_id);
    END IF;
    
    RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- REALTIME CONFIGURATION
-- ============================================================================

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- ============================================================================
-- UTILITY VIEWS (Optional but useful)
-- ============================================================================

-- View: Conversation with last message and unread count
CREATE OR REPLACE VIEW conversation_list AS
SELECT
    c.id,
    c.is_group,
    c.name,
    c.last_message_at,
    c.created_at,
    -- Last message preview
    (SELECT content FROM public.messages m
     WHERE m.conversation_id = c.id
     ORDER BY m.created_at DESC
     LIMIT 1) AS last_message,
    -- Unread count per user (placeholder - implement based on last_read_at)
    (SELECT COUNT(*)
     FROM public.messages m
     WHERE m.conversation_id = c.id
     AND m.created_at > COALESCE(
         (SELECT last_read_at FROM public.conversation_members cm
          WHERE cm.conversation_id = c.id AND cm.user_id = auth.uid()),
         '1970-01-01'::timestamp
     )) AS unread_count,
    -- Other participant (for direct chats)
    (SELECT u.full_name
     FROM public.conversation_members cm
     JOIN public.users u ON u.id = cm.user_id
     WHERE cm.conversation_id = c.id
     AND cm.user_id != auth.uid()
     LIMIT 1) AS other_user_name
FROM public.conversations c
WHERE EXISTS (
    SELECT 1 FROM public.conversation_members cm
    WHERE cm.conversation_id = c.id
    AND cm.user_id = auth.uid()
);

-- ============================================================================
-- SAMPLE DATA (For Testing)
-- ============================================================================

-- Uncomment to insert sample communities
/*
INSERT INTO public.communities (name, description, created_by, is_private, subject)
VALUES
    ('Computer Science Study Group', 'Collaborative learning for CS students', (SELECT id FROM public.users LIMIT 1), false, 'Computer Science'),
    ('Mathematics Enthusiasts', 'Advanced mathematics discussion', (SELECT id FROM public.users LIMIT 1), false, 'Mathematics'),
    ('Research Collaboration', 'Private research group', (SELECT id FROM public.users LIMIT 1), true, 'Research');
*/

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================

-- Verification queries:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE '%message%' OR tablename LIKE '%conversation%' OR tablename LIKE '%communit%';
-- SELECT * FROM pg_policies WHERE schemaname = 'public';
