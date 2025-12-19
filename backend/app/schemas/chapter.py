"""
Pydantic schemas for chapter operations.
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.schemas.note import NoteResponse


class ChapterCreate(BaseModel):
    """Schema for creating a new chapter."""
    title: str
    description: Optional[str] = None
    order_index: Optional[int] = 0


class ChapterUpdate(BaseModel):
    """Schema for updating a chapter."""
    title: Optional[str] = None
    description: Optional[str] = None
    order_index: Optional[int] = None


class ChapterResponse(BaseModel):
    """Schema for chapter response."""
    id: int
    title: str
    description: Optional[str]
    order_index: int
    notebook_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    notes: List[NoteResponse] = []
    
    class Config:
        from_attributes = True

