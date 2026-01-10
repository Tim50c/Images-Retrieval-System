"""
FastAPI application for the Interactive Image Search system.

This module provides REST API endpoints for:
- Text-based image search
- Image-based similarity search
- Relevance feedback refinement using Rocchio algorithm
"""
import json
import logging
import os
import shutil
import tempfile
import uuid
from typing import List, Optional

from fastapi import FastAPI, Form, UploadFile, File, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.services.engine import engine
from app.schemas import ImageResult

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Interactive Image Search",
    description="CLIP-based image search with relevance feedback",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve Static Images (The dataset)
app.mount("/images", StaticFiles(directory=settings.DATASET_PATH), name="images")


def validate_upload_file(file: UploadFile) -> None:
    """
    Validate an uploaded file for type and size constraints.
    
    Args:
        file: The uploaded file to validate
        
    Raises:
        HTTPException: If the file type is not allowed or file is too large
    """
    # Validate file extension
    if file.filename:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {ext}. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
            )
    
    # Validate file size
    file.file.seek(0, 2)  # Seek to end
    size = file.file.tell()
    file.file.seek(0)  # Reset to beginning
    
    if size > settings.MAX_FILE_SIZE:
        max_mb = settings.MAX_FILE_SIZE / (1024 * 1024)
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {max_mb:.1f}MB"
        )


def save_temp_upload(file: UploadFile) -> str:
    """
    Safely save an uploaded file to a temporary location.
    
    Uses a unique filename to prevent path traversal attacks and race conditions.
    
    Args:
        file: The uploaded file to save
        
    Returns:
        Path to the saved temporary file
    """
    # Get safe extension from original filename
    ext = ""
    if file.filename:
        ext = os.path.splitext(file.filename)[1].lower()
    
    # Create temp file with unique name
    temp_dir = tempfile.gettempdir()
    safe_filename = f"upload_{uuid.uuid4().hex}{ext}"
    temp_path = os.path.join(temp_dir, safe_filename)
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return temp_path


@app.get("/")
def health_check() -> dict:
    """
    Health check endpoint.
    
    Returns:
        Dictionary with service status and model information
    """
    return {
        "status": "active",
        "model": settings.CLIP_MODEL,
        "indexed_images": engine.index.ntotal
    }


@app.post("/search/text", response_model=List[ImageResult])
def search_by_text(query: str) -> List[ImageResult]:
    """
    Search for images using a text query.
    
    Args:
        query: Natural language description of the desired images
        
    Returns:
        List of matching images with scores and URLs
    """
    logger.info("Text search query: %s", query)
    vector = engine._text_to_vector(query)
    results = engine.search(vector, top_k=settings.DEFAULT_TOP_K)
    return [ImageResult(**r) for r in results]


@app.post("/search/image", response_model=List[ImageResult])
async def search_by_image(file: UploadFile = File(...)) -> List[ImageResult]:
    """
    Search for similar images using an uploaded image.
    
    Args:
        file: Image file to use as the search query
        
    Returns:
        List of similar images with scores and URLs
        
    Raises:
        HTTPException: If the file type is not allowed or file is too large
    """
    logger.info("Image search with file: %s", file.filename)
    
    # Validate the uploaded file
    validate_upload_file(file)
    
    # Save to temp location safely
    temp_path = save_temp_upload(file)
    
    try:
        vector = engine._image_to_vector(temp_path)
        results = engine.search(vector, top_k=settings.DEFAULT_TOP_K)
        return [ImageResult(**r) for r in results]
    except Exception as e:
        logger.error("Error processing image: %s", str(e))
        raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")
    finally:
        # Always cleanup temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.post("/refine", response_model=List[ImageResult])
async def refine_search(
    text_query: Optional[str] = Form(None),
    relevant_images: str = Form("[]"),
    irrelevant_images: str = Form("[]"),
    feedback_text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
) -> List[ImageResult]:
    """
    Refine search results using Rocchio relevance feedback.
    
    This endpoint allows users to improve search results by:
    - Marking images as relevant or irrelevant
    - Providing additional text feedback
    - Re-submitting the original query (text or image)
    
    Args:
        text_query: Original text query (if text-based search)
        relevant_images: JSON array of relevant image IDs
        irrelevant_images: JSON array of irrelevant image IDs
        feedback_text: Additional text describing desired refinements
        file: Original image file (if image-based search)
        
    Returns:
        Refined list of images based on feedback
        
    Raises:
        HTTPException: If JSON parsing fails or image processing errors
    """
    # Parse the lists (FormData sends them as strings)
    try:
        rel_ids: List[int] = json.loads(relevant_images)
        irrel_ids: List[int] = json.loads(irrelevant_images)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON in image IDs: {str(e)}")
    
    logger.info(
        "Refine request - text_query: %s, relevant: %d, irrelevant: %d, feedback: %s",
        text_query, len(rel_ids), len(irrel_ids), feedback_text
    )
    
    # Determine Original Vector
    original_vec = None
    temp_path = None
    
    try:
        # CASE A: Text Query
        if text_query:
            original_vec = engine._text_to_vector(text_query)
            
        # CASE B: Image Query
        elif file:
            validate_upload_file(file)
            temp_path = save_temp_upload(file)
            logger.info("Processing original image for refinement: %s", file.filename)
            original_vec = engine._image_to_vector(temp_path)
        
        # Apply Rocchio refinement
        new_vec = engine.rocchio_refine(
            current_query_vec=original_vec,
            relevant_ids=rel_ids,
            irrelevant_ids=irrel_ids,
            feedback_text=feedback_text
        )
        
        results = engine.search(new_vec, top_k=settings.DEFAULT_TOP_K)
        return [ImageResult(**r) for r in results]
        
    except Exception as e:
        logger.error("Error in refine_search: %s", str(e))
        raise HTTPException(status_code=500, detail=f"Error processing refinement: {str(e)}")
    finally:
        # Cleanup temp file if created
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)