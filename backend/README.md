# SmartNoteX Backend API

AI-Powered Engineering Notebook Backend built with FastAPI.

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- PostgreSQL 12+ (or Supabase PostgreSQL)
- Upstash Redis (for Celery workers) - https://console.upstash.com/
- Supabase account (for file storage) - https://supabase.com/

### Installation

1. **Create virtual environment:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Create database:**
```bash
# Create PostgreSQL database
createdb smartnotex_db

# Run migrations (when Alembic is set up)
alembic upgrade head

# Initialize pgvector extension and embeddings table
python init_vector_db.py
```

5. **Run the server:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/           # API route handlers
│   ├── auth/          # Authentication utilities
│   ├── models/        # SQLAlchemy database models
│   ├── schemas/       # Pydantic request/response schemas
│   ├── services/      # Business logic services
│   ├── utils/         # Utility functions
│   ├── config.py      # Configuration management
│   ├── database.py    # Database connection
│   └── main.py        # FastAPI application
├── alembic/           # Database migrations
├── requirements.txt   # Python dependencies
└── README.md
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Register a new user:
```bash
POST /api/auth/register
{
  "email": "student@example.com",
  "password": "securepassword",
  "full_name": "John Doe"
}
```

### Login:
```bash
POST /api/auth/login
{
  "email": "student@example.com",
  "password": "securepassword"
}
```

Returns:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

### Use token in requests:
```bash
Authorization: Bearer <access_token>
```

## 📚 API Endpoints

### Notebooks
- `POST /api/notebooks` - Create notebook
- `GET /api/notebooks` - List all notebooks
- `GET /api/notebooks/{id}` - Get notebook
- `PUT /api/notebooks/{id}` - Update notebook
- `DELETE /api/notebooks/{id}` - Delete notebook

### Chapters
- `POST /api/chapters?notebook_id={id}` - Create chapter
- `GET /api/chapters/notebook/{notebook_id}` - List chapters
- `GET /api/chapters/{id}` - Get chapter
- `PUT /api/chapters/{id}` - Update chapter
- `DELETE /api/chapters/{id}` - Delete chapter

### Notes
- `POST /api/notes` - Create note
- `GET /api/notes/chapter/{chapter_id}` - List notes
- `GET /api/notes/{id}` - Get note
- `PUT /api/notes/{id}` - Update note
- `DELETE /api/notes/{id}` - Delete note

### Note Content
- `POST /api/notes/{note_id}/content` - Add content (text/image/PDF)
- `GET /api/notes/{note_id}/content` - List note contents
- `DELETE /api/notes/content/{content_id}` - Delete content

### Messaging & Community Chat 💬
- `POST /api/messaging/conversations` - Create/get direct conversation
- `GET /api/messaging/conversations` - List user's conversations
- `GET /api/messaging/conversations/{id}/messages` - Get messages
- `POST /api/messaging/conversations/{id}/messages` - Send message
- `POST /api/messaging/communities` - Create community
- `GET /api/messaging/communities` - List communities
- `POST /api/messaging/communities/{id}/join` - Join community
- `POST /api/messaging/communities/{id}/messages` - Send community message

> **Full Messaging API Documentation:** See [MESSAGING_SYSTEM.md](MESSAGING_SYSTEM.md) for complete documentation including 15+ endpoints, real-time features, and security details.

## 🗄️ Database Schema

### Users
- id, email, hashed_password, full_name, is_active, is_verified, timestamps

### Notebooks
- id, title, description, color, owner_id, timestamps

### Chapters
- id, title, description, order_index, notebook_id, timestamps

### Notes
- id, title, chapter_id, is_ai_structured, ai_summary, timestamps

### Note Contents
- id, note_id, content_type, content, file_url, file_name, file_size, order_index, metadata

### Shares
- id, share_type, resource_id, shared_by_user_id, shared_with_user_id, permission, is_public, share_token, expires_at

## 🔧 Development

### Running Tests
```bash
pytest
```

### Database Migrations
```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migration
alembic upgrade head

# Rollback
alembic downgrade -1
```

## 📝 Environment Variables

See `.env.example` for all required environment variables.

## 🚧 Next Steps

- [ ] Set up Alembic migrations
- [ ] Implement AI note structuring service
- [x] Add vector database integration (pgvector in Supabase)
- [ ] Implement RAG doubt solver
- [ ] Add sharing functionality
- [ ] Set up Celery workers for background tasks
- [x] **Messaging & Community Chat System** - Complete with 1-1 chat, communities, real-time updates, RLS security

## 📖 Additional Documentation

- **[MESSAGING_SYSTEM.md](MESSAGING_SYSTEM.md)** - Complete messaging system documentation (8000+ words)
- **[MESSAGING_QUICKSTART.md](MESSAGING_QUICKSTART.md)** - 5-minute quick start guide
- **[MESSAGING_DEPLOYMENT.md](MESSAGING_DEPLOYMENT.md)** - Production deployment checklist
- **[MESSAGING_IMPLEMENTATION_SUMMARY.md](MESSAGING_IMPLEMENTATION_SUMMARY.md)** - Implementation overview
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Overall system architecture
- **[PGVECTOR_MIGRATION.md](PGVECTOR_MIGRATION.md)** - Vector database setup guide

