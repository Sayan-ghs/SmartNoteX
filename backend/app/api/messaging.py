"""
Messaging API endpoints for Smart NoteX.
Handles direct messages (1-1) and community chat.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Header
from typing import List, Optional
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from app.core.security import get_current_user_id
from app.core.supabase_client import supabase_db
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/messages", tags=["messaging"])


# ============================================================================
# SCHEMAS
# ============================================================================

class ConversationCreate(BaseModel):
    """Create a new conversation with a user"""
    other_user_id: UUID
    is_group: bool = False
    name: Optional[str] = None


class MessageCreate(BaseModel):
    """Send a new message in a conversation"""
    content: str = Field(..., min_length=1, max_length=5000)


class MessageResponse(BaseModel):
    """Message response model"""
    id: UUID
    conversation_id: UUID
    sender_id: UUID
    content: str
    created_at: datetime
    updated_at: datetime
    is_deleted: bool
    is_edited: bool
    
    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    """Conversation response model"""
    id: UUID
    is_group: bool
    name: Optional[str]
    created_at: datetime
    updated_at: datetime
    last_message_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class ConversationWithDetails(ConversationResponse):
    """Conversation with additional details"""
    last_message: Optional[str]
    unread_count: int
    other_user_name: Optional[str]
    other_user_avatar: Optional[str]


# ============================================================================
# DIRECT MESSAGING ENDPOINTS
# ============================================================================

@router.post("/conversations", response_model=ConversationResponse, status_code=201)
async def create_or_get_conversation(
    data: ConversationCreate,
    user_id: str = Depends(get_current_user_id),
    authorization: Optional[str] = Header(None)
):
    """
    Create a new conversation or get existing one.
    For direct chats, this ensures only one conversation exists per user pair.
    """
    try:
        token = authorization.replace("Bearer ", "") if authorization else ""
        client = supabase_db.get_user_client(token)
        
        if not data.is_group:
            # Use stored procedure to get or create 1-1 conversation
            result = client.rpc(
                'get_or_create_conversation',
                {'user1_id': user_id, 'user2_id': str(data.other_user_id)}
            ).execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create conversation"
                )
            
            conversation_id = result.data
            
            # Fetch conversation details
            conv_result = client.table("conversations").select("*").eq("id", conversation_id).single().execute()
            return conv_result.data
        
        else:
            # Create group conversation
            conv_data = {
                "is_group": True,
                "name": data.name or "Group Chat"
            }
            
            conv_result = client.table("conversations").insert(conv_data).execute()
            
            if not conv_result.data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to create group conversation"
                )
            
            conversation_id = conv_result.data[0]["id"]
            
            # Add creator as member
            client.table("conversation_members").insert({
                "conversation_id": conversation_id,
                "user_id": user_id,
                "is_admin": True
            }).execute()
            
            return conv_result.data[0]
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating conversation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/conversations", response_model=List[ConversationWithDetails])
async def get_user_conversations(
    limit: int = 50,
    offset: int = 0,
    user_id: str = Depends(get_current_user_id),
    authorization: Optional[str] = Header(None)
):
    """
    Get all conversations for the authenticated user.
    Includes last message preview and unread count.
    """
    try:
        token = authorization.replace("Bearer ", "") if authorization else ""
        client = supabase_db.get_user_client(token)
        
        # Get conversations the user is a member of
        result = client.table("conversation_members").select(
            "conversation_id"
        ).eq("user_id", user_id).execute()
        
        if not result.data:
            return []
        
        conversation_ids = [item["conversation_id"] for item in result.data]
        
        # Get conversation details with last message
        conversations = []
        for conv_id in conversation_ids:
            # Get conversation
            conv_result = client.table("conversations").select("*").eq("id", conv_id).single().execute()
            conv_data = conv_result.data
            
            # Get last message
            last_msg_result = client.table("messages").select(
                "content, created_at"
            ).eq("conversation_id", conv_id).order("created_at", desc=True).limit(1).execute()
            
            last_message = last_msg_result.data[0]["content"] if last_msg_result.data else None
            
            # Get other user info (for direct chats)
            other_user_name = None
            other_user_avatar = None
            if not conv_data["is_group"]:
                members_result = client.table("conversation_members").select(
                    "user_id"
                ).eq("conversation_id", conv_id).neq("user_id", user_id).execute()
                
                if members_result.data:
                    other_user_id = members_result.data[0]["user_id"]
                    user_result = client.table("users").select(
                        "full_name, avatar_url"
                    ).eq("id", other_user_id).single().execute()
                    
                    if user_result.data:
                        other_user_name = user_result.data["full_name"]
                        other_user_avatar = user_result.data.get("avatar_url")
            
            # Get unread count (messages after last_read_at)
            members_result = client.table("conversation_members").select(
                "last_read_at"
            ).eq("conversation_id", conv_id).eq("user_id", user_id).single().execute()
            
            last_read = members_result.data.get("last_read_at") if members_result.data else None
            
            if last_read:
                unread_result = client.table("messages").select(
                    "id", count="exact"
                ).eq("conversation_id", conv_id).gt("created_at", last_read).execute()
                unread_count = unread_result.count or 0
            else:
                unread_result = client.table("messages").select(
                    "id", count="exact"
                ).eq("conversation_id", conv_id).execute()
                unread_count = unread_result.count or 0
            
            conversations.append(ConversationWithDetails(
                **conv_data,
                last_message=last_message,
                unread_count=unread_count,
                other_user_name=other_user_name,
                other_user_avatar=other_user_avatar
            ))
        
        # Sort by last_message_at
        conversations.sort(key=lambda x: x.last_message_at or x.created_at, reverse=True)
        
        return conversations[offset:offset + limit]
        
    except Exception as e:
        logger.error(f"Error fetching conversations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_conversation_messages(
    conversation_id: UUID,
    limit: int = 50,
    before: Optional[datetime] = None,
    user_id: str = Depends(get_current_user_id),
    authorization: Optional[str] = Header(None)
):
    """
    Get messages for a specific conversation.
    Supports pagination with 'before' cursor for infinite scroll.
    """
    try:
        token = authorization.replace("Bearer ", "") if authorization else ""
        client = supabase_db.get_user_client(token)
        
        # Verify user is a member of this conversation
        member_check = client.table("conversation_members").select("user_id").eq(
            "conversation_id", str(conversation_id)
        ).eq("user_id", user_id).execute()
        
        if not member_check.data:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this conversation"
            )
        
        # Build query
        query = client.table("messages").select("*").eq("conversation_id", str(conversation_id))
        
        if before:
            query = query.lt("created_at", before.isoformat())
        
        query = query.order("created_at", desc=True).limit(limit)
        
        result = query.execute()
        
        # Update last_read_at
        client.table("conversation_members").update({
            "last_read_at": datetime.utcnow().isoformat()
        }).eq("conversation_id", str(conversation_id)).eq("user_id", user_id).execute()
        
        return result.data or []
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching messages: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse, status_code=201)
async def send_message(
    conversation_id: UUID,
    message: MessageCreate,
    user_id: str = Depends(get_current_user_id),
    authorization: Optional[str] = Header(None)
):
    """
    Send a new message in a conversation.
    RLS ensures user is a member.
    """
    try:
        token = authorization.replace("Bearer ", "") if authorization else ""
        client = supabase_db.get_user_client(token)
        
        data = {
            "conversation_id": str(conversation_id),
            "sender_id": user_id,
            "content": message.content
        }
        
        result = client.table("messages").insert(data).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to send message"
            )
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/messages/{message_id}", status_code=204)
async def delete_message(
    message_id: UUID,
    user_id: str = Depends(get_current_user_id),
    authorization: Optional[str] = Header(None)
):
    """
    Delete a message (soft delete by setting is_deleted=true).
    RLS ensures user owns the message.
    """
    try:
        token = authorization.replace("Bearer ", "") if authorization else ""
        client = supabase_db.get_user_client(token)
        
        # Soft delete
        result = client.table("messages").update({
            "is_deleted": True,
            "content": "[Message deleted]"
        }).eq("id", str(message_id)).eq("sender_id", user_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found or you don't have permission"
            )
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============================================================================
# COMMUNITY CHAT ENDPOINTS
# ============================================================================

class CommunityCreate(BaseModel):
    """Create a new community"""
    name: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = None
    is_private: bool = False
    subject: Optional[str] = None


class CommunityResponse(BaseModel):
    """Community response model"""
    id: UUID
    name: str
    description: Optional[str]
    created_by: UUID
    is_private: bool
    avatar_url: Optional[str]
    subject: Optional[str]
    member_count: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CommunityMessageCreate(BaseModel):
    """Send a message in a community"""
    content: str = Field(..., min_length=1, max_length=5000)
    reply_to_id: Optional[UUID] = None


class CommunityMessageResponse(BaseModel):
    """Community message response"""
    id: UUID
    community_id: UUID
    sender_id: UUID
    content: str
    created_at: datetime
    updated_at: datetime
    is_deleted: bool
    is_edited: bool
    reply_to_id: Optional[UUID]
    
    class Config:
        from_attributes = True


@router.post("/communities", response_model=CommunityResponse, status_code=201)
async def create_community(
    community: CommunityCreate,
    user_id: str = Depends(get_current_user_id),
    authorization: Optional[str] = Header(None)
):
    """
    Create a new academic community.
    Creator is automatically added as admin.
    """
    try:
        token = authorization.replace("Bearer ", "") if authorization else ""
        client = supabase_db.get_user_client(token)
        
        data = community.model_dump()
        data["created_by"] = user_id
        data["member_count"] = 1
        
        result = client.table("communities").insert(data).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create community"
            )
        
        community_id = result.data[0]["id"]
        
        # Add creator as admin member
        client.table("community_members").insert({
            "community_id": community_id,
            "user_id": user_id,
            "role": "admin"
        }).execute()
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating community: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/communities", response_model=List[CommunityResponse])
async def list_communities(
    subject: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    authorization: Optional[str] = Header(None)
):
    """
    List public communities.
    Optionally filter by subject or search term.
    """
    try:
        token = authorization.replace("Bearer ", "") if authorization else ""
        client = supabase_db.get_user_client(token) if token else supabase_db.anon_client
        
        query = client.table("communities").select("*").eq("is_private", False)
        
        if subject:
            query = query.eq("subject", subject)
        
        if search:
            query = query.ilike("name", f"%{search}%")
        
        query = query.order("member_count", desc=True).range(offset, offset + limit - 1)
        
        result = query.execute()
        return result.data or []
        
    except Exception as e:
        logger.error(f"Error listing communities: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/communities/my", response_model=List[CommunityResponse])
async def get_my_communities(
    user_id: str = Depends(get_current_user_id),
    authorization: Optional[str] = Header(None)
):
    """
    Get communities the authenticated user is a member of.
    """
    try:
        token = authorization.replace("Bearer ", "") if authorization else ""
        client = supabase_db.get_user_client(token)
        
        # Get user's community memberships
        memberships = client.table("community_members").select(
            "community_id"
        ).eq("user_id", user_id).execute()
        
        if not memberships.data:
            return []
        
        community_ids = [m["community_id"] for m in memberships.data]
        
        # Get community details
        result = client.table("communities").select("*").in_("id", community_ids).execute()
        
        return result.data or []
        
    except Exception as e:
        logger.error(f"Error fetching user communities: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/communities/{community_id}/join", status_code=204)
async def join_community(
    community_id: UUID,
    user_id: str = Depends(get_current_user_id),
    authorization: Optional[str] = Header(None)
):
    """
    Join a public community.
    RLS ensures only public communities can be joined.
    """
    try:
        token = authorization.replace("Bearer ", "") if authorization else ""
        client = supabase_db.get_user_client(token)
        
        # Check if already a member
        existing = client.table("community_members").select("user_id").eq(
            "community_id", str(community_id)
        ).eq("user_id", user_id).execute()
        
        if existing.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already a member of this community"
            )
        
        # Join community
        result = client.table("community_members").insert({
            "community_id": str(community_id),
            "user_id": user_id,
            "role": "member"
        }).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to join community (may be private)"
            )
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error joining community: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/communities/{community_id}/leave", status_code=204)
async def leave_community(
    community_id: UUID,
    user_id: str = Depends(get_current_user_id),
    authorization: Optional[str] = Header(None)
):
    """
    Leave a community.
    """
    try:
        token = authorization.replace("Bearer ", "") if authorization else ""
        client = supabase_db.get_user_client(token)
        
        result = client.table("community_members").delete().eq(
            "community_id", str(community_id)
        ).eq("user_id", user_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Not a member of this community"
            )
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error leaving community: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/communities/{community_id}/messages", response_model=List[CommunityMessageResponse])
async def get_community_messages(
    community_id: UUID,
    limit: int = 50,
    before: Optional[datetime] = None,
    user_id: str = Depends(get_current_user_id),
    authorization: Optional[str] = Header(None)
):
    """
    Get messages for a community.
    RLS ensures user is a member.
    """
    try:
        token = authorization.replace("Bearer ", "") if authorization else ""
        client = supabase_db.get_user_client(token)
        
        query = client.table("community_messages").select("*").eq("community_id", str(community_id))
        
        if before:
            query = query.lt("created_at", before.isoformat())
        
        query = query.order("created_at", desc=True).limit(limit)
        
        result = query.execute()
        return result.data or []
        
    except Exception as e:
        logger.error(f"Error fetching community messages: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/communities/{community_id}/messages", response_model=CommunityMessageResponse, status_code=201)
async def send_community_message(
    community_id: UUID,
    message: CommunityMessageCreate,
    user_id: str = Depends(get_current_user_id),
    authorization: Optional[str] = Header(None)
):
    """
    Send a message to a community.
    RLS ensures user is a member.
    """
    try:
        token = authorization.replace("Bearer ", "") if authorization else ""
        client = supabase_db.get_user_client(token)
        
        data = {
            "community_id": str(community_id),
            "sender_id": user_id,
            "content": message.content,
            "reply_to_id": str(message.reply_to_id) if message.reply_to_id else None
        }
        
        result = client.table("community_messages").insert(data).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to send message (may not be a member)"
            )
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending community message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
