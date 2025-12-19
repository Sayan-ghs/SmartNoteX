"""
Chapter model representing a chapter within a notebook.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Chapter(Base):
    """
    Chapter model representing a chapter within a notebook.
    
    Attributes:
        id: Primary key
        title: Chapter title (e.g., "Arrays and Linked Lists")
        description: Optional chapter description
        order_index: Order of chapter within notebook (for sorting)
        notebook_id: Foreign key to Notebook
        created_at: Creation timestamp
        updated_at: Last update timestamp
    """
    __tablename__ = "chapters"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)  # For ordering chapters
    notebook_id = Column(Integer, ForeignKey("notebooks.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    notebook = relationship("Notebook", back_populates="chapters")
    notes = relationship("Note", back_populates="chapter", cascade="all, delete-orphan", order_by="Note.created_at.desc()")

