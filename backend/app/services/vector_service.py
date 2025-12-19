"""
Vector database service using pgvector extension in Supabase PostgreSQL.
Handles embeddings storage and similarity search for RAG functionality.
"""
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any


class VectorService:
    """Service for vector operations using pgvector."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def ensure_extension_enabled(self):
        """
        Ensure pgvector extension is enabled in the database.
        This should be run once during database setup.
        """
        try:
            self.db.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            self.db.commit()
        except Exception as e:
            # Extension might already exist or not have permissions
            # In Supabase, pgvector is usually pre-enabled
            self.db.rollback()
            print(f"Note: pgvector extension check: {e}")
    
    def create_embeddings_table_if_not_exists(
        self, 
        table_name: str = "note_embeddings",
        dimension: int = 384
    ):
        """
        Create embeddings table with vector column if it doesn't exist.
        
        Args:
            table_name: Name of the embeddings table
            dimension: Embedding vector dimension (default: 384 for all-MiniLM-L6-v2)
        """
        create_table_sql = f"""
        CREATE TABLE IF NOT EXISTS {table_name} (
            id SERIAL PRIMARY KEY,
            note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
            content_text TEXT NOT NULL,
            embedding vector({dimension}),
            metadata JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create index for similarity search
        CREATE INDEX IF NOT EXISTS {table_name}_embedding_idx 
        ON {table_name} 
        USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100);
        """
        
        try:
            self.db.execute(text(create_table_sql))
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to create embeddings table: {e}")
    
    def store_embedding(
        self,
        note_id: int,
        content_text: str,
        embedding: List[float],
        metadata: Optional[Dict[str, Any]] = None,
        table_name: str = "note_embeddings"
    ) -> int:
        """
        Store an embedding in the database.
        
        Args:
            note_id: ID of the note this embedding belongs to
            content_text: Original text content
            embedding: Vector embedding (list of floats)
            metadata: Optional metadata dictionary
            table_name: Name of the embeddings table
        
        Returns:
            ID of the inserted embedding record
        """
        # Convert embedding list to string format for pgvector
        embedding_str = "[" + ",".join(map(str, embedding)) + "]"
        
        metadata_json = None
        if metadata:
            import json
            metadata_json = json.dumps(metadata)
        
        insert_sql = f"""
        INSERT INTO {table_name} (note_id, content_text, embedding, metadata)
        VALUES (:note_id, :content_text, :embedding::vector, :metadata::jsonb)
        RETURNING id
        """
        
        result = self.db.execute(
            text(insert_sql),
            {
                "note_id": note_id,
                "content_text": content_text,
                "embedding": embedding_str,
                "metadata": metadata_json
            }
        )
        self.db.commit()
        
        return result.scalar()
    
    def search_similar(
        self,
        query_embedding: List[float],
        limit: int = 10,
        note_id_filter: Optional[int] = None,
        threshold: float = 0.7,
        table_name: str = "note_embeddings"
    ) -> List[Dict[str, Any]]:
        """
        Search for similar embeddings using cosine similarity.
        
        Args:
            query_embedding: Query vector embedding
            limit: Maximum number of results
            note_id_filter: Optional filter by note_id
            threshold: Minimum similarity threshold (0-1)
            table_name: Name of the embeddings table
        
        Returns:
            List of similar embeddings with similarity scores
        """
        embedding_str = "[" + ",".join(map(str, query_embedding)) + "]"
        
        # Build query with optional note_id filter
        where_clause = ""
        params = {
            "embedding": embedding_str,
            "limit": limit,
            "threshold": threshold
        }
        
        if note_id_filter:
            where_clause = "AND note_id = :note_id"
            params["note_id"] = note_id_filter
        
        search_sql = f"""
        SELECT 
            id,
            note_id,
            content_text,
            metadata,
            1 - (embedding <=> :embedding::vector) as similarity
        FROM {table_name}
        WHERE 1 - (embedding <=> :embedding::vector) >= :threshold
        {where_clause}
        ORDER BY embedding <=> :embedding::vector
        LIMIT :limit
        """
        
        result = self.db.execute(text(search_sql), params)
        rows = result.fetchall()
        
        return [
            {
                "id": row[0],
                "note_id": row[1],
                "content_text": row[2],
                "metadata": row[3] if row[3] else {},
                "similarity": float(row[4])
            }
            for row in rows
        ]
    
    def delete_embeddings_by_note_id(
        self,
        note_id: int,
        table_name: str = "note_embeddings"
    ) -> int:
        """
        Delete all embeddings for a specific note.
        
        Args:
            note_id: ID of the note
            table_name: Name of the embeddings table
        
        Returns:
            Number of deleted embeddings
        """
        delete_sql = f"DELETE FROM {table_name} WHERE note_id = :note_id"
        result = self.db.execute(text(delete_sql), {"note_id": note_id})
        self.db.commit()
        
        return result.rowcount
    
    def get_embeddings_by_note_id(
        self,
        note_id: int,
        table_name: str = "note_embeddings"
    ) -> List[Dict[str, Any]]:
        """
        Get all embeddings for a specific note.
        
        Args:
            note_id: ID of the note
            table_name: Name of the embeddings table
        
        Returns:
            List of embeddings for the note
        """
        select_sql = f"""
        SELECT id, content_text, metadata, created_at
        FROM {table_name}
        WHERE note_id = :note_id
        ORDER BY created_at
        """
        
        result = self.db.execute(text(select_sql), {"note_id": note_id})
        rows = result.fetchall()
        
        return [
            {
                "id": row[0],
                "content_text": row[1],
                "metadata": row[2] if row[2] else {},
                "created_at": row[3]
            }
            for row in rows
        ]


def get_vector_service(db: Session) -> VectorService:
    """
    Dependency function to get vector service instance.
    
    Args:
        db: Database session
    
    Returns:
        VectorService instance
    """
    return VectorService(db)

