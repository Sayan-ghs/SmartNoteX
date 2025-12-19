"""
Share model for sharing notes and notebooks with other users.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class ShareType(enum.Enum):
    """Enumeration of shareable resource types."""
    NOTE = "note"
    NOTEBOOK = "notebook"
    CHAPTER = "chapter"


class SharePermission(enum.Enum):
    """Enumeration of sharing permissions."""
    VIEW_ONLY = "view_only"
    COMMENT = "comment"
    EDIT = "edit"


class Share(Base):
    """
    Share model for sharing notes/notebooks with other users or via public links.
    
    Attributes:
        id: Primary key
        share_type: Type of resource being shared (note, notebook, chapter)
        resource_id: ID of the shared resource
        shared_by_user_id: Foreign key to User who created the share
        shared_with_user_id: Foreign key to User (null for public shares)
        permission: Permission level (view_only, comment, edit)
        is_public: Whether share is accessible via public link
        share_token: Unique token for public access
        expires_at: Optional expiration date
        created_at: Creation timestamp
    """
    __tablename__ = "shares"
    
    id = Column(Integer, primary_key=True, index=True)
    share_type = Column(Enum(ShareType), nullable=False)
    resource_id = Column(Integer, nullable=False)  # ID of note/notebook/chapter
    shared_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    shared_with_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    permission = Column(Enum(SharePermission), default=SharePermission.VIEW_ONLY)
    is_public = Column(Boolean, default=False)
    share_token = Column(String, unique=True, index=True, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    shared_by_user = relationship("User", foreign_keys=[shared_by_user_id], back_populates="shares")

