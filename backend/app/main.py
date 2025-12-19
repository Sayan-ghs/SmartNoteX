"""
Main FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.api import auth, notebooks, chapters, notes, rag

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="SmartNoteX API",
    description="AI-Powered Engineering Notebook Backend API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(notebooks.router, prefix="/api")
app.include_router(chapters.router, prefix="/api")
app.include_router(notes.router, prefix="/api")
app.include_router(rag.router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "SmartNoteX API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

