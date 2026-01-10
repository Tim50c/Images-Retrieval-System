"""
Pydantic schemas for API request/response validation.
"""
from pydantic import BaseModel, Field
from typing import List, Optional


class ImageResult(BaseModel):
    """
    Represents a single image search result.
    
    Attributes:
        id: Unique index ID of the image in the FAISS index
        filename: Original filename of the image
        score: Similarity score (higher is more similar, typically 0-1 for cosine)
        url: Full URL to access the image
    """
    id: int = Field(..., description="Index ID of the image")
    filename: str = Field(..., description="Original filename")
    score: float = Field(..., description="Similarity score (higher is better)")
    url: str = Field(..., description="Full URL to access the image")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": 42,
                "filename": "mountain_sunset.jpg",
                "score": 0.8532,
                "url": "http://localhost:8000/images/mountain_sunset.jpg"
            }
        }


class RefineRequest(BaseModel):
    """
    Request body for search refinement using Rocchio algorithm.
    
    Note: This schema is provided for documentation purposes.
    The actual /refine endpoint uses FormData to support file uploads.
    
    Attributes:
        text_query: Original text query (for text-based searches)
        relevant_images: List of image IDs marked as relevant
        irrelevant_images: List of image IDs marked as irrelevant
        feedback_text: Additional text describing desired refinements
    """
    text_query: Optional[str] = Field(
        None,
        description="Original text query (if text-based search)"
    )
    relevant_images: List[int] = Field(
        default_factory=list,
        description="IDs of images marked as relevant"
    )
    irrelevant_images: List[int] = Field(
        default_factory=list,
        description="IDs of images marked as irrelevant"
    )
    feedback_text: Optional[str] = Field(
        None,
        description="Additional text describing desired changes (e.g., 'make it more colorful')"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "text_query": "sunset over mountains",
                "relevant_images": [1, 5, 12],
                "irrelevant_images": [3, 7],
                "feedback_text": "more vibrant colors"
            }
        }


class HealthResponse(BaseModel):
    """
    Response schema for the health check endpoint.
    """
    status: str = Field(..., description="Service status")
    model: str = Field(..., description="CLIP model being used")
    indexed_images: int = Field(..., description="Number of images in the index")
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "active",
                "model": "ViT-B/32",
                "indexed_images": 10000
            }
        }