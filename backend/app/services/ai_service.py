"""
AI Service for automatic resource summarization.
Integrates with existing LLM service and runs as background tasks.
"""
from typing import Optional, Dict, Any
import asyncio
from app.services.llm_service import LLMService
from app.core.supabase_client import supabase_db
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class AIService:
    """
    AI service for generating summaries of uploaded resources.
    Uses existing LLM service for text generation.
    """
    
    def __init__(self):
        try:
            self.llm_service = LLMService()
            self.enabled = True
        except Exception as e:
            logger.warning(f"LLM service unavailable: {e}. AI features disabled.")
            self.enabled = False
    
    async def generate_summary_async(
        self,
        resource_id: str,
        content: str,
        max_length: int = 500
    ) -> Optional[Dict[str, Any]]:
        """
        Generate AI summary for a resource (async).
        
        Args:
            resource_id: UUID of the resource
            content: Text content to summarize
            max_length: Maximum summary length
            
        Returns:
            Dictionary with summary details or None if failed
        """
        if not self.enabled:
            logger.info("AI service disabled, skipping summary generation")
            return None
        
        try:
            # Build summarization prompt
            prompt = self._build_summarization_prompt(content, max_length)
            
            # Generate summary using LLM
            summary = await asyncio.to_thread(
                self.llm_service.generate_answer,
                question=prompt,
                contexts=[]  # No RAG context needed for summarization
            )
            
            # Calculate approximate tokens (rough estimate)
            tokens_used = len(content.split()) + len(summary.split())
            
            # Store in database using service client (bypasses RLS)
            result = supabase_db.service_client.table("ai_summaries").insert({
                "resource_id": resource_id,
                "summary": summary,
                "model_used": self.llm_service.model_name,
                "tokens_used": tokens_used,
                "confidence_score": 0.85  # Placeholder heuristic
            }).execute()
            
            if result.data:
                logger.info(f"✅ AI summary generated for resource {resource_id}")
                return result.data[0]
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to generate AI summary: {e}")
            return None
    
    def _build_summarization_prompt(self, content: str, max_length: int) -> str:
        """Build a prompt for summarization."""
        prompt = (
            f"Summarize the following academic content in {max_length} words or less. "
            "Focus on key concepts and main ideas. Be concise and clear.\n\n"
            f"Content:\n{content[:2000]}\n\n"  # Limit input length
            "Summary:"
        )
        return prompt
    
    async def regenerate_summary(self, resource_id: str) -> Optional[Dict[str, Any]]:
        """
        Regenerate summary for an existing resource.
        Fetches resource content from database.
        """
        try:
            # Fetch resource
            resource = supabase_db.service_client.table("resources").select("*").eq("id", resource_id).single().execute()
            
            if not resource.data:
                logger.error(f"Resource {resource_id} not found")
                return None
            
            # Extract text content (from description or fetch from file_url)
            content = resource.data.get("description", "")
            if not content or len(content) < 50:
                logger.info(f"Insufficient content for summarization: {resource_id}")
                return None
            
            # Delete old summary if exists
            supabase_db.service_client.table("ai_summaries").delete().eq("resource_id", resource_id).execute()
            
            # Generate new summary
            return await self.generate_summary_async(resource_id, content)
            
        except Exception as e:
            logger.error(f"Failed to regenerate summary: {e}")
            return None


# Global AI service instance
ai_service = AIService()
