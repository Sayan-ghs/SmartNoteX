"""
Pydantic schemas for notebook operations.
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.schemas.chapter import ChapterResponse


class NotebookCreate(BaseModel):
    """Schema for creating a new notebook."""
    title: str
    description: Optional[str] = None
    color: Optional[str] = "#3B82F6"


class NotebookUpdate(BaseModel):
    """Schema for updating a notebook."""
    title: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None


class NotebookResponse(BaseModel):
    """Schema for notebook response."""
    id: int
    title: str
    description: Optional[str]
    color: str
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime]
    chapters: List[ChapterResponse] = []
    
    class Config:
        from_attributes = True

