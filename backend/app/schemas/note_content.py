"""
Pydantic schemas for note content operations.
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.note_content import ContentType


class NoteContentCreate(BaseModel):
    """Schema for creating note content."""
    content_type: ContentType
    content: Optional[str] = None
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    order_index: Optional[int] = 0
    metadata: Optional[str] = None  # JSON string


class NoteContentUpdate(BaseModel):
    """Schema for updating note content."""
    content: Optional[str] = None
    order_index: Optional[int] = None
    metadata: Optional[str] = None


class NoteContentResponse(BaseModel):
    """Schema for note content response."""
    id: int
    note_id: int
    content_type: ContentType
    content: Optional[str]
    file_url: Optional[str]
    file_name: Optional[str]
    file_size: Optional[int]
    order_index: int
    metadata: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

