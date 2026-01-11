# Messaging System - Testing Examples

This file provides comprehensive testing examples for the Messaging & Community Chat System.

---

## 🧪 Database Testing

### Test 1: Verify Schema Creation

```sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'conversations', 'conversation_members', 'messages',
  'communities', 'community_members', 'community_messages'
);

-- Expected: 6 rows
```

### Test 2: Verify RLS Policies

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'conversations', 'conversation_members', 'messages',
  'communities', 'community_members', 'community_messages'
);

-- Expected: All should have rowsecurity = true

-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public';

-- Expected: Multiple policies per table
```

### Test 3: Test get_or_create_conversation Function

```sql
-- Test creating a new conversation
SELECT get_or_create_conversation(
  '00000000-0000-0000-0000-000000000001'::uuid,  -- user 1
  '00000000-0000-0000-0000-000000000002'::uuid   -- user 2
);

-- Run again - should return same conversation ID
SELECT get_or_create_conversation(
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000002'::uuid
);

-- Expected: Same UUID both times (atomic operation)
```

### Test 4: Test RLS - Unauthorized Access

```sql
-- Simulate unauthorized user
SET request.jwt.claims = '{"sub": "unauthorized-user-uuid"}';

-- Try to read messages from a conversation
SELECT * FROM messages WHERE conversation_id = 'some-conversation-uuid';

-- Expected: 0 rows (RLS blocks access)

-- Reset to bypass RLS (for admin testing)
RESET request.jwt.claims;
```

### Test 5: Test Triggers - Auto-Update Timestamps

```sql
-- Create a test community
INSERT INTO communities (name, description, is_public, created_by)
VALUES ('Test Community', 'Test description', true, auth.uid())
RETURNING id, created_at, updated_at;

-- Note the updated_at timestamp
-- Wait 2 seconds, then update
SELECT pg_sleep(2);

UPDATE communities 
SET description = 'Updated description' 
WHERE name = 'Test Community'
RETURNING created_at, updated_at;

-- Expected: updated_at should be newer than created_at
```

### Test 6: Test Triggers - Community Member Count

```sql
-- Create a test community
INSERT INTO communities (name, description, is_public, created_by)
VALUES ('CS101', 'Computer Science 101', true, auth.uid())
RETURNING id, member_count;

-- Expected: member_count = 1 (creator is auto-added)

-- Get community ID
\set comm_id 'your-community-uuid-here'

-- Add a member
INSERT INTO community_members (community_id, user_id, role)
VALUES (:'comm_id', 'another-user-uuid', 'member');

-- Check member count
SELECT member_count FROM communities WHERE id = :'comm_id';

-- Expected: member_count = 2

-- Remove a member
DELETE FROM community_members 
WHERE community_id = :'comm_id' AND user_id = 'another-user-uuid';

-- Check member count again
SELECT member_count FROM communities WHERE id = :'comm_id';

-- Expected: member_count = 1
```

---

## 🔌 Backend API Testing

### Setup: Get Authentication Token

```bash
# Register a test user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser1@example.com",
    "password": "securepassword123",
    "full_name": "Test User 1"
  }'

# Login to get token
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser1@example.com",
    "password": "securepassword123"
  }' | jq -r '.access_token')

echo "Token: $TOKEN"
```

### Test 1: Create/Get Conversation

```bash
# Create a conversation with another user
curl -X POST http://localhost:8000/api/messaging/conversations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "direct",
    "other_user_id": "other-user-uuid"
  }' | jq

# Expected: Returns conversation object with ID
```

### Test 2: Send Direct Message

```bash
# Send a message (use conversation ID from Test 1)
CONV_ID="conversation-uuid-here"

curl -X POST http://localhost:8000/api/messaging/conversations/$CONV_ID/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello! This is a test message."
  }' | jq

# Expected: Returns message object with ID
```

### Test 3: Get Conversation Messages

```bash
# Get messages (use conversation ID)
curl -X GET "http://localhost:8000/api/messaging/conversations/$CONV_ID/messages?limit=50" \
  -H "Authorization: Bearer $TOKEN" | jq

# Expected: Returns array of messages
```

### Test 4: List User's Conversations

```bash
curl -X GET http://localhost:8000/api/messaging/conversations \
  -H "Authorization: Bearer $TOKEN" | jq

# Expected: Returns array of conversations with last_message and unread_count
```

### Test 5: Create Community

```bash
curl -X POST http://localhost:8000/api/messaging/communities \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CS101 Study Group",
    "description": "Discuss lectures and assignments",
    "subject": "Computer Science",
    "is_public": true
  }' | jq

# Expected: Returns community object with ID
```

### Test 6: List Public Communities

```bash
curl -X GET "http://localhost:8000/api/messaging/communities?is_public=true" \
  -H "Authorization: Bearer $TOKEN" | jq

# Expected: Returns array of public communities
```

### Test 7: Join Community

```bash
# Join a community (use community ID from Test 5)
COMM_ID="community-uuid-here"

curl -X POST http://localhost:8000/api/messaging/communities/$COMM_ID/join \
  -H "Authorization: Bearer $TOKEN" | jq

# Expected: Returns membership object with role = 'member'
```

### Test 8: Send Community Message

```bash
# Send a community message
curl -X POST http://localhost:8000/api/messaging/communities/$COMM_ID/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello community! This is a test message."
  }' | jq

# Expected: Returns message object with ID
```

### Test 9: Send Community Message with Reply

```bash
# Reply to a message (use message ID from Test 8)
MSG_ID="message-uuid-here"

curl -X POST http://localhost:8000/api/messaging/communities/$COMM_ID/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is a reply to the previous message.",
    "reply_to_id": "'$MSG_ID'"
  }' | jq

# Expected: Returns message object with reply_to_id set
```

### Test 10: Edit Message

```bash
# Edit a message
curl -X PUT http://localhost:8000/api/messaging/messages/$MSG_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is an edited message."
  }' | jq

# Expected: Returns updated message with is_edited = true
```

### Test 11: Delete Message

```bash
# Delete a message
curl -X DELETE http://localhost:8000/api/messaging/messages/$MSG_ID \
  -H "Authorization: Bearer $TOKEN" | jq

# Expected: Returns { "success": true }
```

### Test 12: Leave Community

```bash
curl -X DELETE http://localhost:8000/api/messaging/communities/$COMM_ID/leave \
  -H "Authorization: Bearer $TOKEN" | jq

# Expected: Returns { "success": true }
```

### Test 13: Unauthorized Access

```bash
# Try to access without token
curl -X GET http://localhost:8000/api/messaging/conversations

# Expected: 401 Unauthorized

# Try with invalid token
curl -X GET http://localhost:8000/api/messaging/conversations \
  -H "Authorization: Bearer invalid-token"

# Expected: 401 Unauthorized
```

---

## ⚛️ Frontend Testing

### Test 1: Real-time Hook - useMessages

```typescript
import { useMessages } from '../hooks/useMessaging';

function TestMessaging() {
  const conversationId = 'conversation-uuid-here';
  const { messages, loading, error, sendMessage } = useMessages(conversationId);

  useEffect(() => {
    console.log('Messages:', messages);
    console.log('Loading:', loading);
    console.log('Error:', error);
  }, [messages, loading, error]);

  const handleSend = async () => {
    try {
      await sendMessage('Test message from React');
      console.log('Message sent!');
    } catch (err) {
      console.error('Failed to send:', err);
    }
  };

  return (
    <div>
      <h1>Messages: {messages.length}</h1>
      <ul>
        {messages.map((msg) => (
          <li key={msg.id}>{msg.content}</li>
        ))}
      </ul>
      <button onClick={handleSend}>Send Test Message</button>
    </div>
  );
}

// Test:
// 1. Render component
// 2. Wait for messages to load (loading should become false)
// 3. Click button to send message
// 4. Message should appear in the list immediately
// 5. Open another browser tab - message should appear there too (real-time)
```

### Test 2: Real-time Hook - useCommunityMessages

```typescript
import { useCommunityMessages } from '../hooks/useMessaging';

function TestCommunityChat() {
  const communityId = 'community-uuid-here';
  const { messages, loading, sendCommunityMessage } = useCommunityMessages(communityId);

  const handleSend = async () => {
    try {
      await sendCommunityMessage(communityId, 'Test community message');
      console.log('Community message sent!');
    } catch (err) {
      console.error('Failed to send:', err);
    }
  };

  return (
    <div>
      <h1>Community Messages: {messages.length}</h1>
      <ul>
        {messages.map((msg) => (
          <li key={msg.id}>
            {msg.content} {msg.reply_to_id && '(Reply)'}
          </li>
        ))}
      </ul>
      <button onClick={handleSend}>Send Community Message</button>
    </div>
  );
}

// Test:
// 1. Join a community first (use joinCommunity helper)
// 2. Render component
// 3. Wait for messages to load
// 4. Click button to send message
// 5. Message should appear in the list
// 6. Test reply by passing reply_to_id
```

### Test 3: Helper Functions

```typescript
import {
  createOrGetConversation,
  joinCommunity,
  leaveCommunity,
} from '../hooks/useMessaging';

async function testHelperFunctions() {
  // Test 1: Create/get conversation
  console.log('Test 1: Create conversation');
  const conversationId = await createOrGetConversation('other-user-uuid');
  console.log('Conversation ID:', conversationId);

  // Call again - should return same ID
  const conversationId2 = await createOrGetConversation('other-user-uuid');
  console.assert(conversationId === conversationId2, 'IDs should match');

  // Test 2: Join community
  console.log('Test 2: Join community');
  await joinCommunity('community-uuid');
  console.log('Joined successfully');

  // Test 3: Leave community
  console.log('Test 3: Leave community');
  await leaveCommunity('community-uuid');
  console.log('Left successfully');
}

// Run: testHelperFunctions().catch(console.error);
```

### Test 4: Component Integration Test

```typescript
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import MessagingPage from '../pages/MessagingPage';

test('renders messaging page with tabs', () => {
  render(<MessagingPage />);
  
  // Check tabs are present
  expect(screen.getByText('Direct Messages')).toBeInTheDocument();
  expect(screen.getByText('Communities')).toBeInTheDocument();
});

test('switches between tabs', async () => {
  render(<MessagingPage />);
  
  // Click Communities tab
  fireEvent.click(screen.getByText('Communities'));
  
  // Check if community content is visible
  await waitFor(() => {
    expect(screen.getByText('Select a community')).toBeInTheDocument();
  });
});

test('displays conversations in sidebar', async () => {
  render(<MessagingPage />);
  
  // Wait for conversations to load
  await waitFor(() => {
    expect(screen.getByText('Search conversations...')).toBeInTheDocument();
  });
});
```

---

## 🔄 Real-time Testing

### Test 1: Multi-Tab Real-time Updates

**Steps:**
1. Open app in Browser Tab 1 (logged in as User 1)
2. Open app in Browser Tab 2 (logged in as User 2)
3. Navigate both to `/messages`
4. User 1: Create conversation with User 2
5. User 1: Send message "Hello from User 1"
6. **Expected:** User 2 should see the message appear immediately in Tab 2
7. User 2: Reply with "Hello from User 2"
8. **Expected:** User 1 should see the reply appear immediately in Tab 1

### Test 2: Community Real-time Updates

**Steps:**
1. Open app in Browser Tab 1 (User 1)
2. Open app in Browser Tab 2 (User 2)
3. Both navigate to Communities tab
4. User 1: Create public community "Test Group"
5. **Expected:** User 2 should see "Test Group" appear in community list (may need manual refresh)
6. User 2: Join "Test Group"
7. User 1: Send message in "Test Group"
8. **Expected:** User 2 should see the message appear immediately

### Test 3: Message Editing Real-time

**Steps:**
1. Open two tabs with same community chat
2. Send message in Tab 1
3. Edit the message in Tab 1
4. **Expected:** Tab 2 should show the edited message with "(edited)" indicator

### Test 4: Subscription Cleanup (Memory Leak Test)

**Steps:**
1. Open DevTools → Performance tab
2. Navigate to messaging page
3. Select a conversation
4. Take heap snapshot
5. Navigate away from messaging page
6. Take another heap snapshot
7. **Expected:** Realtime subscriptions should be cleaned up (no detached DOM nodes)

---

## 🚀 Load Testing

### Test 1: Concurrent Users (Using Apache Bench)

```bash
# Test sending messages with 10 concurrent users
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" \
  -p message.json -T application/json \
  http://localhost:8000/api/messaging/conversations/$CONV_ID/messages

# message.json contains:
# {"content": "Load test message"}

# Expected: <1 second average response time
```

### Test 2: Message Pagination Performance

```bash
# Create 1000 test messages (run in loop)
for i in {1..1000}; do
  curl -X POST http://localhost:8000/api/messaging/conversations/$CONV_ID/messages \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"content\": \"Test message $i\"}"
done

# Test pagination performance
time curl -X GET "http://localhost:8000/api/messaging/conversations/$CONV_ID/messages?limit=50" \
  -H "Authorization: Bearer $TOKEN"

# Expected: <200ms response time
```

### Test 3: Database Query Performance

```sql
-- Test message retrieval with large dataset
EXPLAIN ANALYZE
SELECT m.* FROM messages m
JOIN conversation_members cm ON cm.conversation_id = m.conversation_id
WHERE cm.user_id = 'user-uuid'
ORDER BY m.created_at DESC
LIMIT 50;

-- Expected: Should use index, <10ms execution time
```

---

## 🐛 Error Handling Tests

### Test 1: Send Message to Non-existent Conversation

```bash
curl -X POST http://localhost:8000/api/messaging/conversations/invalid-uuid/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test"}' | jq

# Expected: 404 Not Found
```

### Test 2: Send Message to Conversation You're Not In

```bash
# Use conversation ID where user is not a member
curl -X POST http://localhost:8000/api/messaging/conversations/$OTHER_CONV_ID/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test"}' | jq

# Expected: 403 Forbidden (blocked by RLS)
```

### Test 3: Edit Someone Else's Message

```bash
# Try to edit a message sent by another user
curl -X PUT http://localhost:8000/api/messaging/messages/$OTHER_USER_MSG_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Hacked!"}' | jq

# Expected: 403 Forbidden (blocked by RLS)
```

### Test 4: Join Private Community Without Permission

```bash
# Try to join a private community
curl -X POST http://localhost:8000/api/messaging/communities/$PRIVATE_COMM_ID/join \
  -H "Authorization: Bearer $TOKEN" | jq

# Expected: Should fail (depends on implementation - could be 403 or require invite)
```

### Test 5: Send Empty Message

```bash
curl -X POST http://localhost:8000/api/messaging/conversations/$CONV_ID/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": ""}' | jq

# Expected: 422 Unprocessable Entity (validation error)
```

---

## 📊 Monitoring & Logging Tests

### Test 1: Check API Response Times

```bash
# Use curl's timing feature
curl -w "@curl-format.txt" -o /dev/null -s \
  -X GET http://localhost:8000/api/messaging/conversations \
  -H "Authorization: Bearer $TOKEN"

# curl-format.txt contains:
# time_total: %{time_total}s\n

# Expected: <200ms for most endpoints
```

### Test 2: Check Error Logs

```bash
# Check backend logs for errors
tail -f backend_logs.txt | grep ERROR

# Send invalid requests and verify errors are logged
```

### Test 3: Monitor Database Connections

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'postgres';

-- Expected: Should not exceed connection pool limit
```

---

## ✅ Testing Checklist

Use this checklist to verify all tests pass:

### Database
- [ ] All 6 tables created
- [ ] RLS enabled on all tables
- [ ] get_or_create_conversation() works
- [ ] Triggers update timestamps
- [ ] Triggers update member_count
- [ ] Unauthorized access blocked by RLS

### Backend API
- [ ] All endpoints return 200/201 for valid requests
- [ ] Unauthorized requests return 401
- [ ] Invalid data returns 422
- [ ] Non-existent resources return 404
- [ ] RLS blocks unauthorized access (403)
- [ ] Response times <200ms

### Frontend
- [ ] useMessages hook loads messages
- [ ] useCommunityMessages hook loads community messages
- [ ] Real-time updates work in multiple tabs
- [ ] Subscriptions cleaned up on unmount
- [ ] Error states display correctly
- [ ] Loading states display correctly

### Real-time
- [ ] Messages appear instantly in other tabs
- [ ] Message edits appear instantly
- [ ] Member count updates instantly
- [ ] No duplicate messages
- [ ] Graceful reconnection on network loss

### Performance
- [ ] 1000 messages load in <1 second
- [ ] Database queries use indexes
- [ ] No memory leaks (subscription cleanup)
- [ ] Pagination works correctly

### Security
- [ ] Cannot access others' conversations
- [ ] Cannot edit others' messages
- [ ] Cannot join private communities
- [ ] Cannot view private community messages
- [ ] JWT validation works
- [ ] Expired tokens rejected

---

## 🎉 Conclusion

If all tests pass, your Messaging System is **production-ready**! 🚀

For any failures, refer to the Troubleshooting section in `MESSAGING_SYSTEM.md`.
