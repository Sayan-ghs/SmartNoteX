"""
RAG API endpoints for indexing notes and answering questions.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.note import Note
from app.models.chapter import Chapter
from app.models.notebook import Notebook
from app.models.user import User
from app.auth.dependencies import get_current_active_user
from app.schemas.rag import (
    RAGQueryRequest,
    RAGAnswerResponse,
    RAGSource,
)
from app.services.rag_service import RAGService

router = APIRouter(prefix="/rag", tags=["RAG"])


# ✅ FIXED dependency
def get_rag_service(db: Session = Depends(get_db)) -> RAGService:
    return RAGService(db)


def verify_note_access(note_id: int, user: User, db: Session) -> Note:
    """
    Ensure the note belongs to the current user via notebook ownership.
    """
    note = (
        db.query(Note)
        .filter(Note.id == note_id)
        .first()
    )

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    chapter = db.query(Chapter).filter(
        Chapter.id == note.chapter_id
    ).first()

    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")

    notebook = db.query(Notebook).filter(
        Notebook.id == chapter.notebook_id
    ).first()

    if not notebook or notebook.owner_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to access this note",
        )

    return note


@router.post(
    "/index/note/{note_id}",
    status_code=status.HTTP_201_CREATED,
)
async def index_note_for_rag(
    note_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    rag_service: RAGService = Depends(get_rag_service),
):
    """
    Index a specific note into the vector database for RAG.
    """
    note = verify_note_access(note_id, current_user, db)

    try:
        chunks_indexed = rag_service.index_note(note)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to index note: {str(e)}",
        )

    return {
        "note_id": note_id,
        "chunks_indexed": chunks_indexed,
    }


@router.post(
    "/query",
    response_model=RAGAnswerResponse,
)
async def rag_query(
    payload: RAGQueryRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    rag_service: RAGService = Depends(get_rag_service),
):
    """
    Ask a question answered using the user's own notes (RAG).
    """

    if not payload.question.strip():
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty",
        )

    if payload.note_id is not None:
        verify_note_access(payload.note_id, current_user, db)

    try:
        answer, sources_raw = rag_service.answer_question(
            question=payload.question,
            top_k=payload.top_k,
            threshold=payload.threshold,
            note_id=payload.note_id,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"RAG query failed: {str(e)}",
        )

    sources: List[RAGSource] = [
        RAGSource(
            note_id=s["note_id"],
            content_text=s["content_text"],
            similarity=s["similarity"],
        )
        for s in sources_raw
    ]

    return RAGAnswerResponse(
        answer=answer,
        sources=sources,
    )
