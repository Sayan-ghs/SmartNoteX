# Migration: Pinecone → pgvector (Supabase)

## Overview

The vector database has been migrated from Pinecone to Supabase's built-in pgvector extension. This provides a more integrated solution since we're already using Supabase for storage and database.

## Changes Made

### 1. Dependencies (`requirements.txt`)
- ❌ Removed: `pinecone-client==2.2.4`
- ✅ Added: `pgvector==0.2.4` (for SQLAlchemy support, optional)

### 2. Configuration (`app/config.py`)
- ❌ Removed Pinecone settings:
  - `PINECONE_API_KEY`
  - `PINECONE_ENVIRONMENT`
  - `PINECONE_INDEX_NAME`
- ✅ No additional config needed (uses existing `DATABASE_URL`)

### 3. New Services Created

#### `app/services/vector_service.py`
- `VectorService` class for pgvector operations
- Methods for storing, searching, and managing embeddings
- Uses raw SQL queries with pgvector operators

#### `app/services/embedding_service.py`
- `EmbeddingService` class for generating embeddings
- Uses HuggingFace embedding models (default: all-MiniLM-L6-v2)
- Includes text chunking utilities

### 4. Database Initialization
- Created `init_vector_db.py` script
- Enables pgvector extension
- Creates `note_embeddings` table with vector column
- Sets up IVFFlat index for similarity search

### 5. Environment Variables (`.env.example`)
- ❌ Removed Pinecone configuration
- ✅ No new variables needed (uses existing database connection)

## Setup Instructions

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Initialize Vector Database
```bash
python init_vector_db.py
```

This will:
- Enable pgvector extension (usually pre-enabled in Supabase)
- Create `note_embeddings` table
- Create similarity search index

### 3. Verify Setup
The embeddings table structure:
```sql
CREATE TABLE note_embeddings (
    id SERIAL PRIMARY KEY,
    note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
    content_text TEXT NOT NULL,
    embedding vector(384),  -- HuggingFace embedding dimension (configurable)
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Usage

### Storing Embeddings

```python
from app.database import get_db
from app.services.vector_service import VectorService
from app.services.embedding_service import embedding_service

db = next(get_db())
vector_service = VectorService(db)

# Generate embedding
text = "Your note content here"
embedding = embedding_service.generate_embedding(text)

# Store embedding
embedding_id = vector_service.store_embedding(
    note_id=1,
    content_text=text,
    embedding=embedding
)
```

### Searching Similar Content

```python
# Generate query embedding
query = "What is a binary tree?"
query_embedding = embedding_service.generate_embedding(query)

# Search for similar notes
results = vector_service.search_similar(
    query_embedding=query_embedding,
    limit=10,
    threshold=0.7
)

for result in results:
    print(f"Similarity: {result['similarity']:.2f}")
    print(f"Note ID: {result['note_id']}")
    print(f"Content: {result['content_text']}")
```

## Advantages of pgvector

1. **Integrated Solution**: Uses the same PostgreSQL database as the rest of the app
2. **No External Service**: No need for separate Pinecone account/API
3. **Cost Effective**: Included with Supabase (no additional vector DB costs)
4. **Simpler Architecture**: One less service to manage
5. **ACID Compliance**: Full transaction support
6. **SQL Native**: Can use SQL queries for complex operations

## Performance Notes

- **IVFFlat Index**: Used for approximate nearest neighbor search
- **Cosine Similarity**: Uses `<=>` operator for fast similarity search
- **Dimension**: 384 (default for all-MiniLM-L6-v2, configurable based on model)
- **Index Lists**: Default 100 lists (can be tuned based on data size)

## Migration from Pinecone

If you have existing Pinecone data, you'll need to:
1. Export embeddings from Pinecone
2. Re-import into pgvector using `vector_service.store_embedding()`
3. Update any code that references Pinecone client

## Next Steps

- [ ] Implement RAG pipeline using vector_service
- [ ] Add background worker for automatic embedding generation
- [ ] Create API endpoints for similarity search
- [ ] Add embedding generation on note creation/update

