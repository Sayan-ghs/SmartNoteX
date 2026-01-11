-- ============================================================================
-- PUBLIC CODE DISCOVERY - SQL TEST QUERIES
-- ============================================================================
-- Use these queries to test the public code system in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. VERIFY TRIGGER & FUNCTION INSTALLATION
-- ============================================================================

-- Check if public_code column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'public_code';

-- Check if visibility column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'resources' AND column_name = 'visibility';

-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'trigger_set_public_code';

-- Check if function exists
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'generate_public_code';

-- ============================================================================
-- 2. TEST PUBLIC CODE GENERATION
-- ============================================================================

-- Insert a test student (trigger should auto-generate public_code)
INSERT INTO public.users (id, email, full_name, role, department, bio)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'student.test@smartnotex.com',
  'Alice Johnson',
  'student',
  'Computer Science',
  'Passionate about Machine Learning and AI'
)
ON CONFLICT (id) DO NOTHING;

-- Insert a test faculty (trigger should auto-generate public_code)
INSERT INTO public.users (id, email, full_name, role, department, bio)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'faculty.test@smartnotex.com',
  'Prof. Robert Smith',
  'faculty',
  'Mathematics',
  'Research in Applied Mathematics and Data Science'
)
ON CONFLICT (id) DO NOTHING;

-- Verify public codes were generated
SELECT 
  public_code, 
  full_name, 
  role, 
  department,
  created_at
FROM public.users 
WHERE email IN ('student.test@smartnotex.com', 'faculty.test@smartnotex.com')
ORDER BY role;

-- Expected output:
-- public_code        | full_name          | role    | department
-- SNX-FAC-XXXXXX     | Prof. Robert Smith | faculty | Mathematics
-- SNX-STU-XXXXXX     | Alice Johnson      | student | Computer Science

-- ============================================================================
-- 3. TEST RESOURCE VISIBILITY
-- ============================================================================

-- Insert public approved resource for student
INSERT INTO public.resources (
  id, title, description, resource_type, subject, 
  uploaded_by, visibility, is_approved, tags
) VALUES (
  uuid_generate_v4(),
  'Introduction to Machine Learning',
  'Comprehensive notes covering supervised and unsupervised learning algorithms',
  'note',
  'Computer Science',
  '11111111-1111-1111-1111-111111111111',
  'public',
  true,
  ARRAY['machine-learning', 'ai', 'python', 'algorithms']
)
ON CONFLICT DO NOTHING;

-- Insert another public approved resource
INSERT INTO public.resources (
  id, title, description, resource_type, subject, 
  uploaded_by, visibility, is_approved, tags
) VALUES (
  uuid_generate_v4(),
  'Deep Learning with PyTorch',
  'Hands-on tutorial for building neural networks',
  'pdf',
  'Computer Science',
  '11111111-1111-1111-1111-111111111111',
  'public',
  true,
  ARRAY['deep-learning', 'pytorch', 'neural-networks']
)
ON CONFLICT DO NOTHING;

-- Insert private resource (should NOT appear in search)
INSERT INTO public.resources (
  id, title, description, resource_type, subject, 
  uploaded_by, visibility, is_approved, tags
) VALUES (
  uuid_generate_v4(),
  'Private Study Notes',
  'Personal notes - not for sharing',
  'note',
  'Computer Science',
  '11111111-1111-1111-1111-111111111111',
  'private',
  true,
  ARRAY['private']
)
ON CONFLICT DO NOTHING;

-- Insert unapproved resource (should NOT appear in search)
INSERT INTO public.resources (
  id, title, description, resource_type, subject, 
  uploaded_by, visibility, is_approved, tags
) VALUES (
  uuid_generate_v4(),
  'Pending Review Resource',
  'Waiting for admin approval',
  'note',
  'Computer Science',
  '11111111-1111-1111-1111-111111111111',
  'public',
  false,
  ARRAY['pending']
)
ON CONFLICT DO NOTHING;

-- Insert public approved resource for faculty
INSERT INTO public.resources (
  id, title, description, resource_type, subject, 
  uploaded_by, visibility, is_approved, tags
) VALUES (
  uuid_generate_v4(),
  'Advanced Calculus Lecture Notes',
  'Complete lecture series on multivariable calculus',
  'pdf',
  'Mathematics',
  '22222222-2222-2222-2222-222222222222',
  'public',
  true,
  ARRAY['calculus', 'mathematics', 'analysis']
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. VERIFY PUBLIC CODE SEARCH LOGIC
-- ============================================================================

-- Get student's public code
SELECT public_code, full_name, role 
FROM public.users 
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Simulate backend search query for student
-- Replace 'SNX-STU-XXXXXX' with actual code from above query
DO $$
DECLARE
  test_public_code TEXT;
  user_record RECORD;
BEGIN
  -- Get the test student's public code
  SELECT public_code INTO test_public_code
  FROM public.users
  WHERE id = '11111111-1111-1111-1111-111111111111';
  
  RAISE NOTICE 'Testing search for public code: %', test_public_code;
  
  -- Simulate user lookup
  SELECT * INTO user_record
  FROM public.users
  WHERE public_code = test_public_code;
  
  RAISE NOTICE 'Found user: % (role: %)', user_record.full_name, user_record.role;
  
  -- Simulate resource query (with security filters)
  RAISE NOTICE 'Public approved resources:';
  FOR user_record IN
    SELECT title, visibility, is_approved
    FROM public.resources
    WHERE uploaded_by = '11111111-1111-1111-1111-111111111111'
      AND visibility = 'public'
      AND is_approved = true
  LOOP
    RAISE NOTICE '  - % (visibility: %, approved: %)', 
      user_record.title, user_record.visibility, user_record.is_approved;
  END LOOP;
END $$;

-- Manual query: Get all public approved resources for student
-- (This is what the backend endpoint does)
SELECT 
  r.id,
  r.title,
  r.description,
  r.subject,
  r.resource_type,
  r.tags,
  r.created_at,
  r.view_count,
  r.download_count
FROM public.resources r
JOIN public.users u ON r.uploaded_by = u.id
WHERE u.id = '11111111-1111-1111-1111-111111111111'
  AND r.visibility = 'public'
  AND r.is_approved = true
ORDER BY r.created_at DESC;

-- Expected: Should return 2 resources (ML intro and PyTorch)
-- Should NOT return private or unapproved resources

-- ============================================================================
-- 5. TEST RLS POLICIES
-- ============================================================================

-- View all RLS policies on resources table
SELECT 
  policyname, 
  permissive, 
  roles, 
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'resources'
ORDER BY policyname;

-- Expected policy: "Anyone can view public approved resources"
-- Should have: USING (is_approved = true AND visibility = 'public')

-- ============================================================================
-- 6. TEST INDEXES
-- ============================================================================

-- Verify indexes exist
SELECT 
  tablename, 
  indexname, 
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'resources')
  AND indexname IN (
    'idx_users_public_code',
    'idx_resources_visibility',
    'idx_resources_is_approved'
  )
ORDER BY tablename, indexname;

-- Expected: Should show all 3 indexes

-- ============================================================================
-- 7. PERFORMANCE TEST
-- ============================================================================

-- Test query performance with EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT 
  u.public_code,
  u.full_name,
  u.role,
  u.department,
  u.bio,
  u.avatar_url
FROM public.users u
WHERE u.public_code = 'SNX-STU-A1B2C3';
-- Should use Index Scan on idx_users_public_code

EXPLAIN ANALYZE
SELECT 
  r.id,
  r.title,
  r.description,
  r.subject,
  r.resource_type
FROM public.resources r
WHERE r.uploaded_by = '11111111-1111-1111-1111-111111111111'
  AND r.visibility = 'public'
  AND r.is_approved = true;
-- Should use indexes on visibility and is_approved

-- ============================================================================
-- 8. DATA VALIDATION QUERIES
-- ============================================================================

-- Count users by role with public codes
SELECT 
  role,
  COUNT(*) as user_count,
  COUNT(CASE WHEN public_code LIKE 'SNX-STU-%' THEN 1 END) as student_codes,
  COUNT(CASE WHEN public_code LIKE 'SNX-FAC-%' THEN 1 END) as faculty_codes,
  COUNT(CASE WHEN public_code LIKE 'SNX-USR-%' THEN 1 END) as other_codes
FROM public.users
GROUP BY role
ORDER BY role;

-- Check for duplicate public codes (should be 0)
SELECT 
  public_code, 
  COUNT(*) as duplicate_count
FROM public.users
GROUP BY public_code
HAVING COUNT(*) > 1;
-- Expected: No results (public_code is UNIQUE)

-- Count resources by visibility and approval status
SELECT 
  visibility,
  is_approved,
  COUNT(*) as resource_count
FROM public.resources
GROUP BY visibility, is_approved
ORDER BY visibility, is_approved;

-- ============================================================================
-- 9. EXAMPLE FULL SEARCH SIMULATION
-- ============================================================================

-- This simulates the complete backend search flow
WITH user_lookup AS (
  SELECT 
    id,
    public_code,
    full_name,
    role,
    department,
    bio,
    avatar_url
  FROM public.users
  WHERE public_code = (
    SELECT public_code FROM public.users 
    WHERE id = '11111111-1111-1111-1111-111111111111'
    LIMIT 1
  )
),
public_resources AS (
  SELECT 
    r.id,
    r.title,
    r.description,
    r.subject,
    r.resource_type,
    r.tags,
    r.created_at,
    r.view_count,
    r.download_count
  FROM public.resources r
  WHERE r.uploaded_by = (SELECT id FROM user_lookup)
    AND r.visibility = 'public'
    AND r.is_approved = true
  ORDER BY r.created_at DESC
)
SELECT 
  u.public_code,
  u.full_name as owner_name,
  u.role as owner_role,
  u.department,
  u.bio,
  u.avatar_url,
  json_agg(
    json_build_object(
      'id', r.id,
      'title', r.title,
      'description', r.description,
      'subject', r.subject,
      'resource_type', r.resource_type,
      'tags', r.tags,
      'created_at', r.created_at,
      'view_count', r.view_count,
      'download_count', r.download_count
    )
  ) as resources,
  COUNT(r.id) as total_resources
FROM user_lookup u
LEFT JOIN public_resources r ON true
GROUP BY u.public_code, u.full_name, u.role, u.department, u.bio, u.avatar_url;

-- This returns JSON similar to backend API response

-- ============================================================================
-- 10. CLEANUP (OPTIONAL)
-- ============================================================================

-- Remove test data (uncomment to use)
/*
DELETE FROM public.resources 
WHERE uploaded_by IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);

DELETE FROM public.users 
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);
*/

-- ============================================================================
-- 11. UTILITY QUERIES
-- ============================================================================

-- List all users with their public codes
SELECT 
  public_code,
  full_name,
  role,
  department,
  email,
  created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 20;

-- List all public approved resources
SELECT 
  r.title,
  r.subject,
  r.resource_type,
  r.visibility,
  r.is_approved,
  u.full_name as uploader,
  u.public_code,
  r.created_at
FROM public.resources r
JOIN public.users u ON r.uploaded_by = u.id
WHERE r.visibility = 'public' AND r.is_approved = true
ORDER BY r.created_at DESC;

-- Count resources per user
SELECT 
  u.public_code,
  u.full_name,
  u.role,
  COUNT(r.id) as total_resources,
  COUNT(CASE WHEN r.visibility = 'public' AND r.is_approved = true THEN 1 END) as public_approved
FROM public.users u
LEFT JOIN public.resources r ON u.id = r.uploaded_by
GROUP BY u.public_code, u.full_name, u.role
ORDER BY public_approved DESC, total_resources DESC;

-- Find users with no public resources
SELECT 
  u.public_code,
  u.full_name,
  u.role
FROM public.users u
LEFT JOIN public.resources r ON u.id = r.uploaded_by 
  AND r.visibility = 'public' 
  AND r.is_approved = true
WHERE r.id IS NULL
ORDER BY u.created_at DESC;

-- ============================================================================
-- END OF TEST QUERIES
-- ============================================================================

-- Summary of what to check:
-- ✓ public_code column exists and is UNIQUE
-- ✓ visibility column exists with CHECK constraint
-- ✓ Trigger auto-generates public codes on INSERT
-- ✓ Public codes follow format: SNX-{STU|FAC|USR}-XXXXXX
-- ✓ RLS policies allow public access to public+approved resources
-- ✓ Indexes are created for performance
-- ✓ Test data can be queried correctly
-- ✓ No duplicate public codes exist
-- ✓ Private/unapproved resources are excluded from searches
