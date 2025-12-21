"""
Main FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.api import auth, notebooks, chapters, notes, rag

# Initialize FastAPI app
app = FastAPI(
    title="SmartNoteX API",
    description="AI-Powered Engineering Notebook Backend API",
    version="1.0.0"
)

# ✅ Safe DB initialization
@app.on_event("startup")
def startup_db():
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database connected & tables verified")
    except Exception as e:
        print("⚠️ Database connection failed:", e)

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
    return {
        "message": "SmartNoteX API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
