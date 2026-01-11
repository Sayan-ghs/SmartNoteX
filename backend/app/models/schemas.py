"""
Pydantic schemas for request/response validation.
All schemas use UUID for IDs to match Supabase database.
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID


# ============================================================================
# USER SCHEMAS
# ============================================================================

class UserBase(BaseModel):
    email: str
    full_name: str
    role: str = Field(..., pattern="^(admin|faculty|student)$")
    department: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None


class UserResponse(UserBase):
    id: UUID
    public_code: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# RESOURCE SCHEMAS
# ============================================================================

class ResourceCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    file_url: Optional[str] = None
    resource_type: str = Field(..., pattern="^(pdf|note|link|video|document)$")
    subject: Optional[str] = None
    tags: Optional[List[str]] = []
    visibility: str = Field(default='private', pattern="^(public|private)$")


class ResourceUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    file_url: Optional[str] = None
    subject: Optional[str] = None
    tags: Optional[List[str]] = None
    visibility: Optional[str] = Field(None, pattern="^(public|private)$")


class ResourceResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    file_url: Optional[str]
    resource_type: str
    subject: Optional[str]
    tags: Optional[List[str]]
    uploaded_by: UUID
    visibility: str
    is_approved: bool
    view_count: int
    download_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# COMMENT SCHEMAS
# ============================================================================

class CommentCreate(BaseModel):
    resource_id: UUID
    content: str = Field(..., min_length=1, max_length=2000)
    parent_comment_id: Optional[UUID] = None


class CommentUpdate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)


class CommentResponse(BaseModel):
    id: UUID
    resource_id: UUID
    user_id: UUID
    content: str
    parent_comment_id: Optional[UUID]
    is_edited: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# REPORT SCHEMAS
# ============================================================================

class ReportCreate(BaseModel):
    resource_id: UUID
    reason: str = Field(..., min_length=1)
    report_type: Optional[str] = Field(None, pattern="^(spam|inappropriate|copyright|misleading|other)$")


class ReportUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|reviewed|resolved|dismissed)$")
    admin_notes: Optional[str] = None


class ReportResponse(BaseModel):
    id: UUID
    resource_id: UUID
    reported_by: UUID
    reason: str
    report_type: Optional[str]
    status: str
    admin_notes: Optional[str]
    resolved_by: Optional[UUID]
    resolved_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# LIKE SCHEMAS
# ============================================================================

class LikeResponse(BaseModel):
    id: UUID
    resource_id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# NOTIFICATION SCHEMAS
# ============================================================================

class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    message: str
    type: Optional[str]
    resource_id: Optional[UUID]
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# AI SUMMARY SCHEMAS
# ============================================================================

class AISummaryResponse(BaseModel):
    id: UUID
    resource_id: UUID
    summary: str
    model_used: Optional[str]
    tokens_used: Optional[int]
    confidence_score: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# PUBLIC CODE SEARCH SCHEMAS
# ============================================================================

class PublicResourceItem(BaseModel):
    """Public-safe resource data for public code search"""
    id: UUID
    title: str
    description: Optional[str]
    subject: Optional[str]
    resource_type: str
    tags: Optional[List[str]]
    created_at: datetime
    view_count: int
    download_count: int

    class Config:
        from_attributes = True


class PublicCodeSearchResponse(BaseModel):
    """Response for public code search - NO sensitive data"""
    public_code: str
    owner_name: str
    owner_role: str
    department: Optional[str]
    bio: Optional[str]
    avatar_url: Optional[str]
    resources: List[PublicResourceItem]
    total_resources: int

    class Config:
        from_attributes = True
