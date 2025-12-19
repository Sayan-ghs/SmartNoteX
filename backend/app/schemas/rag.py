"""
Pydantic schemas for RAG (Retrieval-Augmented Generation) operations.
"""
from pydantic import BaseModel
from typing import List, Optional


class RAGSource(BaseModel):
    """Represents a source chunk used in a RAG answer."""

    note_id: int
    content_text: str
    similarity: float


class RAGQueryRequest(BaseModel):
    """Request schema for asking a question over personal notes."""

    question: str
    note_id: Optional[int] = None  # Restrict search to a specific note (optional)
    top_k: int = 5
    threshold: float = 0.6


class RAGAnswerResponse(BaseModel):
    """Response schema for RAG answer."""

    answer: str
    sources: List[RAGSource]

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