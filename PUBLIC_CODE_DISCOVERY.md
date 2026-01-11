# Public Code Discovery System - Implementation Guide

## 🎯 Overview

This feature allows anyone to search for public resources using a user's unique, non-guessable public code (e.g., `SNX-STU-A1B2C3`). The system is designed with security, scalability, and privacy in mind.

---

## 🏗️ Architecture

### **Security Principles**
- ✅ NO authentication required for search
- ✅ NO exposure of internal UUIDs to public
- ✅ NO exposure of email addresses
- ✅ Only `public` + `approved` resources are visible
- ✅ Non-guessable codes using MD5 hashing
- ✅ Row-Level Security (RLS) enforced

### **Code Format**
```
SNX-STU-XXXXXX  → Students
SNX-FAC-XXXXXX  → Faculty
SNX-USR-XXXXXX  → Others (fallback)
```
- **Prefix**: Role-based (STU/FAC/USR)
- **Hash**: 6-character MD5 hash (UUID + timestamp)
- **Uniqueness**: Enforced via database constraint + collision handling

---

## 📁 Files Changed/Created

### **1. Database (SQL)**
**File**: `backend/supabase_schema.sql`

#### Changes Made:
1. **Added `public_code` column to `users` table**:
   ```sql
   public_code TEXT UNIQUE NOT NULL DEFAULT ''
   ```

2. **Added `visibility` column to `resources` table**:
   ```sql
   visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private'))
   ```

3. **Created indexes** for performance:
   ```sql
   CREATE INDEX idx_users_public_code ON public.users(public_code);
   CREATE INDEX idx_resources_visibility ON public.resources(visibility);
   ```

4. **Created function** to generate unique public codes:
   ```sql
   CREATE OR REPLACE FUNCTION public.generate_public_code(user_role TEXT)
   RETURNS TEXT
   ```
   - Uses MD5 hash of `UUID + timestamp`
   - Includes collision handling (retries up to 10 times)
   - Returns format: `SNX-STU-XXXXXX`

5. **Created trigger** to auto-generate codes on user creation:
   ```sql
   CREATE TRIGGER trigger_set_public_code
   BEFORE INSERT OR UPDATE OF role ON public.users
   FOR EACH ROW EXECUTE FUNCTION public.set_user_public_code();
   ```

6. **Updated RLS policies**:
   ```sql
   CREATE POLICY "Anyone can view public approved resources"
   ON public.resources FOR SELECT
   USING (is_approved = true AND visibility = 'public');
   ```

---

### **2. Backend (FastAPI)**

#### **File**: `backend/app/models/schemas.py`
**Changes**:
- Added `public_code: str` to `UserResponse` schema
- Added `visibility: str` to `ResourceCreate` and `ResourceUpdate` schemas
- Added `visibility: str` to `ResourceResponse` schema
- Created new schemas:
  - `PublicResourceItem` - Safe resource data (no UUIDs)
  - `PublicCodeSearchResponse` - Public search response

#### **File**: `backend/app/api/public_search.py` ✨ NEW
**Endpoints**:

1. **`GET /api/search/by-code/{public_code}`**
   ```python
   # Returns:
   {
     "public_code": "SNX-STU-A1B2C3",
     "owner_name": "John Doe",
     "owner_role": "student",
     "department": "Computer Science",
     "bio": "...",
     "avatar_url": "...",
     "resources": [...],
     "total_resources": 5
   }
   ```
   - **Security**: Only returns `public` + `approved` resources
   - **Validation**: Checks code format before querying
   - **Error Handling**: 400 (invalid format), 404 (not found), 500 (server error)

2. **`GET /api/search/validate-code/{public_code}`**
   ```python
   # Returns:
   {
     "valid": true,
     "owner_name": "John Doe",
     "role": "student"
   }
   ```
   - Lightweight validation endpoint
   - Used for real-time frontend validation

#### **File**: `backend/app/main.py`
**Changes**:
- Imported `public_search` router
- Registered route: `app.include_router(public_search.router, prefix="/api")`

---

### **3. Frontend (React + TypeScript)**

#### **File**: `frontend/src/pages/PublicCodeSearch.tsx` ✨ NEW
**Features**:
- ✅ Search input with uppercase auto-formatting
- ✅ Real-time code format validation
- ✅ Backend validation on input change
- ✅ User profile card with avatar, role badge, department, bio
- ✅ Resource cards with:
  - Type icons (📄 PDF, 📝 Note, 🔗 Link, etc.)
  - View/download counts
  - Subject tags
  - Created date
- ✅ Responsive grid layout
- ✅ Error handling with user-friendly messages
- ✅ Loading states with spinner
- ✅ Empty state

#### **File**: `frontend/src/services/publicCodeApi.ts` ✨ NEW
**Exports**:
```typescript
searchByPublicCode(publicCode: string): Promise<PublicCodeSearchResult>
validatePublicCode(publicCode: string): Promise<CodeValidationResult>
validateCodeFormat(code: string): boolean
```

#### **File**: `frontend/src/App.tsx`
**Changes**:
- Imported `PublicCodeSearch` component
- Added public route: `<Route path="/search" element={<PublicCodeSearch />} />`

---

## 🚀 Deployment Steps

### **1. Database Migration**
Run the updated SQL schema on your Supabase database:

```bash
# Connect to Supabase SQL Editor and execute:
# 1. Add columns
# 2. Create indexes
# 3. Create functions
# 4. Create triggers
# 5. Update RLS policies

# Or use Supabase CLI:
supabase db push
```

### **2. Backend Deployment**
```bash
cd backend

# Install dependencies (if needed)
pip install -r requirements.txt

# Run backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### **3. Frontend Deployment**
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

---

## 🧪 Testing

### **1. Test Database Trigger**
```sql
-- Create a test user
INSERT INTO public.users (id, email, full_name, role)
VALUES (
  uuid_generate_v4(),
  'test@student.com',
  'Test Student',
  'student'
);

-- Check if public_code was auto-generated
SELECT public_code, full_name, role FROM public.users WHERE email = 'test@student.com';
-- Expected: public_code = 'SNX-STU-XXXXXX'
```

### **2. Test Backend API**
```bash
# Test search endpoint
curl http://localhost:8000/api/search/by-code/SNX-STU-A1B2C3

# Test validation endpoint
curl http://localhost:8000/api/search/validate-code/SNX-STU-A1B2C3
```

### **3. Test Frontend**
1. Navigate to `http://localhost:5173/search`
2. Enter a valid public code (e.g., `SNX-STU-A1B2C3`)
3. Click "Search"
4. Verify results display correctly

---

## 📊 Sample Data

### **Insert Test Users**
```sql
-- Student with public resources
INSERT INTO public.users (id, email, full_name, role, department, bio)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'john.doe@student.com',
  'John Doe',
  'student',
  'Computer Science',
  'Passionate about AI and Machine Learning'
);

-- Faculty with public resources
INSERT INTO public.users (id, email, full_name, role, department, bio)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'prof.smith@faculty.com',
  'Prof. Jane Smith',
  'faculty',
  'Mathematics',
  'Research in Applied Mathematics'
);
```

### **Insert Test Resources**
```sql
-- Public approved resource
INSERT INTO public.resources (
  id, title, description, resource_type, subject, 
  uploaded_by, visibility, is_approved, tags
) VALUES (
  uuid_generate_v4(),
  'Introduction to Machine Learning',
  'Comprehensive notes on ML fundamentals',
  'note',
  'Computer Science',
  '11111111-1111-1111-1111-111111111111',
  'public',
  true,
  ARRAY['machine-learning', 'ai', 'python']
);
```

### **Query Public Codes**
```sql
-- Get all public codes
SELECT public_code, full_name, role FROM public.users ORDER BY role, full_name;
```

---

## 🔐 Security Considerations

### ✅ **What's Protected**
- Internal user UUIDs never exposed
- Email addresses never exposed in public endpoints
- Only `public` + `approved` resources visible
- RLS policies enforce access control
- Public codes are non-guessable (MD5 hashed)

### ✅ **What's Public**
- User's full name
- User's role (student/faculty)
- User's department and bio (if provided)
- User's avatar URL (if provided)
- Public approved resources only

### ⚠️ **Rate Limiting** (Recommended)
Consider adding rate limiting to prevent abuse:
```python
# Using slowapi or fastapi-limiter
@router.get("/by-code/{public_code}")
@limiter.limit("10/minute")
async def search_by_public_code(...)
```

---

## 📈 Performance Optimization

### **Database Indexes**
Already created:
- `idx_users_public_code` - Fast lookups by public code
- `idx_resources_visibility` - Filter by visibility
- `idx_resources_is_approved` - Filter by approval status

### **Query Optimization**
- Uses single SELECT with filters (no joins)
- Limits result set to approved resources only
- Uses `anon_client` for RLS enforcement

---

## 🐛 Common Issues & Solutions

### **Issue 1: Public code not auto-generated**
**Solution**: Ensure trigger is created and enabled:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'trigger_set_public_code';
```

### **Issue 2: RLS blocking queries**
**Solution**: Verify RLS policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'resources';
```

### **Issue 3: CORS errors in frontend**
**Solution**: Ensure CORS is configured in `backend/app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🎨 UI Customization

### **Tailwind CSS Classes Used**
- Gradient backgrounds: `bg-gradient-to-br from-blue-50 via-white to-purple-50`
- Role badges: `bg-blue-100 text-blue-800` (student), `bg-purple-100 text-purple-800` (faculty)
- Resource cards: Border colors based on type (PDF=red, Note=yellow, Link=blue)

### **Icons**
Using Lucide React icons:
- `Search`, `User`, `BookOpen`, `Calendar`, `Eye`, `Download`, `Tag`, `AlertCircle`, `Loader2`

---

## 📚 Architecture Decisions

### **Why MD5 for Public Codes?**
- **Fast**: MD5 is very fast for this use case
- **Non-cryptographic**: We don't need cryptographic strength (codes are public)
- **Compact**: 6 characters provide 16^6 = 16.7 million combinations
- **Collision handling**: Function retries on collision (extremely rare)

### **Why Separate Visibility Field?**
- **Explicit intent**: Users must explicitly mark resources as public
- **Independent from approval**: Admins can approve private resources
- **Future-proof**: Can add more visibility levels (e.g., `unlisted`)

### **Why No Authentication for Search?**
- **Public discovery**: Goal is to allow anyone to find public content
- **Lower barrier**: No login required for searching
- **SEO-friendly**: Public pages can be indexed
- **Security**: RLS + visibility filters protect private data

---

## 🚀 Future Enhancements

1. **QR Codes**: Generate QR codes for public codes
2. **Analytics**: Track search counts per user
3. **Shareable Links**: `/search?code=SNX-STU-A1B2C3`
4. **Export**: Allow users to export their public code as a card
5. **Rate Limiting**: Prevent abuse with IP-based rate limiting
6. **Caching**: Cache search results for popular codes

---

## ✅ Checklist

- [x] Database schema updated with `public_code` column
- [x] Trigger function created for auto-generation
- [x] RLS policies updated for public visibility
- [x] Backend endpoint created (`/api/search/by-code/{code}`)
- [x] Backend validation endpoint created
- [x] Pydantic schemas updated
- [x] Frontend component created (PublicCodeSearch.tsx)
- [x] Frontend API service created (publicCodeApi.ts)
- [x] Route registered in App.tsx
- [x] Error handling implemented
- [x] Loading states implemented
- [x] Responsive design implemented
- [x] Documentation created

---

## 📞 Support

For issues or questions:
1. Check Supabase logs for RLS errors
2. Check FastAPI logs for backend errors
3. Check browser console for frontend errors
4. Verify database indexes are created
5. Ensure CORS is configured correctly

---

**Built with ❤️ for Smart NoteX Academic Platform**
