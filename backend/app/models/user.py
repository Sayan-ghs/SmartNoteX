"""
User model for authentication and user management.
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    """
    User model representing an engineering student or user.
    
    Attributes:
        id: Primary key
        email: Unique email address (used for login)
        hashed_password: Bcrypt hashed password
        full_name: User's full name
        is_active: Whether the account is active
        is_verified: Whether the email is verified
        created_at: Account creation timestamp
        updated_at: Last update timestamp
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    notebooks = relationship("Notebook", back_populates="owner", cascade="all, delete-orphan")
    shares = relationship("Share", back_populates="shared_by_user", foreign_keys="Share.shared_by_user_id")

