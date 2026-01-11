"""
Notifications API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List, Optional
from app.models.schemas import NotificationResponse
from app.core.security import get_current_user_id
from app.core.supabase_client import supabase_db
from app.services.notification_service import notification_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=List[NotificationResponse])
async def get_notifications(
    unread_only: bool = False,
    limit: int = 50,
    offset: int = 0,
    user_id: str = Depends(get_current_user_id),
    authorization: Optional[str] = Header(None)
):
    """Get current user's notifications."""
    try:
        token = authorization.replace("Bearer ", "")
        client = supabase_db.get_user_client(token)
        
        query = client.table("notifications").select("*").eq("user_id", user_id)
        
        if unread_only:
            query = query.eq("is_read", False)
        
        query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
        result = query.execute()
        
        return result.data or []
        
    except Exception as e:
        logger.error(f"Error fetching notifications: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{notification_id}/read", status_code=204)
async def mark_notification_read(
    notification_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Mark a notification as read."""
    try:
        success = await notification_service.mark_as_read(notification_id, user_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marking notification as read: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/mark-all-read", status_code=204)
async def mark_all_notifications_read(
    user_id: str = Depends(get_current_user_id)
):
    """Mark all notifications as read for current user."""
    try:
        await notification_service.mark_all_as_read(user_id)
        return None
        
    except Exception as e:
        logger.error(f"Error marking all notifications as read: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/unread-count", response_model=dict)
async def get_unread_count(
    user_id: str = Depends(get_current_user_id),
    authorization: Optional[str] = Header(None)
):
    """Get count of unread notifications."""
    try:
        token = authorization.replace("Bearer ", "")
        client = supabase_db.get_user_client(token)
        
        result = client.table("notifications").select("id", count="exact").eq("user_id", user_id).eq("is_read", False).execute()
        
        return {"count": result.count or 0}
        
    except Exception as e:
        logger.error(f"Error counting unread notifications: {e}")
        raise HTTPException(status_code=500, detail=str(e))
