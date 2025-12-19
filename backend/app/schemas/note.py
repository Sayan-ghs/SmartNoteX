"""
Pydantic schemas for note operations.
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.schemas.note_content import NoteContentResponse


class NoteCreate(BaseModel):
    """Schema for creating a new note."""
    title: str
    chapter_id: int


class NoteUpdate(BaseModel):
    """Schema for updating a note."""
    title: Optional[str] = None
    ai_summary: Optional[str] = None


class NoteResponse(BaseModel):
    """Schema for note response."""
    id: int
    title: str
    chapter_id: int
    is_ai_structured: bool
    ai_summary: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    contents: List[NoteContentResponse] = []
    
    class Config:
        from_attributes = True

