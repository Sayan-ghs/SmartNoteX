"""
Resources API endpoints.
Handles CRUD operations for educational resources with AI integration.
"""
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, Header
from typing import List, Optional
from app.models.schemas import ResourceCreate, ResourceUpdate, ResourceResponse
from app.core.security import get_current_user_id, get_current_user, require_admin
from app.core.supabase_client import supabase_db
from app.services.ai_service import ai_service
from app.services.notification_service import notification_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/resources", tags=["resources"])


@router.post("", response_model=ResourceResponse, status_code=201)
async def create_resource(
    resource: ResourceCreate,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user_id),
    authorization: Optional[str] = Header(None)
):
    """
    Create a new resource.
    Automatically queues AI summary generation in background.
    """
    try:
        # Get authenticated client
        token = authorization.replace("Bearer ", "") if authorization else ""
        client = supabase_db.get_user_client(token)
        
        # Create resource
        data = resource.model_dump()
        data["uploaded_by"] = user_id
        data["is_approved"] = False  # Requires admin approval
        
        result = client.table("resources").insert(data).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to create resource")
        
        resource_data = result.data[0]
        resource_id = resource_data["id"]
        
        # Queue AI summary generation in background
        if resource.description and len(resource.description) > 50:
            background_tasks.add_task(
                ai_service.generate_summary_async,
                resource_id=resource_id,
                content=resource.description
            )
            logger.info(f"Queued AI summary generation for resource {resource_id}")
        
        return resource_data
        
    except Exception as e:
        logger.error(f"Error creating resource: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=List[ResourceResponse])
async def list_resources(
    subject: Optional[str] = None,
    resource_type: Optional[str] = None,
    approved_only: bool = True,
    limit: int = 50,
    offset: int = 0,
    authorization: Optional[str] = Header(None)
):
    """
    List resources with optional filtering.
    Users see approved resources + their own.
    """
    try:
        token = authorization.replace("Bearer ", "") if authorization else ""
        client = supabase_db.get_user_client(token) if token else supabase_db.anon_client
        
        query = client.table("resources").select("*")
        
        # Apply filters
        if subject:
            query = query.eq("subject", subject)
        if resource_type:
            query = query.eq("resource_type", resource_type)
        if approved_only and not token:
            query = query.eq("is_approved", True)
        
        query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
        
        result = query.execute()
        return result.data or []
        
    except Exception as e:
        logger.error(f"Error listing resources: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{resource_id}", response_model=ResourceResponse)
async def get_resource(
    resource_id: str,
    authorization: Optional[str] = Header(None)
):
    """Get a single resource by ID."""
    try:
        token = authorization.replace("Bearer ", "") if authorization else ""
        client = supabase_db.get_user_client(token) if token else supabase_db.anon_client
        
        result = client.table("resources").select("*").eq("id", resource_id).single().execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Resource not found")
        
        # Increment view count (using service client to bypass RLS)
        supabase_db.service_client.rpc(
            "increment_view_count",
            {"resource_id": resource_id}
        ).execute()
        
        return result.data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching resource: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{resource_id}", response_model=ResourceResponse)
async def update_resource(
    resource_id: str,
    resource_update: ResourceUpdate,
    user_id: str = Depends(get_current_user_id),
    authorization: Optional[str] = Header(None)
):
    """Update a resource (owner or admin only)."""
    try:
        token = authorization.replace("Bearer ", "")
        client = supabase_db.get_user_client(token)
        
        # Verify ownership
        existing = client.table("resources").select("uploaded_by").eq("id", resource_id).single().execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Resource not found")
        
        # Update resource
        data = resource_update.model_dump(exclude_unset=True)
        result = client.table("resources").update(data).eq("id", resource_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to update resource")
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating resource: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{resource_id}/approve", response_model=ResourceResponse)
async def approve_resource(
    resource_id: str,
    background_tasks: BackgroundTasks,
    admin: dict = Depends(require_admin)
):
    """
    Approve a resource (admin only).
    Triggers AI summary generation and notifies uploader.
    """
    try:
        # Approve resource
        result = supabase_db.service_client.table("resources").update({
            "is_approved": True
        }).eq("id", resource_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Resource not found")
        
        resource_data = result.data[0]
        uploader_id = resource_data["uploaded_by"]
        
        # Notify uploader
        background_tasks.add_task(
            notification_service.notify_resource_approved,
            resource_id=resource_id,
            uploader_id=uploader_id
        )
        
        # Generate AI summary if not already exists
        summary_check = supabase_db.service_client.table("ai_summaries").select("id").eq("resource_id", resource_id).execute()
        
        if not summary_check.data and resource_data.get("description"):
            background_tasks.add_task(
                ai_service.generate_summary_async,
                resource_id=resource_id,
                content=resource_data["description"]
            )
        
        return resource_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error approving resource: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{resource_id}", status_code=204)
async def delete_resource(
    resource_id: str,
    user_id: str = Depends(get_current_user_id),
    authorization: Optional[str] = Header(None)
):
    """Delete a resource (owner or admin only)."""
    try:
        token = authorization.replace("Bearer ", "")
        client = supabase_db.get_user_client(token)
        
        result = client.table("resources").delete().eq("id", resource_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Resource not found or unauthorized")
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting resource: {e}")
        raise HTTPException(status_code=500, detail=str(e))
