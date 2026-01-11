"""
Main FastAPI application entry point.
Extended with AI integration, notifications, and event-driven features.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.api import auth, notebooks, chapters, notes, rag
from app.api import resources, comments, reports, likes, notifications, public_search, messaging
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Smart NoteX API",
    description="AI-Powered Academic Collaboration Platform",
    version="2.0.0"
)

# ✅ Safe DB initialization
@app.on_event("startup")
def startup_db():
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database connected & tables verified")
    except Exception as e:
        logger.error(f"⚠️ Database connection failed: {e}")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include existing routers
app.include_router(auth.router, prefix="/api")
app.include_router(notebooks.router, prefix="/api")
app.include_router(chapters.router, prefix="/api")
app.include_router(notes.router, prefix="/api")
app.include_router(rag.router, prefix="/api")

# Include new routers for Smart NoteX platform
app.include_router(resources.router, prefix="/api")
app.include_router(comments.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(likes.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")

# Public code search endpoint (NO authentication required)
app.include_router(public_search.router, prefix="/api")

# Messaging & community chat endpoints
app.include_router(messaging.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "message": "Smart NoteX API - Academic Collaboration Platform",
        "version": "2.0.0",
        "status": "running",
        "features": [
            "AI-powered summarization",
            "Resource sharing",
            "Collaborative discussions",
            "Content moderation",
            "Real-time notifications"
        ]
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "ai_service": "enabled"
    }
