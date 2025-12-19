"""
LLM service using HuggingFace for answer generation.

This is used by the RAG pipeline to generate answers conditioned
on retrieved note chunks.
"""
from typing import List
from app.config import settings

try:
    from huggingface_hub import InferenceClient

    HF_HUB_AVAILABLE = True
except ImportError:  # pragma: no cover - import guard
    HF_HUB_AVAILABLE = False


class LLMService:
    """Service for generating answers using a HuggingFace text generation model."""

    def __init__(self) -> None:
        if not settings.HUGGINGFACE_API_KEY:
            raise RuntimeError(
                "HUGGINGFACE_API_KEY is required for LLM generation. "
                "Set it in your .env file."
            )
        if not HF_HUB_AVAILABLE:
            raise ImportError(
                "huggingface-hub is required. Install with: pip install huggingface-hub"
            )

        # You can customize this to any instruct/chat model hosted on HuggingFace.
        # For production, prefer a hosted inference endpoint or a smaller local model.
        self.model_name = "mistralai/Mistral-7B-Instruct-v0.3"
        self.client = InferenceClient(token=settings.HUGGINGFACE_API_KEY)

    def build_prompt(self, question: str, contexts: List[str]) -> str:
        """Build a simple prompt combining context chunks and the question."""
        context_block = "\n\n".join(
            [f"[Context {i + 1}] {c}" for i, c in enumerate(contexts)]
        )
        prompt = (
            "You are an AI tutor for an engineering student. "
            "Answer the question ONLY using the student's notes in the contexts below. "
            "Explain clearly and concisely. "
            "If the answer is not in the notes, say you are not sure.\n\n"
            f"Contexts:\n{context_block}\n\nQuestion: {question}\nAnswer:"
        )
        return prompt

    def generate_answer(self, question: str, contexts: List[str]) -> str:
        """Generate an answer given a question and retrieved contexts."""
        prompt = self.build_prompt(question, contexts)

        response = self.client.text_generation(
            model=self.model_name,
            prompt=prompt,
            max_new_tokens=256,
            temperature=0.4,
        )

        # InferenceClient.text_generation can return a string or object depending on version
        if isinstance(response, str):
            return response.strip()

        text = getattr(response, "generated_text", None)
        if text:
            return text.strip()

        return str(response).strip()


# Global LLM service instance (lazy init)
_llm_service: LLMService | None = None


def get_llm_service() -> LLMService:
    """Get or create a global LLM service instance."""
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service

{
  "cells": [],
  "metadata": {
    "language_info": {
      "name": "python"
    }
  },
  "nbformat": 4,
  "nbformat_minor": 2
}