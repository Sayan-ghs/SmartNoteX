"""
Chapter API endpoints for CRUD operations.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.notebook import Notebook
from app.models.chapter import Chapter
from app.schemas.chapter import ChapterCreate, ChapterUpdate, ChapterResponse
from app.auth.dependencies import get_current_active_user

router = APIRouter(prefix="/chapters", tags=["Chapters"])


def verify_notebook_ownership(notebook_id: int, user_id: int, db: Session) -> Notebook:
    """
    Verify that a notebook exists and is owned by the user.
    
    Args:
        notebook_id: Notebook ID
        user_id: User ID
        db: Database session
    
    Returns:
        Notebook object
    
    Raises:
        HTTPException: If notebook not found or not owned by user
    """
    notebook = db.query(Notebook).filter(
        Notebook.id == notebook_id,
        Notebook.owner_id == user_id
    ).first()
    
    if not notebook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notebook not found"
        )
    
    return notebook


@router.post("", response_model=ChapterResponse, status_code=status.HTTP_201_CREATED)
async def create_chapter(
    chapter_data: ChapterCreate,
    notebook_id: int = Query(..., description="Notebook ID to create chapter in"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new chapter in a notebook.
    
    Args:
        chapter_data: Chapter creation data
        notebook_id: Notebook ID (query parameter)
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        Created chapter object
    """
    # Verify notebook ownership
    verify_notebook_ownership(notebook_id, current_user.id, db)
    
    new_chapter = Chapter(
        title=chapter_data.title,
        description=chapter_data.description,
        order_index=chapter_data.order_index,
        notebook_id=notebook_id
    )
    
    db.add(new_chapter)
    db.commit()
    db.refresh(new_chapter)
    
    return new_chapter


@router.get("/notebook/{notebook_id}", response_model=List[ChapterResponse])
async def get_chapters_by_notebook(
    notebook_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all chapters for a specific notebook.
    
    Args:
        notebook_id: Notebook ID
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        List of chapters
    """
    # Verify notebook ownership
    verify_notebook_ownership(notebook_id, current_user.id, db)
    
    chapters = db.query(Chapter).filter(Chapter.notebook_id == notebook_id).order_by(Chapter.order_index).all()
    return chapters


@router.get("/{chapter_id}", response_model=ChapterResponse)
async def get_chapter(
    chapter_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific chapter by ID.
    
    Args:
        chapter_id: Chapter ID
        current_user: Current authenticated user
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
    verify_notebook_ownership(chapter.notebook_id, current_user.id, db)
    
    return chapter


@router.put("/{chapter_id}", response_model=ChapterResponse)
async def update_chapter(
    chapter_id: int,
    chapter_data: ChapterUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update a chapter.
    
    Args:
        chapter_id: Chapter ID
        chapter_data: Chapter update data
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        Updated chapter object
    """
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )
    
    # Verify notebook ownership
    verify_notebook_ownership(chapter.notebook_id, current_user.id, db)
    
    # Update fields
    if chapter_data.title is not None:
        chapter.title = chapter_data.title
    if chapter_data.description is not None:
        chapter.description = chapter_data.description
    if chapter_data.order_index is not None:
        chapter.order_index = chapter_data.order_index
    
    db.commit()
    db.refresh(chapter)
    
    return chapter


@router.delete("/{chapter_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chapter(
    chapter_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a chapter.
    
    Args:
        chapter_id: Chapter ID
        current_user: Current authenticated user
        db: Database session
    """
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    
    if not chapter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chapter not found"
        )
    
    # Verify notebook ownership
    verify_notebook_ownership(chapter.notebook_id, current_user.id, db)
    
    db.delete(chapter)
    db.commit()
    
    return None

