"""
Configuration management for the Image Retrieval System.

Uses environment variables with sensible defaults for local development.
"""
import os
from functools import lru_cache
from typing import List


class Settings:
    """
    Application settings loaded from environment variables.
    
    Attributes:
        CORS_ORIGINS: List of allowed CORS origins
        INDEX_PATH: Path to the FAISS index file
        METADATA_PATH: Path to the metadata JSON file
        DATASET_PATH: Path to the image dataset directory
        DEVICE: PyTorch device for CLIP model (cpu/cuda)
        BASE_URL: Base URL for serving static images
        MAX_FILE_SIZE: Maximum upload file size in bytes
        ALLOWED_EXTENSIONS: Set of allowed image file extensions
    """
    
    def __init__(self):
        # CORS Configuration
        cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173")
        self.CORS_ORIGINS: List[str] = [origin.strip() for origin in cors_origins.split(",")]
        
        # Paths
        self.INDEX_PATH: str = os.getenv("INDEX_PATH", "index.faiss")
        self.METADATA_PATH: str = os.getenv("METADATA_PATH", "metadata.json")
        self.DATASET_PATH: str = os.getenv("DATASET_PATH", "dataset")
        
        # Model Configuration
        self.DEVICE: str = os.getenv("CLIP_DEVICE", "cpu")
        self.CLIP_MODEL: str = os.getenv("CLIP_MODEL", "ViT-L/14")
        
        # API Configuration
        self.BASE_URL: str = os.getenv("BASE_URL", "http://localhost:8000")
        
        # File Upload Limits
        self.MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", str(10 * 1024 * 1024)))  # 10MB
        self.ALLOWED_EXTENSIONS: set = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
        
        # Search defaults
        self.DEFAULT_TOP_K: int = int(os.getenv("DEFAULT_TOP_K", "20"))


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached application settings.
    
    Returns:
        Settings: Application configuration instance
    """
    return settings


# Global settings instance
settings = Settings()
