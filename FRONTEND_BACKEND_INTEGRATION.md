# Frontend-Backend Integration Guide

## Overview
This guide explains how to connect the NoteX frontend with the backend messaging system using Supabase.

## Architecture

### Technology Stack
- **Frontend**: React + TypeScript + Vite
- **State Management**: Zustand (for auth state)
- **Real-time**: Supabase Realtime (PostgreSQL subscriptions)
- **Backend**: FastAPI (Python)
- **Database**: Supabase (PostgreSQL + Auth + Storage)

### Data Flow
```
User Action → Frontend Component → Supabase Client → PostgreSQL → Real-time Updates → Frontend
```

## Setup Instructions

### 1. Backend Setup

#### Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Configure Environment Variables
Create a `.env` file in the `backend` directory:

```env
# Database - Get from Supabase Project Settings → Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# JWT Authentication
SECRET_KEY=your-secret-key-here-generate-with-openssl
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Supabase Configuration
# Get from Supabase Project Settings → API
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_KEY=[YOUR-ANON-PUBLIC-KEY]
SUPABASE_SERVICE_KEY=[YOUR-SERVICE-ROLE-KEY]
SUPABASE_STORAGE_BUCKET=smartnotex-files

# HuggingFace (Optional - for AI features)
HUGGINGFACE_API_KEY=
HUGGINGFACE_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# Redis - Get from Upstash or use local Redis
REDIS_URL=redis://localhost:6379

# Application
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

#### Initialize Database
```bash
# Create messaging tables
python init_db.py

# If using vector search features
python init_vector_db.py
```

#### Run Backend Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Configure Environment Variables
Create a `.env` file in the `frontend` directory:

```env
# Supabase Configuration
# Get from Supabase Project Settings → API
VITE_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
VITE_SUPABASE_ANON_KEY=[YOUR-ANON-PUBLIC-KEY]

# Backend API (optional if using FastAPI endpoints directly)
VITE_API_URL=http://localhost:8000
```

#### Run Frontend Development Server
```bash
npm run dev
```

## Integration Components

### 1. Supabase Client (`src/lib/supabase.ts`)

The Supabase client is configured to:
- Connect to your Supabase project
- Handle authentication state
- Provide helper functions for common operations

**Key Functions:**
- `supabase` - Main client instance
- `getCurrentUser()` - Get current authenticated user
- `getAuthToken()` - Get JWT token for API calls
- `signOut()` - Sign out current user

### 2. Authentication Store (`src/stores/useAuthStore.ts`)

Zustand store for managing authentication state:
- Persists auth state to localStorage
- Syncs with Supabase auth state changes
- Provides login/register/logout functions

**Usage:**
```typescript
import { useAuthStore } from '@/stores/useAuthStore';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  
  // Use auth state and methods
}
```

### 3. Messaging Hooks (`src/hooks/useMessaging.ts`)

Real-time messaging hooks with automatic Supabase subscriptions:

#### `useMessages(conversationId)`
For direct messaging:
```typescript
const { messages, loading, sendMessage, fetchMessages } = useMessages(conversationId);
```

#### `useCommunityMessages(communityId)`
For community chat:
```typescript
const { messages, loading, sendMessage, fetchMessages } = useCommunityMessages(communityId);
```

#### `useConversations(userId)`
List user's conversations:
```typescript
const { conversations, loading, fetchConversations } = useConversations(userId);
```

#### `useCommunities(userId)`
List user's communities:
```typescript
const { communities, loading, fetchCommunities } = useCommunities(userId);
```

### 4. Messaging Components

#### MessagingPage (`src/pages/MessagingPage.tsx`)
Main messaging interface with:
- Tab switching (Direct Messages / Communities)
- Search functionality
- New chat/community creation

#### ChatList (`src/components/Messaging/ChatList.tsx`)
Displays list of conversations with:
- Unread message counts
- Last message preview
- Real-time updates

#### ChatWindow (`src/components/Messaging/ChatWindow.tsx`)
Direct messaging interface with:
- Message history
- Real-time message updates
- Send message functionality

#### CommunityList (`src/components/Messaging/CommunityList.tsx`)
Displays list of communities with:
- Member counts
- Public/private indicators
- Unread message counts

#### CommunityChat (`src/components/Messaging/CommunityChat.tsx`)
Community chat interface with:
- Message history with usernames
- Real-time message updates
- Community management buttons

## Database Schema

### Messages Table (Direct Messages)
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id),
    sender_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);
```

### Community Messages Table
```sql
CREATE TABLE community_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id),
    sender_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Real-time Subscriptions

The hooks automatically set up PostgreSQL real-time subscriptions:
- INSERT events → Add new messages
- UPDATE events → Update existing messages
- DELETE events → Remove deleted messages

## Navigation

The Messages page is integrated into the main navigation:

**Sidebar** → Messages (Mail icon)

## Authentication Flow

1. User logs in via Login page
2. Supabase returns JWT token and user data
3. Auth store saves user data and token
4. Token is automatically included in API requests
5. Real-time subscriptions use the same auth session

## Testing

### Test Authentication
1. Register a new account at `/register`
2. Login with credentials at `/login`
3. Check that auth state persists on refresh

### Test Messaging
1. Navigate to Messages page
2. Create a new conversation
3. Send messages
4. Open in another browser/tab to see real-time updates

### Test Community Chat
1. Switch to Communities tab
2. Join or create a community
3. Send messages in community chat
4. Verify real-time updates across multiple users

## Troubleshooting

### Authentication Issues
- Check Supabase URL and API key in `.env`
- Verify JWT secret key matches between frontend/backend
- Check browser console for auth errors

### Real-time Updates Not Working
- Verify Supabase Realtime is enabled in project settings
- Check browser console for subscription errors
- Ensure Row Level Security policies allow subscriptions

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check PostgreSQL is accessible
- Run `python init_db.py` to create tables

### CORS Errors
- Add frontend URL to CORS_ORIGINS in backend `.env`
- Restart backend server after changes

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Messaging (if using FastAPI backend)
- `GET /api/messages/{conversation_id}` - Get messages
- `POST /api/messages` - Send message
- `GET /api/conversations` - Get conversations
- `POST /api/conversations` - Create conversation

### Communities (if using FastAPI backend)
- `GET /api/communities` - Get communities
- `POST /api/communities` - Create community
- `GET /api/communities/{id}/messages` - Get community messages
- `POST /api/communities/{id}/messages` - Send community message
- `POST /api/communities/{id}/join` - Join community
- `POST /api/communities/{id}/leave` - Leave community

## Security

### Row Level Security (RLS)
Supabase RLS policies ensure:
- Users can only read their own messages
- Users can only send messages in conversations they're part of
- Users can only read community messages for communities they've joined

### JWT Authentication
- Tokens expire after 24 hours (configurable)
- Tokens are automatically refreshed by Supabase
- Backend validates tokens on each request

## Next Steps

1. **Set up Supabase Project**
   - Create account at https://supabase.com
   - Create new project
   - Get API keys and database URL

2. **Configure Environment Variables**
   - Fill in `.env` files in both frontend and backend
   - Generate secure SECRET_KEY for JWT

3. **Initialize Database**
   - Run backend database initialization scripts
   - Set up RLS policies in Supabase dashboard

4. **Test Integration**
   - Start backend server
   - Start frontend dev server
   - Test authentication flow
   - Test messaging features

5. **Deploy**
   - Deploy backend to cloud platform (Railway, Render, etc.)
   - Deploy frontend to Vercel/Netlify
   - Update environment variables for production

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Documentation](https://react.dev/)
