# 🚀 Quick Start - Public Code Discovery

## TL;DR

A secure system where users get unique codes (like `SNX-STU-A1B2C3`) that anyone can use to find their public resources.

---

## 📁 Files Created

```
backend/
  supabase_schema.sql                    (MODIFIED - added public_code, trigger)
  app/
    models/schemas.py                    (MODIFIED - added visibility, public_code)
    api/public_search.py                 (NEW - search endpoint)
    main.py                              (MODIFIED - registered router)

frontend/
  src/
    pages/PublicCodeSearch.tsx           (NEW - search UI)
    services/publicCodeApi.ts            (NEW - API service)
    App.tsx                              (MODIFIED - added /search route)

docs/
  PUBLIC_CODE_DISCOVERY.md               (NEW - full documentation)
  PUBLIC_CODE_SUMMARY.md                 (NEW - quick reference)
  PUBLIC_CODE_ARCHITECTURE.md            (NEW - visual diagrams)
  PUBLIC_CODE_TEST_QUERIES.sql           (NEW - SQL test queries)
  PUBLIC_CODE_CHECKLIST.md               (NEW - deployment checklist)
```

---

## ⚡ 3-Step Deployment

### Step 1: Database (5 minutes)

```sql
-- In Supabase SQL Editor, execute:
-- 1. Add columns
ALTER TABLE public.users ADD COLUMN public_code TEXT UNIQUE NOT NULL DEFAULT '';
ALTER TABLE public.resources ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private'));

-- 2. Create indexes
CREATE INDEX idx_users_public_code ON public.users(public_code);
CREATE INDEX idx_resources_visibility ON public.resources(visibility);

-- 3. Create function + trigger (see supabase_schema.sql)
-- 4. Update RLS policies (see supabase_schema.sql)
```

**Or**: Copy entire [`backend/supabase_schema.sql`](backend/supabase_schema.sql) and execute in Supabase.

**Verify**:
```sql
-- Check if trigger works
INSERT INTO public.users (id, email, full_name, role)
VALUES (uuid_generate_v4(), 'test@test.com', 'Test User', 'student');

SELECT public_code, full_name FROM public.users WHERE email = 'test@test.com';
-- Should show: SNX-STU-XXXXXX
```

---

### Step 2: Backend (2 minutes)

```bash
cd backend

# Files are already updated, just start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Verify**:
- Open http://localhost:8000/docs
- Find endpoint: `GET /api/search/by-code/{public_code}`
- Try it with a valid code

---

### Step 3: Frontend (2 minutes)

```bash
cd frontend

# Files are already updated, just start server
npm run dev
```

**Verify**:
- Open http://localhost:5173/search
- Enter a valid public code
- Click Search
- See results!

---

## 🧪 Quick Test

### 1. Create Test Data

```sql
-- Insert test student
INSERT INTO public.users (id, email, full_name, role, department, bio)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'john.doe@student.com',
  'John Doe',
  'student',
  'Computer Science',
  'ML enthusiast'
);

-- Get the auto-generated public code
SELECT public_code FROM public.users WHERE email = 'john.doe@student.com';
-- Example result: SNX-STU-A1B2C3

-- Insert public approved resource
INSERT INTO public.resources (
  id, title, description, resource_type, subject, 
  uploaded_by, visibility, is_approved, tags
) VALUES (
  uuid_generate_v4(),
  'Machine Learning Notes',
  'Comprehensive ML tutorial',
  'note',
  'Computer Science',
  '11111111-1111-1111-1111-111111111111',
  'public',
  true,
  ARRAY['ml', 'ai', 'python']
);
```

### 2. Test Backend

```bash
# Replace with actual code from step 1
curl http://localhost:8000/api/search/by-code/SNX-STU-A1B2C3
```

**Expected Response**:
```json
{
  "public_code": "SNX-STU-A1B2C3",
  "owner_name": "John Doe",
  "owner_role": "student",
  "department": "Computer Science",
  "bio": "ML enthusiast",
  "resources": [
    {
      "id": "...",
      "title": "Machine Learning Notes",
      "description": "Comprehensive ML tutorial",
      "subject": "Computer Science",
      "resource_type": "note",
      "tags": ["ml", "ai", "python"],
      ...
    }
  ],
  "total_resources": 1
}
```

### 3. Test Frontend

1. Go to http://localhost:5173/search
2. Enter code: `SNX-STU-A1B2C3`
3. Click "Search"
4. Should see:
   - User card with name, role, department
   - Resource card with title, description, tags

---

## 🔒 Security

### ✅ What's Protected
- Internal UUIDs
- Email addresses
- Private resources
- Unapproved resources

### ✅ What's Public
- Full name
- Role (student/faculty)
- Department, bio
- Public approved resources

---

## 🎯 Use Cases

### For Students/Faculty
1. Get your public code: Check your profile
2. Share your code: `SNX-STU-A1B2C3`
3. Others search your code → Find your public notes

### For Searchers
1. Got someone's public code
2. Go to `/search`
3. Enter code
4. View their public resources

---

## 📊 Key Features

| Feature | Status |
|---------|--------|
| Auto-generate public codes | ✅ |
| Search by public code | ✅ |
| Real-time validation | ✅ |
| Security (RLS + filters) | ✅ |
| Responsive UI | ✅ |
| Error handling | ✅ |
| Loading states | ✅ |
| Type-safe (TypeScript) | ✅ |

---

## 🐛 Troubleshooting

### Public code not generated
```sql
-- Check trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'trigger_set_public_code';

-- Manually trigger for existing users
UPDATE public.users SET role = role WHERE public_code IS NULL OR public_code = '';
```

### API returns empty results
```sql
-- Check if resources have correct flags
SELECT 
  title, 
  visibility, 
  is_approved 
FROM public.resources 
WHERE uploaded_by = 'USER_UUID_HERE';

-- Fix if needed
UPDATE public.resources 
SET visibility = 'public', is_approved = true 
WHERE id = 'RESOURCE_UUID_HERE';
```

### Frontend doesn't load
```bash
# Check for errors
npm run dev

# Check browser console
# Check network tab for API calls
```

### CORS errors
```python
# In backend/app/main.py, verify:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [PUBLIC_CODE_DISCOVERY.md](PUBLIC_CODE_DISCOVERY.md) | Complete implementation guide |
| [PUBLIC_CODE_SUMMARY.md](PUBLIC_CODE_SUMMARY.md) | Quick reference |
| [PUBLIC_CODE_ARCHITECTURE.md](PUBLIC_CODE_ARCHITECTURE.md) | Visual diagrams |
| [PUBLIC_CODE_TEST_QUERIES.sql](PUBLIC_CODE_TEST_QUERIES.sql) | SQL test queries |
| [PUBLIC_CODE_CHECKLIST.md](PUBLIC_CODE_CHECKLIST.md) | Deployment checklist |

---

## 🎉 You're Done!

The system is now:
- ✅ Secure (RLS + input validation)
- ✅ Scalable (indexed queries)
- ✅ User-friendly (clean UI)
- ✅ Well-documented

Users can now share their public codes and others can discover their public resources!

---

## 📞 Need Help?

1. Check [PUBLIC_CODE_DISCOVERY.md](PUBLIC_CODE_DISCOVERY.md) for detailed docs
2. Check [PUBLIC_CODE_TEST_QUERIES.sql](PUBLIC_CODE_TEST_QUERIES.sql) for SQL tests
3. Check [PUBLIC_CODE_CHECKLIST.md](PUBLIC_CODE_CHECKLIST.md) for deployment steps
4. Review browser console for frontend errors
5. Review `uvicorn` logs for backend errors
6. Review Supabase logs for database errors

---

**Happy Coding! 🚀**
