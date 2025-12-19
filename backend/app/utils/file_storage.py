"""
File storage utilities for handling file uploads to Supabase Storage.
"""
from supabase import create_client, Client
from app.config import settings
from typing import Optional
import uuid
import os


class SupabaseStorage:
    """Supabase Storage handler for file uploads."""
    
    def __init__(self):
        self.client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        self.bucket_name = settings.SUPABASE_STORAGE_BUCKET
    
    def upload_file(
        self,
        file_content: bytes,
        file_name: str,
        folder: str = "notes",
        content_type: Optional[str] = None
    ) -> str:
        """
        Upload a file to Supabase Storage.
        
        Args:
            file_content: File content as bytes
            file_name: Original file name
            folder: Storage folder path (e.g., "notes", "images")
            content_type: MIME type of the file
        
        Returns:
            Public URL of the uploaded file
        """
        # Generate unique file name
        file_extension = os.path.splitext(file_name)[1]
        unique_file_name = f"{uuid.uuid4()}{file_extension}"
        storage_path = f"{folder}/{unique_file_name}"
        
        # Upload to Supabase Storage
        # Supabase storage expects file-like object or bytes
        # We'll use BytesIO to create a file-like object from bytes
        from io import BytesIO
        
        file_obj = BytesIO(file_content)
        
        # Upload with content type if provided
        upload_options = {}
        if content_type:
            upload_options["content-type"] = content_type
        
        try:
            response = self.client.storage.from_(self.bucket_name).upload(
                path=storage_path,
                file=file_obj,
                file_options=upload_options
            )
        except Exception as e:
            # If upload fails, try without file_options
            file_obj.seek(0)  # Reset file pointer
            response = self.client.storage.from_(self.bucket_name).upload(
                path=storage_path,
                file=file_obj
            )
        
        # Get public URL
        public_url = self.client.storage.from_(self.bucket_name).get_public_url(storage_path)
        
        return public_url
    
    def delete_file(self, file_url: str) -> bool:
        """
        Delete a file from Supabase Storage.
        
        Args:
            file_url: Public URL of the file to delete
        
        Returns:
            True if successful, False otherwise
        """
        try:
            # Extract storage path from URL
            # Supabase URLs format: https://{project_ref}.supabase.co/storage/v1/object/public/{bucket}/{path}
            url_parts = file_url.split(f"/storage/v1/object/public/{self.bucket_name}/")
            if len(url_parts) < 2:
                return False
            
            storage_path = url_parts[1]
            
            # Delete from Supabase Storage
            self.client.storage.from_(self.bucket_name).remove([storage_path])
            return True
        except Exception:
            return False


# Global Supabase storage instance
supabase_storage = SupabaseStorage()

