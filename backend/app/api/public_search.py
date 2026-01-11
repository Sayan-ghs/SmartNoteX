"""
Public Code Search API endpoints.
Allows anyone to search for public resources using a user's unique public code.
NO authentication required - completely public endpoint.
"""
from fastapi import APIRouter, HTTPException, status
from typing import List
from app.models.schemas import PublicCodeSearchResponse, PublicResourceItem
from app.core.supabase_client import supabase_db
import logging
import re

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/search", tags=["public-search"])


def validate_public_code(public_code: str) -> bool:
    """
    Validate public code format.
    Expected format: SNX-STU-XXXXXX or SNX-FAC-XXXXXX
    Where X is alphanumeric (6 characters).
    """
    pattern = r'^SNX-(STU|FAC|USR)-[A-Z0-9]{6}$'
    return bool(re.match(pattern, public_code.upper()))


@router.get("/by-code/{public_code}", response_model=PublicCodeSearchResponse)
async def search_by_public_code(public_code: str):
    """
    Search for public resources by a user's unique public code.
    
    This endpoint is completely public and requires NO authentication.
    It returns ONLY public, approved resources uploaded by the user.
    
    Security measures:
    - Only returns resources where visibility='public' AND is_approved=true
    - Does NOT expose internal user IDs (UUID)
    - Does NOT expose email addresses
    - Validates public_code format before querying
    
    Args:
        public_code: User's unique public code (e.g., SNX-STU-A1B2C3)
    
    Returns:
        PublicCodeSearchResponse with user info and their public resources
    
    Raises:
        400: Invalid public code format
        404: Public code not found or no public resources available
        500: Server error
    """
    try:
        # Normalize and validate public code
        public_code = public_code.upper().strip()
        
        if not validate_public_code(public_code):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid public code format. Expected format: SNX-STU-XXXXXX or SNX-FAC-XXXXXX"
            )
        
        logger.info(f"Public code search initiated: {public_code}")
        
        # Use anonymous client for public access
        client = supabase_db.anon_client
        
        # Step 1: Find user profile by public_code
        # Only fetch non-sensitive public information
        user_result = client.table("users").select(
            "id, full_name, role, department, bio, avatar_url, public_code"
        ).eq("public_code", public_code).execute()
        
        if not user_result.data or len(user_result.data) == 0:
            logger.warning(f"Public code not found: {public_code}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Public code not found. Please verify the code and try again."
            )
        
        user_profile = user_result.data[0]
        user_id = user_profile["id"]
        
        logger.info(f"User found: {user_profile['full_name']} ({user_profile['role']})")
        
        # Step 2: Fetch public approved resources by this user
        # Security: Only visibility='public' AND is_approved=true
        resources_result = client.table("resources").select(
            "id, title, description, subject, resource_type, tags, created_at, view_count, download_count"
        ).eq("uploaded_by", user_id).eq("visibility", "public").eq("is_approved", True).order(
            "created_at", desc=True
        ).execute()
        
        resources = resources_result.data or []
        
        logger.info(f"Found {len(resources)} public resources for user {user_profile['full_name']}")
        
        # If no public resources are available, return informative error
        if len(resources) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No public resources available from {user_profile['full_name']} at this time."
            )
        
        # Step 3: Build safe public response (NO sensitive data)
        response = PublicCodeSearchResponse(
            public_code=public_code,
            owner_name=user_profile["full_name"],
            owner_role=user_profile["role"],
            department=user_profile.get("department"),
            bio=user_profile.get("bio"),
            avatar_url=user_profile.get("avatar_url"),
            resources=[PublicResourceItem(**resource) for resource in resources],
            total_resources=len(resources)
        )
        
        logger.info(f"Successfully returned {len(resources)} resources for code: {public_code}")
        return response
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        logger.error(f"Error searching by public code '{public_code}': {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while searching. Please try again later."
        )


@router.get("/validate-code/{public_code}")
async def validate_code(public_code: str):
    """
    Validate if a public code exists (without fetching resources).
    Useful for frontend validation before full search.
    
    Args:
        public_code: User's unique public code
    
    Returns:
        {"valid": true, "owner_name": "John Doe", "role": "student"}
        or {"valid": false}
    """
    try:
        public_code = public_code.upper().strip()
        
        if not validate_public_code(public_code):
            return {"valid": False, "message": "Invalid format"}
        
        client = supabase_db.anon_client
        
        result = client.table("users").select(
            "full_name, role"
        ).eq("public_code", public_code).execute()
        
        if result.data and len(result.data) > 0:
            user = result.data[0]
            return {
                "valid": True,
                "owner_name": user["full_name"],
                "role": user["role"]
            }
        else:
            return {"valid": False, "message": "Code not found"}
            
    except Exception as e:
        logger.error(f"Error validating code: {e}")
        return {"valid": False, "message": "Validation error"}
