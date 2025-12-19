"""
Note model representing a single note within a chapter.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Note(Base):
    """
    Note model representing a single note entry.
    
    Attributes:
        id: Primary key
        title: Note title
        chapter_id: Foreign key to Chapter
        is_ai_structured: Whether AI has processed this note
        ai_summary: AI-generated summary
        created_at: Creation timestamp
        updated_at: Last update timestamp
    """
    __tablename__ = "notes"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    chapter_id = Column(Integer, ForeignKey("chapters.id"), nullable=False)
    is_ai_structured = Column(Boolean, default=False)
    ai_summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    chapter = relationship("Chapter", back_populates="notes")
    contents = relationship("NoteContent", back_populates="note", cascade="all, delete-orphan", order_by="NoteContent.order_index")

