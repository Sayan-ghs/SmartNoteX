"""
Initialize pgvector extension and embeddings table.
Run this once after setting up the database.
"""
from app.database import SessionLocal
from app.services.vector_service import VectorService
from app.services.embedding_service import embedding_service

if __name__ == "__main__":
    db = SessionLocal()
    try:
        print("Initializing pgvector extension...")
        vector_service = VectorService(db)
        
        # Enable pgvector extension (usually already enabled in Supabase)
        vector_service.ensure_extension_enabled()
        print("✓ pgvector extension ready")
        
        # Get embedding dimension from embedding service
        embedding_dimension = embedding_service.dimension
        print(f"Using embedding dimension: {embedding_dimension}")
        
        # Create embeddings table with correct dimension
        print("Creating embeddings table...")
        vector_service.create_embeddings_table_if_not_exists(dimension=embedding_dimension)
        print("✓ Embeddings table created")
        
        print("\nVector database initialization complete!")
        print(f"You can now store and search embeddings using pgvector (dimension: {embedding_dimension}).")
        
    except Exception as e:
        print(f"Error initializing vector database: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

