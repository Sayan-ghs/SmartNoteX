# Smart NoteX Backend - Extended Implementation Guide

## 🎯 What Has Been Added

### **NEW: AI Integration & Event-Driven Features**

Your backend has been **extended** (not rewritten) with:

## 🏗️ New Architecture Components

### 1. **Core Module** (`app/core/`)
- ✅ `supabase_client.py` - Direct Supabase integration with anon & service role
- ✅ `security.py` - JWT extraction, role-based access control dependencies

### 2. **Services** (`app/services/`)
- ✅ `ai_service.py` - AI summarization with background tasks
- ✅ `notification_service.py` - Event-driven notifications

### 3. **API Endpoints** (`app/api/`)
- ✅ `resources.py` - Resource CRUD with AI integration
- ✅ `comments.py` - Discussion system with notifications
- ✅ `reports.py` - Content moderation
- ✅ `likes.py` - Like/favorite system
- ✅ `notifications.py` - Notification management

### 4. **Schemas** (`app/models/`)
- ✅ `schemas.py` - Complete Pydantic models with UUID support

## 🔐 Authentication Flow

### JWT-Based Auth (Already Working)
```python
# Frontend sends:
Authorization: Bearer <supabase-jwt-token>

# Backend extracts user ID:
from app.core.security import get_current_user_id

@router.post("/resources")
async def create_resource(
    user_id: str = Depends(get_current_user_id)
):
    # user_id is automatically extracted from JWT
    ...
```

### Role-Based Access
```python
from app.core.security import require_admin, require_faculty_or_admin

@router.patch("/{id}/approve")
async def approve(admin: dict = Depends(require_admin)):
    # Only admins can access
    ...
```

## 🧠 AI Integration Flow

### Automatic Summarization
```
1. User uploads resource → POST /api/resources
2. Backend creates resource in DB
3. Background task queued → ai_service.generate_summary_async()
4. AI generates summary using existing LLM service
5. Summary stored in ai_summaries table (using service role)
6. User sees summary when resource is approved
```

### Manual Regeneration
```python
# Admin can trigger re-summarization
await ai_service.regenerate_summary(resource_id)
```

## 🔔 Event-Driven Notifications

### Auto-Triggered Events
- **Resource Approved** → Notify uploader
- **New Comment** → Notify resource owner
- **New Like** → Notify resource owner
- **Report Resolved** → Notify reporter

### Implementation
```python
from app.services.notification_service import notification_service

# In resource approval:
background_tasks.add_task(
    notification_service.notify_resource_approved,
    resource_id=resource_id,
    uploader_id=uploader_id
)
```

## 📊 Database Access Patterns

### User Operations (Respects RLS)
```python
# Uses anon client + JWT
token = authorization.replace("Bearer ", "")
client = supabase_db.get_user_client(token)
result = client.table("resources").select("*").execute()
# ✅ RLS enforced - users see only what they're allowed to
```

### System Operations (Bypasses RLS)
```python
# Uses service role client
client = supabase_db.service_client
result = client.table("ai_summaries").insert(data).execute()
# ⚠️ RLS bypassed - only use for AI/admin tasks
```

## 🚀 Running the Extended Backend

### 1. Update Environment
```bash
# Add to .env:
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

Get service key from:
- Supabase Dashboard → Project Settings → API → `service_role` key
- **⚠️ CRITICAL**: Never expose this to frontend!

### 2. Run Server
```bash
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

### 3. API Documentation
Visit: http://localhost:8000/docs

## 📡 New API Endpoints

### Resources
```
POST   /api/resources              # Create resource + queue AI summary
GET    /api/resources              # List resources (filtered by approval)
GET    /api/resources/{id}         # Get resource + increment view count
PATCH  /api/resources/{id}         # Update resource
PATCH  /api/resources/{id}/approve # Approve (admin) + notify + AI summary
DELETE /api/resources/{id}         # Delete resource
```

### Comments
```
POST   /api/comments                    # Create comment + notify owner
GET    /api/comments/resource/{id}      # List comments
PATCH  /api/comments/{id}               # Update comment
DELETE /api/comments/{id}               # Delete comment
```

### Reports
```
POST   /api/reports           # Create report
GET    /api/reports           # List all (admin only)
GET    /api/reports/my-reports # User's reports
PATCH  /api/reports/{id}      # Update status (admin) + notify
```

### Likes
```
POST   /api/likes/resources/{id}     # Like + notify owner
DELETE /api/likes/resources/{id}     # Unlike
GET    /api/likes/resources/{id}     # Get likes
GET    /api/likes/my-likes           # User's likes
```

### Notifications
```
GET    /api/notifications              # Get notifications
GET    /api/notifications/unread-count # Count unread
PATCH  /api/notifications/{id}/read   # Mark read
POST   /api/notifications/mark-all-read # Mark all read
```

## 🎭 Role-Based Permissions

### Student
- ✅ Upload resources (pending approval)
- ✅ View approved resources
- ✅ Comment, like, report
- ✅ View own notifications

### Faculty
- ✅ All student permissions
- ✅ Upload resources (pending approval)

### Admin
- ✅ All permissions
- ✅ Approve/reject resources
- ✅ Manage reports
- ✅ View all content (bypasses some RLS)

## 🔧 Background Tasks

### How They Work
```python
from fastapi import BackgroundTasks

@router.post("/resources")
async def create(background_tasks: BackgroundTasks):
    # Immediate response
    result = create_resource_in_db()
    
    # Queue AI task (runs after response)
    background_tasks.add_task(
        ai_service.generate_summary_async,
        resource_id=result["id"]
    )
    
    return result  # User gets instant response
```

### Benefits
- Non-blocking API responses
- AI processing happens asynchronously
- Notifications sent without delays

## 🧪 Testing

### Test AI Integration
```bash
# POST /api/resources with description > 50 chars
# Check logs for: "Queued AI summary generation"
# Check ai_summaries table after ~10s
```

### Test Notifications
```bash
# 1. Like a resource → Check notifications
# 2. Comment on resource → Owner gets notified
# 3. Admin approves resource → Uploader notified
```

## 📝 Notes

### Existing Code Preserved
- ✅ All original API endpoints still work
- ✅ Notes, notebooks, chapters unchanged
- ✅ RAG service integrated (used by AI service)
- ✅ Existing auth system extended

### Production Considerations
- Background tasks use FastAPI's built-in system
- For production, consider:
  - Celery for distributed tasks
  - Redis for task queue
  - Separate AI worker processes

### Security
- JWT validation on every request
- RLS enforced in Supabase
- Service key only used server-side
- Admin operations logged

## 🎯 Next Steps

1. **Add service role key to .env**
2. **Run schema in Supabase** (already created)
3. **Create first admin user**:
   ```sql
   UPDATE public.users 
   SET role = 'admin' 
   WHERE email = 'your@email.com';
   ```
4. **Test API endpoints**
5. **Integrate with frontend**

---

**Version**: 2.0.0  
**Status**: Production Ready 🚀
