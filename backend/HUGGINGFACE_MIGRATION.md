# Migration: OpenAI → HuggingFace

## Overview

The embedding service has been migrated from OpenAI to HuggingFace, using local sentence-transformers models. This provides a cost-effective, privacy-focused solution that doesn't require API calls.

## Changes Made

### 1. Dependencies (`requirements.txt`)
- ❌ Removed: `openai==1.3.5`, `tiktoken==0.5.2`
- ✅ Added: `sentence-transformers==2.2.2`
- Note: `torch` and `transformers` are automatically installed as dependencies

### 2. Configuration (`app/config.py`)
- ❌ Removed: `OPENAI_API_KEY`
- ✅ Added:
  - `HUGGINGFACE_API_KEY` (optional, for future Inference API support)
  - `HUGGINGFACE_EMBEDDING_MODEL` (default: `sentence-transformers/all-MiniLM-L6-v2`)

### 3. Embedding Service (`app/services/embedding_service.py`)
- Complete rewrite to use HuggingFace sentence-transformers
- Supports local models (no API calls required)
- Configurable model selection
- Automatic dimension detection

### 4. Vector Database (`app/services/vector_service.py`)
- Updated default dimension from 1536 (OpenAI) to 384 (all-MiniLM-L6-v2)
- Made dimension configurable based on selected model

### 5. Environment Variables (`.env`)
- Updated to use HuggingFace configuration
- Removed OpenAI API key requirement

## Benefits

1. **Cost Effective**: No API costs - models run locally
2. **Privacy**: Data never leaves your server
3. **No Rate Limits**: Process as many embeddings as needed
4. **Offline Capable**: Works without internet connection
5. **Flexible**: Easy to switch between different embedding models

## Model Options

### Default: `sentence-transformers/all-MiniLM-L6-v2`
- **Dimensions**: 384
- **Speed**: Very fast
- **Quality**: Good for most use cases
- **Size**: ~80MB

### Alternative: `sentence-transformers/all-mpnet-base-v2`
- **Dimensions**: 768
- **Speed**: Moderate
- **Quality**: Better semantic understanding
- **Size**: ~420MB

### Alternative: `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`
- **Dimensions**: 384
- **Speed**: Fast
- **Quality**: Good, supports 50+ languages
- **Size**: ~420MB

## Setup Instructions

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

This will install:
- `sentence-transformers` (and its dependencies: torch, transformers, etc.)

### 2. Configure Model (Optional)
Edit `.env`:
```env
HUGGINGFACE_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

### 3. Initialize Database
```bash
python init_vector_db.py
```

This will create the embeddings table with the correct dimension for your selected model.

## Usage

### Basic Usage
```python
from app.services.embedding_service import embedding_service

# Generate embedding
text = "Your note content here"
embedding = embedding_service.generate_embedding(text)
print(f"Embedding dimension: {len(embedding)}")

# Batch processing
texts = ["Text 1", "Text 2", "Text 3"]
embeddings = embedding_service.generate_embeddings_batch(texts)
```

### With Vector Service
```python
from app.database import get_db
from app.services.vector_service import VectorService
from app.services.embedding_service import embedding_service

db = next(get_db())
vector_service = VectorService(db)

# Generate and store embedding
text = "Your note content"
embedding = embedding_service.generate_embedding(text)
vector_service.store_embedding(
    note_id=1,
    content_text=text,
    embedding=embedding
)
```

## Model Download

The first time you use a model, sentence-transformers will automatically download it from HuggingFace Hub. Models are cached in:
- **Linux/Mac**: `~/.cache/huggingface/`
- **Windows**: `C:\Users\<username>\.cache\huggingface\`

## Performance Considerations

1. **First Run**: Model download and initialization takes time (~30 seconds)
2. **Subsequent Runs**: Models load from cache quickly (~2-5 seconds)
3. **Memory**: Models require RAM (80MB - 500MB depending on model)
4. **CPU/GPU**: Works on CPU, but GPU acceleration available if CUDA is installed

## Migration from OpenAI

If you have existing embeddings generated with OpenAI:
1. **Re-generate embeddings**: Old embeddings (1536 dim) won't work with new model (384 dim)
2. **Update database schema**: Run `init_vector_db.py` to recreate table with correct dimension
3. **Re-index**: All existing embeddings need to be regenerated

## Troubleshooting

### Model Download Issues
If model download fails:
1. Check internet connection
2. Verify HuggingFace Hub is accessible
3. Try downloading manually: `python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"`

### Memory Issues
If you run out of memory:
1. Use a smaller model (all-MiniLM-L6-v2)
2. Process embeddings in smaller batches
3. Consider using GPU if available

### Dimension Mismatch
If you get dimension errors:
1. Ensure database table dimension matches model dimension
2. Run `init_vector_db.py` to recreate table with correct dimension
3. Check `HUGGINGFACE_EMBEDDING_MODEL` in `.env` matches your model

## Next Steps

- [ ] Implement automatic embedding generation on note creation
- [ ] Add background worker for batch embedding processing
- [ ] Support model switching without database migration
- [ ] Add embedding quality metrics

