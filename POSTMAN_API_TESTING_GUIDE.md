# Complete Postman API Testing Guide - NoteX Backend

## 📋 Table of Contents
1. [Setup Postman Environment](#setup-postman-environment)
2. [Authentication Endpoints](#authentication-endpoints)
3. [Messaging Endpoints](#messaging-endpoints)
4. [Notebook & Notes Endpoints](#notebook--notes-endpoints)
5. [Community & RAG Endpoints](#community--rag-endpoints)
6. [Testing Flow](#complete-testing-flow)

---

## 🚀 Setup Postman Environment

### Step 1: Create New Environment
1. Open Postman
2. Click **Environments** (left sidebar)
3. Click **+** to create new environment
4. Name it: `NoteX Local`

### Step 2: Add Environment Variables

| Variable Name | Initial Value | Current Value |
|--------------|---------------|---------------|
| `base_url` | `http://localhost:8000` | `http://localhost:8000` |
| `supabase_url` | `https://mfzpvbqfgwoikrrveoss.supabase.co` | `https://mfzpvbqfgwoikrrveoss.supabase.co` |
| `supabase_key` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | (your anon key) |
| `access_token` | (leave empty) | (will be set after login) |
| `user_id` | (leave empty) | (will be set after login) |

### Step 3: Save Environment
Click **Save** and select **NoteX Local** as active environment

---

## 🔐 Authentication Endpoints

### 1. Register New User

**Method:** `POST`  
**URL:** `{{base_url}}/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "test@example.com",
  "password": "Test123456!",
  "username": "testuser",
  "role": "student"
}
```

**Expected Response (201):**
```json
{
  "id": "uuid-here",
  "email": "test@example.com",
  "username": "testuser",
  "role": "student",
  "created_at": "2026-01-11T10:30:00",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Post-Response Script:**
```javascript
// Save token automatically
const response = pm.response.json();
if (response.access_token) {
    pm.environment.set("access_token", response.access_token);
    pm.environment.set("user_id", response.id);
    console.log("✅ Token saved!");
}
```

---

### 2. Login User

**Method:** `POST`  
**URL:** `{{base_url}}/api/auth/login`

**Headers:**
```
Content-Type: application/x-www-form-urlencoded
```

**Body (x-www-form-urlencoded):**
```
username: test@example.com
password: Test123456!
```

**Expected Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "username": "testuser"
  }
}
```

**Post-Response Script:**
```javascript
const response = pm.response.json();
if (response.access_token) {
    pm.environment.set("access_token", response.access_token);
    pm.environment.set("user_id", response.user.id);
    console.log("✅ Logged in! Token saved.");
}
```

---

### 3. Get Current User

**Method:** `GET`  
**URL:** `{{base_url}}/api/auth/me`

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Expected Response (200):**
```json
{
  "id": "uuid-here",
  "email": "test@example.com",
  "username": "testuser",
  "role": "student",
  "created_at": "2026-01-11T10:30:00"
}
```

---

## 💬 Messaging Endpoints

### 4. Get User Conversations

**Method:** `GET`  
**URL:** `{{base_url}}/api/messaging/conversations`

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Expected Response (200):**
```json
[
  {
    "id": "conv-uuid",
    "participant_ids": ["user1-uuid", "user2-uuid"],
    "last_message": "Hello there!",
    "last_message_at": "2026-01-11T10:30:00",
    "unread_count": 2
  }
]
```

---

### 5. Create or Get Conversation

**Method:** `POST`  
**URL:** `{{base_url}}/api/messaging/conversations`

**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "participant_id": "other-user-uuid-here"
}
```

**Expected Response (200/201):**
```json
{
  "id": "conversation-uuid",
  "participant_ids": ["your-uuid", "other-user-uuid"],
  "created_at": "2026-01-11T10:30:00"
}
```

---

### 6. Get Messages in Conversation

**Method:** `GET`  
**URL:** `{{base_url}}/api/messaging/conversations/{{conversation_id}}/messages`

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
```
limit: 50 (optional)
offset: 0 (optional)
```

**Expected Response (200):**
```json
[
  {
    "id": "msg-uuid",
    "conversation_id": "conv-uuid",
    "sender_id": "user-uuid",
    "content": "Hello!",
    "created_at": "2026-01-11T10:30:00",
    "is_read": false
  }
]
```

---

### 7. Send Message

**Method:** `POST`  
**URL:** `{{base_url}}/api/messaging/conversations/{{conversation_id}}/messages`

**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "content": "Hello! This is a test message from Postman."
}
```

**Expected Response (201):**
```json
{
  "id": "msg-uuid",
  "conversation_id": "conv-uuid",
  "sender_id": "your-uuid",
  "content": "Hello! This is a test message from Postman.",
  "created_at": "2026-01-11T10:35:00",
  "is_read": false
}
```

---

### 8. Mark Message as Read

**Method:** `PATCH`  
**URL:** `{{base_url}}/api/messaging/messages/{{message_id}}/read`

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Expected Response (200):**
```json
{
  "message": "Message marked as read"
}
```

---

## 🏘️ Community Endpoints

### 9. Get All Communities

**Method:** `GET`  
**URL:** `{{base_url}}/api/messaging/communities`

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Expected Response (200):**
```json
[
  {
    "id": "community-uuid",
    "name": "General Discussion",
    "description": "Talk about anything!",
    "is_private": false,
    "member_count": 25,
    "created_at": "2026-01-10T08:00:00"
  }
]
```

---

### 10. Create Community

**Method:** `POST`  
**URL:** `{{base_url}}/api/messaging/communities`

**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "name": "Python Study Group",
  "description": "Let's learn Python together!",
  "is_private": false
}
```

**Expected Response (201):**
```json
{
  "id": "community-uuid",
  "name": "Python Study Group",
  "description": "Let's learn Python together!",
  "is_private": false,
  "created_by": "your-uuid",
  "created_at": "2026-01-11T10:40:00"
}
```

---

### 11. Join Community

**Method:** `POST`  
**URL:** `{{base_url}}/api/messaging/communities/{{community_id}}/join`

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Expected Response (200):**
```json
{
  "message": "Joined community successfully"
}
```

---

### 12. Get Community Messages

**Method:** `GET`  
**URL:** `{{base_url}}/api/messaging/communities/{{community_id}}/messages`

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Query Parameters:**
```
limit: 50
offset: 0
```

**Expected Response (200):**
```json
[
  {
    "id": "msg-uuid",
    "community_id": "community-uuid",
    "sender_id": "user-uuid",
    "sender": {
      "username": "testuser",
      "email": "test@example.com"
    },
    "content": "Welcome everyone!",
    "created_at": "2026-01-11T10:45:00"
  }
]
```

---

### 13. Send Community Message

**Method:** `POST`  
**URL:** `{{base_url}}/api/messaging/communities/{{community_id}}/messages`

**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "content": "Hello community! Testing from Postman."
}
```

**Expected Response (201):**
```json
{
  "id": "msg-uuid",
  "community_id": "community-uuid",
  "sender_id": "your-uuid",
  "content": "Hello community! Testing from Postman.",
  "created_at": "2026-01-11T10:50:00"
}
```

---

## 📓 Notebook & Notes Endpoints

### 14. Get All Notebooks

**Method:** `GET`  
**URL:** `{{base_url}}/api/notebooks`

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Expected Response (200):**
```json
[
  {
    "id": "notebook-uuid",
    "title": "Computer Science Notes",
    "description": "My CS course notes",
    "owner_id": "your-uuid",
    "created_at": "2026-01-11T09:00:00",
    "note_count": 10
  }
]
```

---

### 15. Create Notebook

**Method:** `POST`  
**URL:** `{{base_url}}/api/notebooks`

**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "title": "Machine Learning Notes",
  "description": "Notes from ML course"
}
```

**Expected Response (201):**
```json
{
  "id": "notebook-uuid",
  "title": "Machine Learning Notes",
  "description": "Notes from ML course",
  "owner_id": "your-uuid",
  "created_at": "2026-01-11T11:00:00"
}
```

---

### 16. Get Notes in Notebook

**Method:** `GET`  
**URL:** `{{base_url}}/api/notebooks/{{notebook_id}}/notes`

**Headers:**
```
Authorization: Bearer {{access_token}}
```

**Expected Response (200):**
```json
[
  {
    "id": "note-uuid",
    "notebook_id": "notebook-uuid",
    "title": "Introduction to Neural Networks",
    "content": "# Neural Networks\n\nA neural network is...",
    "created_at": "2026-01-11T09:30:00",
    "updated_at": "2026-01-11T10:00:00"
  }
]
```

---

### 17. Create Note

**Method:** `POST`  
**URL:** `{{base_url}}/api/notebooks/{{notebook_id}}/notes`

**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "title": "Gradient Descent",
  "content": "# Gradient Descent\n\nGradient descent is an optimization algorithm..."
}
```

**Expected Response (201):**
```json
{
  "id": "note-uuid",
  "notebook_id": "notebook-uuid",
  "title": "Gradient Descent",
  "content": "# Gradient Descent\n\nGradient descent is...",
  "created_at": "2026-01-11T11:05:00"
}
```

---

## 🤖 RAG & AI Endpoints

### 18. Query RAG System

**Method:** `POST`  
**URL:** `{{base_url}}/api/rag/query`

**Headers:**
```
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "query": "What is gradient descent?",
  "notebook_id": "notebook-uuid",
  "top_k": 5
}
```

**Expected Response (200):**
```json
{
  "answer": "Gradient descent is an optimization algorithm...",
  "sources": [
    {
      "note_id": "note-uuid",
      "title": "Gradient Descent",
      "excerpt": "Gradient descent is...",
      "similarity": 0.89
    }
  ]
}
```

---

## 📦 Complete Testing Flow

### Scenario 1: New User Registration & First Message

1. **Register User** (Request #1)
   - Check: `access_token` is returned
   - Verify: Token is auto-saved to environment

2. **Get Current User** (Request #3)
   - Check: User details are correct
   - Verify: Authorization works

3. **Get Conversations** (Request #4)
   - Check: Returns empty array (new user)

4. **Create Community** (Request #10)
   - Check: Community created successfully
   - Save `community_id` to environment

5. **Join Community** (Request #11)
   - Check: Successfully joined

6. **Send Community Message** (Request #13)
   - Check: Message created
   - Verify: Message appears in community

7. **Get Community Messages** (Request #12)
   - Check: Your message appears
   - Verify: Sender details correct

---

### Scenario 2: Direct Messaging

1. **Login** (Request #2)
   - Use existing credentials

2. **Create Conversation** (Request #5)
   - Provide another user's ID
   - Save `conversation_id`

3. **Send Message** (Request #7)
   - Send test message

4. **Get Messages** (Request #6)
   - Verify message appears

5. **Mark as Read** (Request #8)
   - Mark message as read

---

### Scenario 3: Notebook & RAG Testing

1. **Create Notebook** (Request #15)
   - Save `notebook_id`

2. **Create Notes** (Request #17)
   - Create 3-5 notes with content

3. **Query RAG** (Request #18)
   - Ask question about notes
   - Verify: Relevant results returned

---

## 🎯 Quick Test Checklist

- [ ] Register new user
- [ ] Login user
- [ ] Get current user info
- [ ] Create notebook
- [ ] Create note
- [ ] Get conversations (empty initially)
- [ ] Create community
- [ ] Join community
- [ ] Send community message
- [ ] Get community messages
- [ ] Query RAG system

---

## 🐛 Troubleshooting

### 401 Unauthorized
- Check: `access_token` is set in environment
- Verify: Token format is `Bearer {{access_token}}`
- Try: Login again to get fresh token

### 404 Not Found
- Verify: Backend is running on port 8000
- Check: URL is correct
- Ensure: Endpoint exists (check `/docs`)

### 422 Validation Error
- Check: Request body matches schema
- Verify: All required fields included
- Review: Data types are correct

### CORS Error
- Not applicable in Postman (only browser issue)
- If testing from browser: Check `CORS_ORIGINS` in backend `.env`

---

## 📝 Export/Import Postman Collection

### Export Your Collection:
1. Click on collection name
2. Click **⋮** (three dots)
3. Select **Export**
4. Choose **Collection v2.1**
5. Save as `NoteX_API_Collection.json`

### Share with Team:
Send the exported JSON file to teammates who can import it into their Postman.

---

## 🚀 Advanced Tips

### 1. Collection-Level Authorization
Set authorization at collection level:
- Right-click collection → Edit
- Go to **Authorization** tab
- Type: **Bearer Token**
- Token: `{{access_token}}`
- All requests inherit this!

### 2. Pre-Request Scripts
Auto-refresh token if expired:
```javascript
const tokenExp = pm.environment.get("token_expiry");
if (Date.now() > tokenExp) {
    // Auto-login logic here
}
```

### 3. Test Scripts
Automatic validation:
```javascript
pm.test("Status code is 200", () => {
    pm.response.to.have.status(200);
});

pm.test("Response has data", () => {
    pm.expect(pm.response.json()).to.have.property('data');
});
```

---

## 🎉 You're All Set!

Your backend API is fully testable with Postman. Start with the authentication flow, then test messaging features, and finally explore notebooks and RAG endpoints.

**Quick Start:**
1. Import environment variables
2. Run Request #1 (Register)
3. Run Request #3 (Get User)
4. Explore other endpoints!

Happy Testing! 🚀
