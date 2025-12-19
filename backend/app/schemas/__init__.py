"""
Pydantic schemas for request/response validation.
"""
from app.schemas.user import UserCreate, UserResponse, Token, LoginRequest
from app.schemas.notebook import NotebookCreate, NotebookUpdate, NotebookResponse
from app.schemas.chapter import ChapterCreate, ChapterUpdate, ChapterResponse
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse
from app.schemas.note_content import NoteContentCreate, NoteContentResponse
from app.schemas.rag import RAGQueryRequest, RAGAnswerResponse, RAGSource

__all__ = [
    "UserCreate",
    "UserResponse",
    "Token",
    "LoginRequest",
    "NotebookCreate",
    "NotebookUpdate",
    "NotebookResponse",
    "ChapterCreate",
    "ChapterUpdate",
    "ChapterResponse",
    "NoteCreate",
    "NoteUpdate",
    "NoteResponse",
    "NoteContentCreate",
    "NoteContentResponse",
    "RAGQueryRequest",
    "RAGAnswerResponse",
    "RAGSource",
]

