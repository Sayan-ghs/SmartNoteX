# Messaging System - Quick Start Guide

## 🚀 Quick Start (5 Minutes)

This guide will get you up and running with the messaging system.

---

## Prerequisites

- Supabase project created
- Backend and frontend environments configured
- User authentication working

---

## Step 1: Database Setup (2 minutes)

### Apply the schema

```bash
# Navigate to backend folder
cd backend

# Apply messaging schema to your Supabase database
psql -h db.YOUR_PROJECT_REF.supabase.co -U postgres -d postgres -f messaging_schema.sql
```

Or paste the contents of `backend/messaging_schema.sql` into the Supabase SQL Editor.

### Enable Realtime

1. Go to **Supabase Dashboard → Database → Replication**
2. Enable replication for these tables:
   - ✅ `messages`
   - ✅ `community_messages`
   - ✅ `conversations`
   - ✅ `communities`

---

## Step 2: Verify Installation

### Test the database

```sql
-- In Supabase SQL Editor, run:

-- Create a test community
INSERT INTO communities (name, description, subject, is_public, created_by)
VALUES (
  'CS101 Study Group',
  'Discuss lectures and assignments',
  'Computer Science',
  true,
  auth.uid()  -- Your user ID
);

-- Check if it was created
SELECT * FROM communities;

-- Test RLS - should only show communities you're a member of or public ones
SELECT * FROM communities WHERE is_public = true;
```

---

## Step 3: Backend Setup (1 minute)

The messaging API is already registered in `backend/app/main.py`.

### Verify the import

```python
# In backend/app/main.py, you should see:
from app.api import messaging

app.include_router(messaging.router, prefix="/api/messaging", tags=["messaging"])
```

### Test the API

```bash
# Start the backend server
cd backend
uvicorn app.main:app --reload

# Test in another terminal (replace TOKEN with your Supabase JWT)
curl -X GET http://localhost:8000/api/messaging/communities \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT_TOKEN"
```

---

## Step 4: Frontend Setup (2 minutes)

### Add the messaging page to your router

```typescript
// In frontend/src/App.tsx or your router configuration
import MessagingPage from './pages/MessagingPage';

// Add the route
<Route path="/messages" element={<MessagingPage />} />
```

### Add navigation link

```typescript
// In your navigation component (Header/Sidebar)
import { MessageSquare } from 'lucide-react';

<Link to="/messages" className="flex items-center gap-2">
  <MessageSquare className="w-5 h-5" />
  <span>Messages</span>
</Link>
```

---

## Step 5: Test It Out!

### Create a test user and send messages

1. **Register two test users** in your app
2. **Navigate to `/messages`**
3. **Switch to Communities tab**
4. **Join a community** (or create one if you're the first user)
5. **Send a test message** in the community chat
6. **Open the app in another browser** (logged in as second user)
7. **Watch messages appear in real-time!** 🎉

---

## API Examples

### Send a Direct Message

```typescript
// Create or get conversation
const response = await fetch('/api/messaging/conversations', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'direct',
    other_user_id: 'recipient-user-uuid',
  }),
});
const { id: conversationId } = await response.json();

// Send message
await fetch(`/api/messaging/conversations/${conversationId}/messages`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    content: 'Hello!',
  }),
});
```

### Create a Community

```typescript
const response = await fetch('/api/messaging/communities', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Math 101 Study Group',
    description: 'Discuss homework and prepare for exams',
    subject: 'Mathematics',
    is_public: true,
  }),
});
const community = await response.json();
```

### Send a Community Message

```typescript
await fetch(`/api/messaging/communities/${communityId}/messages`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    content: 'Does anyone understand Chapter 5?',
    reply_to_id: null,  // or message ID to reply to
  }),
});
```

---

## Using React Hooks

### Direct Messages

```typescript
import { useMessages } from '../hooks/useMessaging';

function ChatComponent({ conversationId }) {
  const { messages, loading, sendMessage } = useMessages(conversationId);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      
      <button onClick={() => sendMessage('Hello!')}>
        Send
      </button>
    </div>
  );
}
```

### Community Messages

```typescript
import { useCommunityMessages } from '../hooks/useMessaging';

function CommunityComponent({ communityId }) {
  const { messages, loading, sendCommunityMessage } = 
    useCommunityMessages(communityId);

  const handleSend = () => {
    sendCommunityMessage(communityId, 'Great discussion!');
  };

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>
          <strong>User:</strong> {msg.content}
        </div>
      ))}
      
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
```

---

## Common Gotchas

### ❌ "Cannot read messages"
**Solution:** Ensure the user is a member of the conversation/community.

```typescript
// For direct messages: both users are auto-added via get_or_create_conversation()
// For communities: user must join first
await joinCommunity(communityId);
```

### ❌ "Realtime not working"
**Solution:** Enable Realtime replication in Supabase Dashboard (Step 1 above).

### ❌ "Unauthorized error"
**Solution:** Check that you're passing the Supabase JWT token in the Authorization header.

```typescript
const token = (await supabase.auth.getSession()).data.session?.access_token;
headers: { 'Authorization': `Bearer ${token}` }
```

### ❌ "Duplicate conversations"
**Solution:** Always use the `get_or_create_conversation()` function for 1-1 chats. The backend API handles this automatically.

---

## Security Checklist

✅ All tables have Row Level Security (RLS) enabled  
✅ Users can only read conversations they're members of  
✅ Users can only send messages to conversations they're members of  
✅ Users can only edit/delete their own messages  
✅ Community admins/moderators can delete community messages  
✅ All API endpoints require authentication  

---

## Performance Tips

1. **Pagination:** Messages are limited to 50-100 by default. Implement "load more" for older messages.

2. **Debouncing:** Search inputs should be debounced to prevent excessive queries.

3. **Cleanup:** Always remove Realtime subscriptions when components unmount.

```typescript
useEffect(() => {
  const channel = supabase.channel('...');
  // ... subscription setup

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

4. **Indexing:** The database includes indexes on frequently queried columns. Don't remove them!

---

## Next Steps

- [ ] Customize UI colors/styling to match your brand
- [ ] Add file upload support for images/documents
- [ ] Implement message search
- [ ] Add push notifications for new messages
- [ ] Create admin dashboard for community management
- [ ] Add message reactions (emoji)
- [ ] Implement typing indicators
- [ ] Add read receipts

---

## Need Help?

- **Full Documentation:** See `MESSAGING_SYSTEM.md`
- **Database Schema:** See `messaging_schema.sql`
- **API Reference:** Start the backend and visit `http://localhost:8000/docs`
- **Supabase Docs:** https://supabase.com/docs
- **React Hooks Guide:** https://react.dev/reference/react/hooks

---

**Happy Messaging! 🚀💬**
