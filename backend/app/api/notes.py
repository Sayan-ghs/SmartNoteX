"""
Note API endpoints for CRUD operations.
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.models.chapter import Chapter
from app.models.note import Note
from app.models.note_content import NoteContent, ContentType
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse
from app.schemas.note_content import NoteContentCreate, NoteContentResponse
from app.auth.dependencies import get_current_active_user
from app.utils.file_storage import supabase_storage
import json

router = APIRouter(prefix="/notes", tags=["Notes"])


def verify_chapter_access(chapter_id: int, user_id: int, db: Session) -> Chapter:
    """
    Verify that a chapter exists and is accessible by the user.
    
    Args:
        chapter_id: Chapter ID
        user_id: User ID
        db: Database session
    
    Returns:
        Chapter object
    
    Raises:
        HTTPException: If chapter not found or not accessible
    """
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )
    
    # Verify notebook ownership
    if chapter.notebook.owner_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this chapter"
        )
    
    return chapter


@router.post("", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    note_data: NoteCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new note in a chapter.
    
    Args:
        note_data: Note creation data
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        Created note object
    """
    # Verify chapter access
    verify_chapter_access(note_data.chapter_id, current_user.id, db)
    
    new_note = Note(
        title=note_data.title,
        chapter_id=note_data.chapter_id
    )
    
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    
    return new_note


@router.get("/chapter/{chapter_id}", response_model=List[NoteResponse])
async def get_notes_by_chapter(
    chapter_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all notes for a specific chapter.
    
    Args:
        chapter_id: Chapter ID
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        List of notes
    """
    # Verify chapter access
    verify_chapter_access(chapter_id, current_user.id, db)
    
    notes = db.query(Note).filter(Note.chapter_id == chapter_id).order_by(Note.created_at.desc()).all()
    return notes


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific note by ID.
    
    Args:
        note_id: Note ID
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        Note object
    
    Raises:
        HTTPException: If note not found or not accessible
    """
    note = db.query(Note).filter(Note.id == note_id).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    # Verify chapter access
    verify_chapter_access(note.chapter_id, current_user.id, db)
    
    return note


@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: int,
    note_data: NoteUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update a note.
    
    Args:
        note_id: Note ID
        note_data: Note update data
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        Updated note object
    """
    note = db.query(Note).filter(Note.id == note_id).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    # Verify chapter access
    verify_chapter_access(note.chapter_id, current_user.id, db)
    
    # Update fields
    if note_data.title is not None:
        note.title = note_data.title
    if note_data.ai_summary is not None:
        note.ai_summary = note_data.ai_summary
    
    db.commit()
    db.refresh(note)
    
    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a note.
    
    Args:
        note_id: Note ID
        current_user: Current authenticated user
        db: Database session
    """
    note = db.query(Note).filter(Note.id == note_id).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    # Verify chapter access
    verify_chapter_access(note.chapter_id, current_user.id, db)
    
    # Delete associated files from Supabase Storage
    for content in note.contents:
        if content.file_url:
            supabase_storage.delete_file(content.file_url)
    
    db.delete(note)
    db.commit()
    
    return None


@router.post("/{note_id}/content", response_model=NoteContentResponse, status_code=status.HTTP_201_CREATED)
async def add_note_content(
    note_id: int,
    content_type: ContentType = Form(...),
    content: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    file_name: Optional[str] = Form(None),
    order_index: int = Form(0),
    metadata: Optional[str] = Form(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Add content to a note (text, image, PDF, etc.).
    
    Args:
        note_id: Note ID
        content_type: Type of content
        content: Text content (for text type)
        file: Uploaded file (for image/PDF types)
        file_name: Original file name
        order_index: Order of content within note
        metadata: JSON metadata string
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        Created note content object
    """
    note = db.query(Note).filter(Note.id == note_id).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    # Verify chapter access
    verify_chapter_access(note.chapter_id, current_user.id, db)
    
    file_url = None
    file_size = None
    final_file_name = file_name
    
    # Handle file upload
    if file and content_type in [ContentType.IMAGE, ContentType.PDF, ContentType.SCREENSHOT]:
        file_content = await file.read()
        file_size = len(file_content)
        
        # Determine folder based on content type
        folder = "images" if content_type in [ContentType.IMAGE, ContentType.SCREENSHOT] else "pdfs"
        
        # Upload to Supabase Storage
        final_file_name = file.filename or file_name or "uploaded_file"
        file_url = supabase_storage.upload_file(
            file_content=file_content,
            file_name=final_file_name,
            folder=folder,
            content_type=file.content_type
        )
    
    # Create note content
    new_content = NoteContent(
        note_id=note_id,
        content_type=content_type,
        content=content,
        file_url=file_url,
        file_name=final_file_name,
        file_size=file_size,
        order_index=order_index,
        metadata=metadata
    )
    
    db.add(new_content)
    db.commit()
    db.refresh(new_content)
    
    return new_content


@router.get("/{note_id}/content", response_model=List[NoteContentResponse])
async def get_note_contents(
    note_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all content for a specific note.
    
    Args:
        note_id: Note ID
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        List of note contents
    """
    note = db.query(Note).filter(Note.id == note_id).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    # Verify chapter access
    verify_chapter_access(note.chapter_id, current_user.id, db)
    
    contents = db.query(NoteContent).filter(NoteContent.note_id == note_id).order_by(NoteContent.order_index).all()
    return contents


@router.delete("/content/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note_content(
    content_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a note content item.
    
    Args:
        content_id: Content ID
        current_user: Current authenticated user
        db: Database session
    """
    content = db.query(NoteContent).filter(NoteContent.id == content_id).first()
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    # Verify note access
    note = db.query(Note).filter(Note.id == content.note_id).first()
    verify_chapter_access(note.chapter_id, current_user.id, db)
    
    # Delete file from Supabase Storage if exists
    if content.file_url:
        supabase_storage.delete_file(content.file_url)
    
    db.delete(content)
    db.commit()
    
    return None

