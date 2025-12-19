"""
Service for generating embeddings using HuggingFace.
Supports both local models (sentence-transformers) and HuggingFace Inference API.
"""
from typing import List, Optional
from app.config import settings
import os

# Try to import sentence-transformers for local embeddings
try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False

# Try to import HuggingFace Hub for API-based embeddings
try:
    from huggingface_hub import InferenceClient
    HF_HUB_AVAILABLE = True
except ImportError:
    HF_HUB_AVAILABLE = False


class EmbeddingService:
    """Service for generating text embeddings using HuggingFace."""
    
    def __init__(self):
        self.model_name = settings.HUGGINGFACE_EMBEDDING_MODEL
        self.use_api = bool(settings.HUGGINGFACE_API_KEY)
        self.dimension = self._get_model_dimension()
        
        # Initialize: Use local sentence-transformers model (recommended)
        # Local models are faster, more reliable, and don't require API calls or rate limits
        if SENTENCE_TRANSFORMERS_AVAILABLE:
            print(f"Loading HuggingFace model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            self.client = None
            print(f"✓ Model loaded. Embedding dimension: {self.dimension}")
        else:
            raise ImportError(
                "sentence-transformers is required. "
                "Please install: pip install sentence-transformers"
            )
    
    def _get_model_dimension(self) -> int:
        """
        Get the embedding dimension for the configured model.
        
        Returns:
            Embedding dimension
        """
        # Common model dimensions
        dimension_map = {
            "sentence-transformers/all-MiniLM-L6-v2": 384,
            "sentence-transformers/all-mpnet-base-v2": 768,
            "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2": 384,
            "sentence-transformers/all-MiniLM-L12-v2": 384,
            "intfloat/multilingual-e5-base": 768,
        }
        
        return dimension_map.get(self.model_name, 384)  # Default to 384
    
    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a single text.
        
        Args:
            text: Text to embed
        
        Returns:
            List of float values representing the embedding vector
        """
        # Use local sentence-transformers model (recommended)
        # Local models are faster, more reliable, and don't require API calls
        if self.model:
            embedding = self.model.encode(text, convert_to_numpy=True)
            return embedding.tolist()
        else:
            # Fallback: Load model if not already loaded
            if SENTENCE_TRANSFORMERS_AVAILABLE:
                self.model = SentenceTransformer(self.model_name)
                embedding = self.model.encode(text, convert_to_numpy=True)
                return embedding.tolist()
            else:
                raise ImportError("sentence-transformers is required for embeddings")
    
    def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts in batch.
        
        Args:
            texts: List of texts to embed
        
        Returns:
            List of embedding vectors
        """
        # Use local sentence-transformers model (recommended for batches)
        if self.model:
            embeddings = self.model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
            return embeddings.tolist()
        else:
            # Fallback: Load model if not already loaded
            if SENTENCE_TRANSFORMERS_AVAILABLE:
                self.model = SentenceTransformer(self.model_name)
                embeddings = self.model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
                return embeddings.tolist()
            else:
                raise ImportError("sentence-transformers is required for embeddings")
    
    def chunk_text(
        self,
        text: str,
        max_chunk_size: int = 1000,
        overlap: int = 200
    ) -> List[str]:
        """
        Split text into chunks for embedding.
        
        Args:
            text: Text to chunk
            max_chunk_size: Maximum characters per chunk
            overlap: Number of characters to overlap between chunks
        
        Returns:
            List of text chunks
        """
        if len(text) <= max_chunk_size:
            return [text]
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + max_chunk_size
            
            # Try to break at sentence boundary
            if end < len(text):
                # Look for sentence endings
                for punct in ['. ', '.\n', '! ', '!\n', '? ', '?\n']:
                    last_punct = text.rfind(punct, start, end)
                    if last_punct != -1:
                        end = last_punct + 1
                        break
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            start = end - overlap
        
        return chunks


# Global embedding service instance
embedding_service = EmbeddingService()

