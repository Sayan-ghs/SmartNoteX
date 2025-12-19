"""
Database initialization script.
Creates all tables if they don't exist.
"""
from app.database import engine, Base
from app.models import User, Notebook, Chapter, Note, NoteContent, Share

if __name__ == "__main__":
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

