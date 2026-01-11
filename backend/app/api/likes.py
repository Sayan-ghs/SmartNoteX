"""
Likes API endpoints for resource likes/favorites.
"""
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, Header
from typing import List, Optional
from app.models.schemas import LikeResponse
from app.core.security import get_current_user_id, get_current_user
from app.core.supabase_client import supabase_db
from app.services.notification_service import notification_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/likes", tags=["likes"])


@router.post("/resources/{resource_id}", response_model=LikeResponse, status_code=201)
async def like_resource(
    resource_id: str,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user_id),
    user: dict = Depends(get_current_user),
    authorization: Optional[str] = Header(None)
):
    """
    Like a resource.
    Notifies resource owner.
    """
    try:
        token = authorization.replace("Bearer ", "")
        client = supabase_db.get_user_client(token)
        
        # Create like
        data = {
            "resource_id": resource_id,
            "user_id": user_id
        }
        
        result = client.table("resource_likes").insert(data).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to like resource (might already be liked)")
        
        like_data = result.data[0]
        
        # Get resource owner
        resource = supabase_db.service_client.table("resources").select("uploaded_by").eq("id", resource_id).single().execute()
        
        if resource.data and resource.data["uploaded_by"] != user_id:
            # Notify resource owner
            background_tasks.add_task(
                notification_service.notify_new_like,
                resource_id=resource_id,
                resource_owner_id=resource.data["uploaded_by"],
                liker_name=user.get("full_name", "Someone")
            )
        
        return like_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error liking resource: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/resources/{resource_id}", status_code=204)
async def unlike_resource(
    resource_id: str,
    user_id: str = Depends(get_current_user_id),
    authorization: Optional[str] = Header(None)
):
    """Unlike a resource."""
    try:
        token = authorization.replace("Bearer ", "")
        client = supabase_db.get_user_client(token)
        
        result = client.table("resource_likes").delete().eq("resource_id", resource_id).eq("user_id", user_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Like not found")
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error unliking resource: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/resources/{resource_id}", response_model=List[LikeResponse])
async def get_resource_likes(
    resource_id: str,
    limit: int = 100,
    offset: int = 0
):
    """Get all likes for a resource."""
    try:
        result = supabase_db.anon_client.table("resource_likes").select("*").eq("resource_id", resource_id).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        return result.data or []
        
    except Exception as e:
        logger.error(f"Error fetching resource likes: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/my-likes", response_model=List[LikeResponse])
async def get_my_likes(
    user_id: str = Depends(get_current_user_id),
    authorization: Optional[str] = Header(None)
):
    """Get current user's liked resources."""
    try:
        token = authorization.replace("Bearer ", "")
        client = supabase_db.get_user_client(token)
        
        result = client.table("resource_likes").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        
        return result.data or []
        
    except Exception as e:
        logger.error(f"Error fetching user likes: {e}")
        raise HTTPException(status_code=500, detail=str(e))
