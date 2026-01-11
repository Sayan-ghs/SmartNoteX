"""
Reports API endpoints for content moderation.
"""
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, Header
from typing import List, Optional
from app.models.schemas import ReportCreate, ReportUpdate, ReportResponse
from app.core.security import get_current_user_id, require_admin
from app.core.supabase_client import supabase_db
from app.services.notification_service import notification_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("", response_model=ReportResponse, status_code=201)
async def create_report(
    report: ReportCreate,
    user_id: str = Depends(get_current_user_id),
    authorization: Optional[str] = Header(None)
):
    """Create a report for inappropriate content."""
    try:
        token = authorization.replace("Bearer ", "")
        client = supabase_db.get_user_client(token)
        
        data = report.model_dump()
        data["reported_by"] = user_id
        data["status"] = "pending"
        
        result = client.table("reports").insert(data).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to create report")
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating report: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("", response_model=List[ReportResponse])
async def list_reports(
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    admin: dict = Depends(require_admin)
):
    """List all reports (admin only)."""
    try:
        query = supabase_db.service_client.table("reports").select("*")
        
        if status:
            query = query.eq("status", status)
        
        query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
        result = query.execute()
        
        return result.data or []
        
    except Exception as e:
        logger.error(f"Error listing reports: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/my-reports", response_model=List[ReportResponse])
async def my_reports(
    user_id: str = Depends(get_current_user_id),
    authorization: Optional[str] = Header(None)
):
    """Get current user's reports."""
    try:
        token = authorization.replace("Bearer ", "")
        client = supabase_db.get_user_client(token)
        
        result = client.table("reports").select("*").eq("reported_by", user_id).order("created_at", desc=True).execute()
        
        return result.data or []
        
    except Exception as e:
        logger.error(f"Error fetching user reports: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{report_id}", response_model=ReportResponse)
async def update_report(
    report_id: str,
    report_update: ReportUpdate,
    background_tasks: BackgroundTasks,
    admin: dict = Depends(require_admin)
):
    """Update report status (admin only). Notifies reporter."""
    try:
        # Get report to find reporter
        report = supabase_db.service_client.table("reports").select("reported_by").eq("id", report_id).single().execute()
        
        if not report.data:
            raise HTTPException(status_code=404, detail="Report not found")
        
        data = report_update.model_dump(exclude_unset=True)
        data["resolved_by"] = admin["id"]
        
        if report_update.status in ["resolved", "dismissed"]:
            from datetime import datetime
            data["resolved_at"] = datetime.utcnow().isoformat()
        
        result = supabase_db.service_client.table("reports").update(data).eq("id", report_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to update report")
        
        # Notify reporter
        background_tasks.add_task(
            notification_service.notify_report_resolved,
            report_id=report_id,
            reporter_id=report.data["reported_by"],
            status=report_update.status
        )
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating report: {e}")
        raise HTTPException(status_code=500, detail=str(e))
