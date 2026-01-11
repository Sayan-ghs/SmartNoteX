"""
Security utilities for JWT handling and role-based access control.
"""
from fastapi import HTTPException, Depends, Header
from typing import Optional
from app.core.supabase_client import supabase_db, extract_user_id_from_jwt


async def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """
    Dependency to extract current user ID from JWT.
    Use this in FastAPI route dependencies.
    """
    return extract_user_id_from_jwt(authorization)


async def get_current_user(user_id: str = Depends(get_current_user_id)) -> dict:
    """
    Get full user profile from database.
    """
    try:
        response = supabase_db.service_client.table("users").select("*").eq("id", user_id).single().execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user: {str(e)}")


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    """
    Dependency to ensure current user is admin.
    Raises 403 if user is not admin.
    """
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


async def require_faculty_or_admin(user: dict = Depends(get_current_user)) -> dict:
    """
    Dependency to ensure current user is faculty or admin.
    """
    if user.get("role") not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Faculty or admin access required")
    return user
