"""
Supabase client configuration for direct database operations.
Uses both anon key (with JWT) and service role key (for system operations).
"""
from supabase import create_client, Client
from app.config import settings
from typing import Optional
from fastapi import HTTPException, Header


class SupabaseClient:
    """Supabase client wrapper with anon and service role support."""
    
    def __init__(self):
        # Anon client (for user operations with JWT)
        self.anon_client: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY  # Anon/public key
        )
        
        # Service role client (for admin/system operations)
        # Only use this for AI summaries, moderation, and system tasks
        self.service_client: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_KEY  # Service role key with RLS bypass
        )
    
    def get_user_client(self, token: str) -> Client:
        """
        Get a Supabase client authenticated with user's JWT.
        This respects RLS policies.
        """
        client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        client.auth.set_session(token, token)  # Set JWT token
        return client
    
    def get_service_client(self) -> Client:
        """
        Get service role client (bypasses RLS).
        ONLY use for:
        - AI summary generation
        - Admin moderation tasks
        - System-level operations
        """
        return self.service_client


# Global instance
supabase_db = SupabaseClient()


def extract_user_id_from_jwt(authorization: Optional[str] = Header(None)) -> str:
    """
    Extract user ID from JWT token in Authorization header.
    Raises HTTPException if token is missing or invalid.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        # Use Supabase client to verify token
        user = supabase_db.anon_client.auth.get_user(token)
        if not user or not user.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user.user.id
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token validation failed: {str(e)}")
