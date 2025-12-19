"""
Notebook model representing a subject (e.g., "Data Structures", "Calculus").
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Notebook(Base):
    """
    Notebook model representing a subject or course.
    
    Attributes:
        id: Primary key
        title: Notebook title (e.g., "Data Structures and Algorithms")
        description: Optional description of the subject
        color: Hex color code for UI customization
        owner_id: Foreign key to User
        created_at: Creation timestamp
        updated_at: Last update timestamp
    """
    __tablename__ = "notebooks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    color = Column(String, default="#3B82F6")  # Default blue color
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="notebooks")
    chapters = relationship("Chapter", back_populates="notebook", cascade="all, delete-orphan", order_by="Chapter.order_index")

