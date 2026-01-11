"""
Notification service for event-driven notifications.
Handles creating notifications for various platform events.
"""
from app.core.supabase_client import supabase_db
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class NotificationService:
    """Service for managing user notifications."""
    
    async def create_notification(
        self,
        user_id: str,
        title: str,
        message: str,
        notification_type: str,
        resource_id: Optional[str] = None
    ) -> Optional[dict]:
        """
        Create a notification for a user.
        
        Args:
            user_id: UUID of the user to notify
            title: Notification title
            message: Notification message
            notification_type: Type (comment, like, report, approval, system)
            resource_id: Optional related resource ID
            
        Returns:
            Created notification data or None if failed
        """
        try:
            data = {
                "user_id": user_id,
                "title": title,
                "message": message,
                "type": notification_type,
                "is_read": False
            }
            
            if resource_id:
                data["resource_id"] = resource_id
            
            result = supabase_db.service_client.table("notifications").insert(data).execute()
            
            if result.data:
                logger.info(f"✅ Notification created for user {user_id}")
                return result.data[0]
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to create notification: {e}")
            return None
    
    async def notify_resource_approved(self, resource_id: str, uploader_id: str):
        """Notify user when their resource is approved."""
        await self.create_notification(
            user_id=uploader_id,
            title="Resource Approved! 🎉",
            message="Your resource has been approved and is now visible to everyone.",
            notification_type="approval",
            resource_id=resource_id
        )
    
    async def notify_new_comment(self, resource_id: str, resource_owner_id: str, commenter_name: str):
        """Notify resource owner of new comment."""
        await self.create_notification(
            user_id=resource_owner_id,
            title="New Comment 💬",
            message=f"{commenter_name} commented on your resource.",
            notification_type="comment",
            resource_id=resource_id
        )
    
    async def notify_new_like(self, resource_id: str, resource_owner_id: str, liker_name: str):
        """Notify resource owner of new like."""
        await self.create_notification(
            user_id=resource_owner_id,
            title="New Like ❤️",
            message=f"{liker_name} liked your resource.",
            notification_type="like",
            resource_id=resource_id
        )
    
    async def notify_report_resolved(self, report_id: str, reporter_id: str, status: str):
        """Notify reporter when their report is resolved."""
        message = f"Your report has been {status}."
        await self.create_notification(
            user_id=reporter_id,
            title="Report Updated 📋",
            message=message,
            notification_type="report"
        )
    
    async def mark_as_read(self, notification_id: str, user_id: str) -> bool:
        """Mark a notification as read."""
        try:
            result = supabase_db.service_client.table("notifications").update({"is_read": True}).eq("id", notification_id).eq("user_id", user_id).execute()
            return bool(result.data)
        except Exception as e:
            logger.error(f"Failed to mark notification as read: {e}")
            return False
    
    async def mark_all_as_read(self, user_id: str) -> bool:
        """Mark all notifications as read for a user."""
        try:
            result = supabase_db.service_client.table("notifications").update({"is_read": True}).eq("user_id", user_id).eq("is_read", False).execute()
            return True
        except Exception as e:
            logger.error(f"Failed to mark all notifications as read: {e}")
            return False


# Global notification service instance
notification_service = NotificationService()
