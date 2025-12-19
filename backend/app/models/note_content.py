"""
NoteContent model representing different types of content within a note.
Supports text, images, PDFs, videos, and web links.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class ContentType(enum.Enum):
    """Enumeration of supported content types."""
    TEXT = "text"
    IMAGE = "image"
    PDF = "pdf"
    VIDEO = "video"  # YouTube links
    WEB_LINK = "web_link"
    SCREENSHOT = "screenshot"


class NoteContent(Base):
    """
    NoteContent model representing individual content blocks within a note.
    
    Attributes:
        id: Primary key
        note_id: Foreign key to Note
        content_type: Type of content (text, image, PDF, etc.)
        content: Text content or metadata JSON
        file_url: URL to stored file (S3) if applicable
        file_name: Original file name
        file_size: File size in bytes
        order_index: Order of content within note
        metadata: JSON metadata (e.g., video timestamp, link preview)
        created_at: Creation timestamp
    """
    __tablename__ = "note_contents"
    
    id = Column(Integer, primary_key=True, index=True)
    note_id = Column(Integer, ForeignKey("notes.id"), nullable=False)
    content_type = Column(Enum(ContentType), nullable=False)
    content = Column(Text, nullable=True)  # Text content or JSON metadata
    file_url = Column(String, nullable=True)  # S3 URL for files
    file_name = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True)  # Size in bytes
    order_index = Column(Integer, default=0)  # For ordering content blocks
    Note_metadata = Column(Text, nullable=True)  # JSON string for additional data
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    note = relationship("Note", back_populates="contents")

