# SmartNoteX Backend Architecture

## 📐 System Design

### Overview
SmartNoteX backend is built with **FastAPI** following a clean, modular architecture that separates concerns and enables scalability.

### Architecture Layers

```
┌─────────────────────────────────────┐
│         API Layer (FastAPI)        │
│  - auth.py, notebooks.py, etc.     │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│      Schema Layer (Pydantic)        │
│  - Request/Response validation      │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│    Service Layer (Business Logic)    │
│  - AI processing, file handling     │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│     Model Layer (SQLAlchemy)        │
│  - Database models & relationships   │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│      Database (PostgreSQL)          │
└─────────────────────────────────────┘
```

## 🗄️ Database Schema Design

### Entity Relationship Diagram

```
Users (1) ──< (N) Notebooks
                    │
                    └──< (N) Chapters
                              │
                              └──< (N) Notes
                                        │
                                        └──< (N) NoteContents

Users (1) ──< (N) Shares ──> (1) Notes/Notebooks/Chapters
```

### Core Tables

#### 1. **Users**
- **Purpose**: User authentication and profile management
- **Key Fields**: `id`, `email`, `hashed_password`, `full_name`
- **Relationships**: 
  - One-to-Many with Notebooks (owner)
  - One-to-Many with Shares (shared_by_user)

#### 2. **Notebooks**
- **Purpose**: Represent subjects/courses (e.g., "Data Structures")
- **Key Fields**: `id`, `title`, `description`, `color`, `owner_id`
- **Relationships**:
  - Many-to-One with Users (owner)
  - One-to-Many with Chapters

#### 3. **Chapters**
- **Purpose**: Organize content within a notebook
- **Key Fields**: `id`, `title`, `description`, `order_index`, `notebook_id`
- **Relationships**:
  - Many-to-One with Notebooks
  - One-to-Many with Notes

#### 4. **Notes**
- **Purpose**: Individual note entries
- **Key Fields**: `id`, `title`, `chapter_id`, `is_ai_structured`, `ai_summary`
- **Relationships**:
  - Many-to-One with Chapters
  - One-to-Many with NoteContents
  - One-to-Many with Shares

#### 5. **NoteContents**
- **Purpose**: Store different content types (text, images, PDFs, videos, links)
- **Key Fields**: `id`, `note_id`, `content_type`, `content`, `file_url`, `order_index`
- **Content Types**: TEXT, IMAGE, PDF, VIDEO, WEB_LINK, SCREENSHOT
- **Relationships**: Many-to-One with Notes

#### 6. **Shares**
- **Purpose**: Enable sharing of notes/notebooks
- **Key Fields**: `id`, `share_type`, `resource_id`, `shared_by_user_id`, `is_public`, `share_token`
- **Share Types**: NOTE, NOTEBOOK, CHAPTER
- **Permissions**: VIEW_ONLY, COMMENT, EDIT

## 🔐 Authentication Flow

### JWT-Based Authentication

1. **Registration**:
   ```
   POST /api/auth/register
   → Hash password with bcrypt
   → Create user in database
   → Return user object
   ```

2. **Login**:
   ```
   POST /api/auth/login
   → Verify email/password
   → Generate JWT token (24h expiry)
   → Return access_token
   ```

3. **Protected Routes**:
   ```
   Request with: Authorization: Bearer <token>
   → Validate token
   → Extract user email
   → Load user from database
   → Inject user into route handler
   ```

### Security Features
- **Password Hashing**: Bcrypt with automatic salt
- **Token Expiry**: Configurable (default 24 hours)
- **Token Validation**: Automatic via FastAPI dependencies
- **User Status Check**: Active/inactive account validation

## 📁 File Storage Architecture

### Supabase Storage Integration

- **Storage Service**: Supabase Storage
- **File Organization**:
  ```
  supabase-storage://smartnotex-files/
    ├── images/          # Screenshots, uploaded images
    ├── pdfs/            # PDF documents
    └── videos/          # Video files (future)
  ```

- **File Upload Flow**:
  1. Client uploads file via multipart/form-data
  2. Backend receives file bytes
  3. Generate unique filename (UUID)
  4. Upload to Supabase Storage with proper content-type
  5. Store public URL in database
  6. Return content object to client

- **File Deletion**:
  - Automatic cleanup when note/content is deleted
  - Supabase Storage file deletion on content removal

## 🔄 API Design Patterns

### RESTful Endpoints

All endpoints follow REST conventions:

- **Create**: `POST /api/resource`
- **Read (List)**: `GET /api/resource`
- **Read (Single)**: `GET /api/resource/{id}`
- **Update**: `PUT /api/resource/{id}`
- **Delete**: `DELETE /api/resource/{id}`

### Response Patterns

- **Success (200)**: Return resource object
- **Created (201)**: Return created resource
- **No Content (204)**: Delete operations
- **Error (400/401/403/404)**: JSON error message

### Authorization Pattern

All protected routes use dependency injection:

```python
async def endpoint(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # User is authenticated and active
    # Access user.id, user.email, etc.
```

## 🧩 Code Organization

### Directory Structure

```
backend/
├── app/
│   ├── api/              # Route handlers
│   │   ├── auth.py       # Authentication endpoints
│   │   ├── notebooks.py  # Notebook CRUD
│   │   ├── chapters.py   # Chapter CRUD
│   │   └── notes.py      # Note CRUD + file upload
│   │
│   ├── auth/             # Authentication utilities
│   │   ├── security.py   # Password hashing, JWT
│   │   └── dependencies.py # Auth dependencies
│   │
│   ├── models/           # SQLAlchemy models
│   │   ├── user.py
│   │   ├── notebook.py
│   │   ├── chapter.py
│   │   ├── note.py
│   │   ├── note_content.py
│   │   └── share.py
│   │
│   ├── schemas/          # Pydantic schemas
│   │   ├── user.py
│   │   ├── notebook.py
│   │   ├── chapter.py
│   │   ├── note.py
│   │   └── note_content.py
│   │
│   ├── utils/            # Utility functions
│   │   └── file_storage.py # S3 operations
│   │
│   ├── config.py         # Configuration management
│   ├── database.py       # DB connection & session
│   └── main.py           # FastAPI app initialization
│
├── alembic/              # Database migrations
├── requirements.txt      # Dependencies
└── README.md            # Documentation
```

### Design Principles

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Dependency Injection**: FastAPI's Depends() for clean dependencies
3. **Type Safety**: Pydantic schemas for validation
4. **Database Abstraction**: SQLAlchemy ORM for database operations
5. **Error Handling**: Consistent HTTP exceptions
6. **Scalability**: Modular design allows horizontal scaling

## 🚀 Future Enhancements

### Phase 2: AI Integration
- **Note Structuring Service**: Process raw notes into structured format
- **Embedding Generation**: Create vector embeddings for RAG
- **Vector Database**: pgvector extension in Supabase PostgreSQL
- **RAG Pipeline**: Personal note-based question answering

### Phase 3: Background Workers
- **Celery Workers**: Async processing for:
  - OCR (handwritten notes)
  - PDF text extraction
  - Embedding generation
  - AI summarization

### Phase 4: Sharing & Collaboration
- **Public Links**: Token-based sharing
- **Permissions**: View/Comment/Edit levels
- **Access Control**: User-based and public sharing

## 🔧 Configuration Management

### Environment Variables

All configuration via `.env` file:
- **Database**: PostgreSQL connection string
- **JWT**: Secret key, algorithm, expiry
- **AWS**: S3 credentials and bucket
- **AI Services**: HuggingFace (local models or Inference API for embeddings)
- **Redis (Upstash)**: Celery broker URL - Get from https://console.upstash.com/

### Settings Pattern

Uses Pydantic Settings for type-safe configuration:
- Automatic validation
- Type conversion
- Environment variable loading
- Default values

## 📊 Performance Considerations

### Database Optimization
- **Indexes**: On foreign keys and frequently queried fields
- **Lazy Loading**: SQLAlchemy relationships loaded on demand
- **Connection Pooling**: Configured in database engine

### File Handling
- **Streaming**: Large file uploads handled efficiently
- **Async I/O**: FastAPI async endpoints for non-blocking operations
- **S3 Direct Upload**: Future enhancement for client-side uploads

### Caching Strategy (Future)
- **Redis (Upstash)**: Cache frequently accessed data
- **Token Caching**: Reduce database queries for auth
- **Note Caching**: Cache structured notes

## 🛡️ Security Best Practices

1. **Password Security**: Bcrypt hashing with salt
2. **JWT Tokens**: Secure token generation and validation
3. **SQL Injection**: SQLAlchemy ORM prevents injection
4. **File Upload**: Validate file types and sizes
5. **CORS**: Configured for specific origins
6. **Environment Secrets**: Never commit .env files

## 📝 API Documentation

FastAPI automatically generates:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **OpenAPI Schema**: `http://localhost:8000/openapi.json`

All endpoints are self-documenting with:
- Request/response schemas
- Parameter descriptions
- Example values
- Error responses

