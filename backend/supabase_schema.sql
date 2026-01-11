-- ============================================================================
-- Smart NoteX - Academic Collaboration & Learning Platform
-- Supabase PostgreSQL Schema with Row Level Security
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- DROP EXISTING POLICIES (Safe - policies can be recreated)
-- ============================================================================

DO $$ 
DECLARE
    drop_policies TEXT;
BEGIN
    -- Drop all existing policies on all tables
    SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON ' || schemaname || '.' || quote_ident(tablename) || ';', E'\n')
    INTO drop_policies
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    -- Only execute if there are policies to drop
    IF drop_policies IS NOT NULL THEN
        EXECUTE drop_policies;
    END IF;
END $$;

-- ============================================================================
-- DROP EXISTING TABLES (CAREFUL: This will delete all data!)
-- ============================================================================

-- Uncomment the following lines to drop all tables and start fresh:
/*
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.resource_likes CASCADE;
DROP TABLE IF EXISTS public.ai_summaries CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.resources CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP VIEW IF EXISTS public.resource_stats CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
*/

-- ============================================================================
-- 1. USERS PROFILE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'faculty', 'student')),
    department TEXT,
    avatar_url TEXT,
    bio TEXT,
    public_code TEXT UNIQUE NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
CREATE POLICY "Users can view all profiles"
    ON public.users FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING ((auth.uid())::uuid = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

CREATE POLICY "Users can insert own profile"
    ON public.users FOR INSERT
    WITH CHECK ((auth.uid())::uuid = id);

-- ============================================================================
-- 2. RESOURCES TABLE (Notes / PDFs / Links)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('pdf', 'note', 'link', 'video', 'document')),
    subject TEXT,
    tags TEXT[],
    uploaded_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
    is_approved BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_resources_uploaded_by ON public.resources(uploaded_by);
CREATE INDEX idx_resources_subject ON public.resources(subject);
CREATE INDEX idx_resources_is_approved ON public.resources(is_approved);
CREATE INDEX idx_resources_resource_type ON public.resources(resource_type);
CREATE INDEX idx_resources_visibility ON public.resources(visibility);
CREATE INDEX idx_users_public_code ON public.users(public_code);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for resources table
CREATE POLICY "Anyone can view approved resources"
    ON public.resources FOR SELECT
    USING (is_approved = true);

CREATE POLICY "Anyone can view public approved resources"
    ON public.resources FOR SELECT
    USING (is_approved = true AND visibility = 'public');

CREATE POLICY "Users can view their own resources"
    ON public.resources FOR SELECT
    USING ((auth.uid())::uuid = uploaded_by);

CREATE POLICY "Admins can view all resources"
    ON public.resources FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = (auth.uid())::uuid AND users.role = 'admin'
        )
    );

CREATE POLICY "Authenticated users can upload resources"
    ON public.resources FOR INSERT
    WITH CHECK (
        (auth.uid())::uuid = uploaded_by AND
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = (auth.uid())::uuid AND users.role IN ('faculty', 'student', 'admin')
        )
    );

CREATE POLICY "Users can update own resources"
    ON public.resources FOR UPDATE
    USING ((auth.uid())::uuid = uploaded_by);

CREATE POLICY "Admins can update any resource"
    ON public.resources FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = (auth.uid())::uuid AND users.role = 'admin'
        )
    );

CREATE POLICY "Users can delete own resources"
    ON public.resources FOR DELETE
    USING ((auth.uid())::uuid = uploaded_by);

CREATE POLICY "Admins can delete any resource"
    ON public.resources FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = (auth.uid())::uuid AND users.role = 'admin'
        )
    );

-- ============================================================================
-- 3. COMMENTS TABLE (Discussion System)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 2000),
    parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    is_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_comments_resource_id ON public.comments(resource_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_comments_parent_id ON public.comments(parent_comment_id);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comments table
CREATE POLICY "Anyone can view comments on approved resources"
    ON public.comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.resources
            WHERE resources.id = comments.resource_id AND resources.is_approved = true
        )
    );

CREATE POLICY "Users can view comments on own resources"
    ON public.comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.resources
            WHERE resources.id = comments.resource_id AND resources.uploaded_by = (auth.uid())::uuid
        )
    );

CREATE POLICY "Authenticated users can create comments"
    ON public.comments FOR INSERT
    WITH CHECK (
        (auth.uid())::uuid = user_id AND
        EXISTS (
            SELECT 1 FROM public.resources
            WHERE resources.id = comments.resource_id AND resources.is_approved = true
        )
    );

CREATE POLICY "Users can update own comments"
    ON public.comments FOR UPDATE
    USING ((auth.uid())::uuid = user_id);

CREATE POLICY "Users can delete own comments"
    ON public.comments FOR DELETE
    USING ((auth.uid())::uuid = user_id);

CREATE POLICY "Admins can delete any comment"
    ON public.comments FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = (auth.uid())::uuid AND users.role = 'admin'
        )
    );

-- ============================================================================
-- 4. REPORTS TABLE (Content Moderation)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    reported_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (char_length(reason) > 0),
    report_type TEXT CHECK (report_type IN ('spam', 'inappropriate', 'copyright', 'misleading', 'other')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    admin_notes TEXT,
    resolved_by UUID REFERENCES public.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_reports_resource_id ON public.reports(resource_id);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_reported_by ON public.reports(reported_by);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports table
CREATE POLICY "Users can view their own reports"
    ON public.reports FOR SELECT
    USING ((auth.uid())::uuid = reported_by);

CREATE POLICY "Admins can view all reports"
    ON public.reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = (auth.uid())::uuid AND users.role = 'admin'
        )
    );

CREATE POLICY "Authenticated users can create reports"
    ON public.reports FOR INSERT
    WITH CHECK ((auth.uid())::uuid = reported_by);

CREATE POLICY "Admins can update reports"
    ON public.reports FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = (auth.uid())::uuid AND users.role = 'admin'
        )
    );

-- ============================================================================
-- 5. AI SUMMARIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    model_used TEXT,
    tokens_used INTEGER,
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(resource_id)
);

-- Create index
CREATE INDEX idx_ai_summaries_resource_id ON public.ai_summaries(resource_id);

-- Enable RLS
ALTER TABLE public.ai_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_summaries table
CREATE POLICY "Anyone can view summaries for approved resources"
    ON public.ai_summaries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.resources
            WHERE resources.id = ai_summaries.resource_id AND resources.is_approved = true
        )
    );

CREATE POLICY "System can insert summaries"
    ON public.ai_summaries FOR INSERT
    WITH CHECK (true);

CREATE POLICY "System can update summaries"
    ON public.ai_summaries FOR UPDATE
    USING (true);

-- ============================================================================
-- 6. LIKES / FAVORITES TABLE (Optional Enhancement)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.resource_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(resource_id, user_id)
);

-- Create indexes
CREATE INDEX idx_resource_likes_resource_id ON public.resource_likes(resource_id);
CREATE INDEX idx_resource_likes_user_id ON public.resource_likes(user_id);

-- Enable RLS
ALTER TABLE public.resource_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view likes count"
    ON public.resource_likes FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can like resources"
    ON public.resource_likes FOR INSERT
    WITH CHECK ((auth.uid())::uuid = user_id);

CREATE POLICY "Users can unlike resources"
    ON public.resource_likes FOR DELETE
    USING ((auth.uid())::uuid = user_id);

-- ============================================================================
-- 7. NOTIFICATIONS TABLE (Optional Enhancement)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('comment', 'like', 'report', 'approval', 'system')),
    resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING ((auth.uid())::uuid = user_id);

CREATE POLICY "System can create notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING ((auth.uid())::uuid = user_id);

-- ============================================================================
-- 8. HELPER FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON public.resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Anonymous'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- FUNCTION: Generate unique public code
-- ============================================================================
-- Generates a unique public code with role-based prefix and random hash
-- Format: SNX-STU-XXXXXX or SNX-FAC-XXXXXX
-- Uses MD5 hash of UUID + timestamp for non-guessability

CREATE OR REPLACE FUNCTION public.generate_public_code(user_role TEXT)
RETURNS TEXT AS $$
DECLARE
    prefix TEXT;
    random_hash TEXT;
    new_code TEXT;
    attempt_count INTEGER := 0;
    max_attempts INTEGER := 10;
BEGIN
    -- Determine prefix based on role
    prefix := CASE 
        WHEN user_role = 'student' THEN 'SNX-STU-'
        WHEN user_role = 'faculty' THEN 'SNX-FAC-'
        ELSE 'SNX-USR-'
    END;
    
    -- Loop to ensure uniqueness (collision handling)
    LOOP
        -- Generate 6-character hash using MD5 of UUID + timestamp
        random_hash := UPPER(SUBSTRING(MD5(uuid_generate_v4()::TEXT || clock_timestamp()::TEXT) FROM 1 FOR 6));
        new_code := prefix || random_hash;
        
        -- Check if code already exists
        IF NOT EXISTS (SELECT 1 FROM public.users WHERE public_code = new_code) THEN
            RETURN new_code;
        END IF;
        
        -- Prevent infinite loop
        attempt_count := attempt_count + 1;
        IF attempt_count >= max_attempts THEN
            RAISE EXCEPTION 'Failed to generate unique public code after % attempts', max_attempts;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- ============================================================================
-- TRIGGER: Auto-generate public_code on user creation
-- ============================================================================

CREATE OR REPLACE FUNCTION public.set_user_public_code()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate if public_code is empty or null
    IF NEW.public_code IS NULL OR NEW.public_code = '' THEN
        NEW.public_code := public.generate_public_code(NEW.role);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_public_code ON public.users;
CREATE TRIGGER trigger_set_public_code
    BEFORE INSERT OR UPDATE OF role ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.set_user_public_code();

-- ============================================================================
-- 9. VIEWS FOR ANALYTICS (Optional)
-- ============================================================================

-- View: Resource statistics
CREATE OR REPLACE VIEW public.resource_stats AS
SELECT
    r.id,
    r.title,
    r.uploaded_by,
    u.full_name AS uploader_name,
    r.subject,
    r.resource_type,
    r.is_approved,
    r.view_count,
    r.download_count,
    COUNT(DISTINCT c.id) AS comment_count,
    COUNT(DISTINCT l.id) AS like_count,
    r.created_at
FROM public.resources r
LEFT JOIN public.users u ON r.uploaded_by = u.id
LEFT JOIN public.comments c ON r.id = c.resource_id
LEFT JOIN public.resource_likes l ON r.id = l.resource_id
GROUP BY r.id, u.full_name;

-- ============================================================================
-- 10. INITIAL DATA (Optional)
-- ============================================================================

-- Note: First user must be created through Supabase Auth
-- Then you can manually update their role to 'admin' in the users table

-- Example: UPDATE public.users SET role = 'admin' WHERE email = 'admin@smartnotex.com';

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================

-- To verify RLS is enabled on all tables:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- To test policies:
-- SET ROLE authenticated;
-- SELECT * FROM public.resources;

