"""
RAG (Retrieval-Augmented Generation) service.

Pipeline:
1. Chunk note text
2. Generate embeddings
3. Store in pgvector table
4. For a question, compute query embedding
5. Retrieve similar chunks
6. Ask LLM to answer using only retrieved chunks
"""

from typing import List, Tuple, Dict, Any, Optional

from sqlalchemy.orm import Session

from app.models.note import Note
from app.models.note_content import NoteContent, ContentType
from app.services.embedding_service import embedding_service
from app.services.vector_service import VectorService
from app.services.llm_service import get_llm_service


class RAGService:
    """
    High-level RAG pipeline over user notes.
    This is an INTERNAL service class (never exposed directly to FastAPI schemas).
    """

    def __init__(self, db: Session):
        self.db = db
        self.vector_service = VectorService(db)

    # -------------------------
    # Corpus construction
    # -------------------------
    def build_note_corpus(self, note: Note) -> str:
        """Combine note title + all text-like content blocks."""
        parts: List[str] = []

        if note.title:
            parts.append(f"Title: {note.title}")

        contents: List[NoteContent] = list(note.contents or [])

        for content in contents:
            if (
                content.content_type
                in {
                    ContentType.TEXT,
                    ContentType.WEB_LINK,
                    ContentType.VIDEO,
                }
                and content.content
            ):
                parts.append(content.content)

        return "\n\n".join(parts)

    # -------------------------
    # Indexing
    # -------------------------
    def index_note(self, note: Note) -> int:
        """
        Index a note into pgvector.

        Returns:
            Number of chunks indexed
        """
        # Prevent duplicates
        self.vector_service.delete_embeddings_by_note_id(note.id)

        corpus = self.build_note_corpus(note)
        if not corpus.strip():
            return 0

        chunks = embedding_service.chunk_text(corpus)

        count = 0
        for idx, chunk in enumerate(chunks):
            embedding = embedding_service.generate_embedding(chunk)
            self.vector_service.store_embedding(
                note_id=note.id,
                content_text=chunk,
                embedding=embedding,
                metadata={"chunk_index": idx},
            )
            count += 1

        return count

    # -------------------------
    # Question Answering
    # -------------------------
    def answer_question(
        self,
        question: str,
        *,
        top_k: int = 5,
        threshold: float = 0.6,
        note_id: Optional[int] = None,
    ) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Run full RAG pipeline.

        Returns:
            answer: LLM generated answer
            sources: retrieved chunks with similarity scores
        """
        query_embedding = embedding_service.generate_embedding(question)

        results = self.vector_service.search_similar(
            query_embedding=query_embedding,
            limit=top_k,
            note_id_filter=note_id,
            threshold=threshold,
        )

        if not results:
            return "I could not find relevant information in your notes.", []

        contexts = [r["content_text"] for r in results]

        llm = get_llm_service()
        answer = llm.generate_answer(question, contexts)

        sources = [
            {
                "note_id": r["note_id"],
                "content_text": r["content_text"],
                "similarity": r["similarity"],
            }
            for r in results
        ]

        return answer, sources


# -------------------------
# FastAPI dependency factory
# -------------------------
def get_rag_service(db: Session):
    """
    Dependency provider for FastAPI.

    IMPORTANT:
    - No return type annotation
    - Prevents FastAPI from inspecting internal Session
    """
    return RAGService(db)
