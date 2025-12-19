"""
Notebook API endpoints for CRUD operations.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.notebook import Notebook
from app.schemas.notebook import NotebookCreate, NotebookUpdate, NotebookResponse
from app.auth.dependencies import get_current_active_user

router = APIRouter(prefix="/notebooks", tags=["Notebooks"])


@router.post("", response_model=NotebookResponse, status_code=status.HTTP_201_CREATED)
async def create_notebook(
    notebook_data: NotebookCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new notebook (subject).
    
    Args:
        notebook_data: Notebook creation data
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        Created notebook object
    """
    new_notebook = Notebook(
        title=notebook_data.title,
        description=notebook_data.description,
        color=notebook_data.color,
        owner_id=current_user.id
    )
    
    db.add(new_notebook)
    db.commit()
    db.refresh(new_notebook)
    
    return new_notebook


@router.get("", response_model=List[NotebookResponse])
async def get_notebooks(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all notebooks for the current user.
    
    Args:
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        List of user's notebooks
    """
    notebooks = db.query(Notebook).filter(Notebook.owner_id == current_user.id).all()
    return notebooks


@router.get("/{notebook_id}", response_model=NotebookResponse)
async def get_notebook(
    notebook_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific notebook by ID.
    
    Args:
        notebook_id: Notebook ID
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        Notebook object
    
    Raises:
        HTTPException: If notebook not found or not owned by user
    """
    notebook = db.query(Notebook).filter(
        Notebook.id == notebook_id,
        Notebook.owner_id == current_user.id
    ).first()
    
    if not notebook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notebook not found"
        )
    
    return notebook


@router.put("/{notebook_id}", response_model=NotebookResponse)
async def update_notebook(
    notebook_id: int,
    notebook_data: NotebookUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update a notebook.
    
    Args:
        notebook_id: Notebook ID
        notebook_data: Notebook update data
        current_user: Current authenticated user
        db: Database session
    
    Returns:
        Updated notebook object
    
    Raises:
        HTTPException: If notebook not found or not owned by user
    """
    notebook = db.query(Notebook).filter(
        Notebook.id == notebook_id,
        Notebook.owner_id == current_user.id
    ).first()
    
    if not notebook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notebook not found"
        )
    
    # Update fields
    if notebook_data.title is not None:
        notebook.title = notebook_data.title
    if notebook_data.description is not None:
        notebook.description = notebook_data.description
    if notebook_data.color is not None:
        notebook.color = notebook_data.color
    
    db.commit()
    db.refresh(notebook)
    
    return notebook


@router.delete("/{notebook_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notebook(
    notebook_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a notebook.
    
    Args:
        notebook_id: Notebook ID
        current_user: Current authenticated user
        db: Database session
    
    Raises:
        HTTPException: If notebook not found or not owned by user
    """
    notebook = db.query(Notebook).filter(
        Notebook.id == notebook_id,
        Notebook.owner_id == current_user.id
    ).first()
    
    if not notebook:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notebook not found"
        )
    
    db.delete(notebook)
    db.commit()
    
    return None

