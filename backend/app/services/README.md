# Vector Services

This directory contains services for vector operations using pgvector in Supabase PostgreSQL.

## Services

### VectorService (`vector_service.py`)

Handles storing and searching embeddings using pgvector extension.

**Key Methods:**
- `ensure_extension_enabled()` - Enable pgvector extension
- `create_embeddings_table_if_not_exists()` - Create embeddings table
- `store_embedding()` - Store an embedding vector
- `search_similar()` - Search for similar embeddings
- `delete_embeddings_by_note_id()` - Delete embeddings for a note
- `get_embeddings_by_note_id()` - Get all embeddings for a note

### EmbeddingService (`embedding_service.py`)

Handles generating embeddings using HuggingFace (local models or Inference API).

**Key Methods:**
- `generate_embedding()` - Generate embedding for a single text
- `generate_embeddings_batch()` - Generate embeddings for multiple texts
- `chunk_text()` - Split text into chunks for embedding

## Usage Example

```python
from app.database import get_db
from app.services.vector_service import VectorService
from app.services.embedding_service import embedding_service

# Get database session
db = next(get_db())

# Initialize services
vector_service = VectorService(db)
embedding_service = embedding_service

# Generate embedding for text
text = "This is a note about data structures"
embedding = embedding_service.generate_embedding(text)

# Store embedding
embedding_id = vector_service.store_embedding(
    note_id=1,
    content_text=text,
    embedding=embedding,
    metadata={"source": "user_note"}
)

# Search for similar content
query_text = "data structures"
query_embedding = embedding_service.generate_embedding(query_text)

similar_results = vector_service.search_similar(
    query_embedding=query_embedding,
    limit=5,
    threshold=0.7
)

# Results contain: id, note_id, content_text, metadata, similarity
for result in similar_results:
    print(f"Similarity: {result['similarity']:.2f}")
    print(f"Content: {result['content_text']}")
```

## Database Setup

Run the initialization script to set up pgvector:

```bash
python init_vector_db.py
```

This will:
1. Enable pgvector extension (if not already enabled in Supabase)
2. Create the `note_embeddings` table
3. Create the vector similarity index

## Notes

- pgvector extension is pre-enabled in Supabase PostgreSQL
- Embeddings use HuggingFace models (default: all-MiniLM-L6-v2, 384 dimensions)
- Supports both local models (sentence-transformers) and HuggingFace Inference API
- Similarity search uses cosine distance (via `<=>` operator)
- IVFFlat index is used for fast approximate nearest neighbor search

