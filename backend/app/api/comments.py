"""
Comments API endpoints.
Handles CRUD operations for resource comments with notifications.
"""
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, Header
from typing import List, Optional
from app.models.schemas import CommentCreate, CommentUpdate, CommentResponse
from app.core.security import get_current_user_id, get_current_user
from app.core.supabase_client import supabase_db
from app.services.notification_service import notification_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/comments", tags=["comments"])


@router.post("", response_model=CommentResponse, status_code=201)
async def create_comment(
    comment: CommentCreate,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user_id),
    user: dict = Depends(get_current_user),
    authorization: Optional[str] = Header(None)
):
    """
    Create a comment on a resource.
    Notifies resource owner.
    """
    try:
        token = authorization.replace("Bearer ", "")
        client = supabase_db.get_user_client(token)
        
        # Create comment
        data = comment.model_dump()
        data["user_id"] = user_id
        
        result = client.table("comments").insert(data).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to create comment")
        
        comment_data = result.data[0]
        
        # Get resource owner
        resource = supabase_db.service_client.table("resources").select("uploaded_by").eq("id", comment.resource_id).single().execute()
        
        if resource.data and resource.data["uploaded_by"] != user_id:
            # Notify resource owner
            background_tasks.add_task(
                notification_service.notify_new_comment,
                resource_id=str(comment.resource_id),
                resource_owner_id=resource.data["uploaded_by"],
                commenter_name=user.get("full_name", "Someone")
            )
        
        return comment_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating comment: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/resource/{resource_id}", response_model=List[CommentResponse])
async def list_comments(
    resource_id: str,
    limit: int = 50,
    offset: int = 0,
    authorization: Optional[str] = Header(None)
):
    """List all comments for a resource."""
    try:
        token = authorization.replace("Bearer ", "") if authorization else ""
        client = supabase_db.get_user_client(token) if token else supabase_db.anon_client
        
        result = client.table("comments").select("*").eq("resource_id", resource_id).order("created_at", desc=False).range(offset, offset + limit - 1).execute()
        
        return result.data or []
        
    except Exception as e:
        logger.error(f"Error listing comments: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: str,
    comment_update: CommentUpdate,
    user_id: str = Depends(get_current_user_id),
    authorization: Optional[str] = Header(None)
):
    """Update own comment."""
    try:
        token = authorization.replace("Bearer ", "")
        client = supabase_db.get_user_client(token)
        
        data = comment_update.model_dump()
        data["is_edited"] = True
        
        result = client.table("comments").update(data).eq("id", comment_id).eq("user_id", user_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Comment not found or unauthorized")
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating comment: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{comment_id}", status_code=204)
async def delete_comment(
    comment_id: str,
    user_id: str = Depends(get_current_user_id),
    authorization: Optional[str] = Header(None)
):
    """Delete own comment."""
    try:
        token = authorization.replace("Bearer ", "")
        client = supabase_db.get_user_client(token)
        
        result = client.table("comments").delete().eq("id", comment_id).eq("user_id", user_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Comment not found or unauthorized")
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting comment: {e}")
        raise HTTPException(status_code=500, detail=str(e))
