"""
FAISS Index Builder for the Image Retrieval System.

This script processes all images in the dataset folder, generates CLIP embeddings,
and builds a FAISS index for efficient similarity search.

Usage:
    python indexer.py
    
Environment Variables:
    CLIP_DEVICE: Device to run CLIP on (default: cpu)
    CLIP_MODEL: CLIP model variant (default: ViT-B/32)
"""
import json
import logging
import os
import sys
from typing import List, Tuple

import faiss
import numpy as np
import torch
import clip
from PIL import Image

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Configuration
IMAGE_FOLDER = os.getenv("DATASET_PATH", "dataset")
INDEX_FILE = os.getenv("INDEX_PATH", "index.faiss")
METADATA_FILE = os.getenv("METADATA_PATH", "metadata.json")
DEVICE = os.getenv("CLIP_DEVICE", "cpu")
CLIP_MODEL = os.getenv("CLIP_MODEL", "ViT-B/32")
SUPPORTED_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp', '.gif'}
BATCH_SIZE = 32  # Process images in batches for efficiency


def load_clip_model() -> Tuple:
    """
    Load the CLIP model and preprocessing function.
    
    Returns:
        Tuple of (model, preprocess function)
    """
    logger.info("Loading CLIP model '%s' on device '%s'...", CLIP_MODEL, DEVICE)
    model, preprocess = clip.load(CLIP_MODEL, device=DEVICE)
    logger.info("CLIP model loaded successfully.")
    return model, preprocess


def get_image_files(folder: str) -> List[str]:
    """
    Get all supported image files from a directory.
    
    Args:
        folder: Path to the image directory
        
    Returns:
        List of image filenames
    """
    if not os.path.exists(folder):
        logger.error("Dataset folder '%s' not found!", folder)
        return []
    
    files = [
        f for f in os.listdir(folder)
        if os.path.splitext(f)[1].lower() in SUPPORTED_EXTENSIONS
    ]
    
    logger.info("Found %d images in '%s'", len(files), folder)
    return files


def process_image(
    image_path: str,
    model,
    preprocess,
    device: str
) -> np.ndarray:
    """
    Process a single image and extract its CLIP embedding.
    
    Args:
        image_path: Path to the image file
        model: CLIP model
        preprocess: CLIP preprocessing function
        device: PyTorch device
        
    Returns:
        Normalized embedding vector
        
    Raises:
        Exception: If image processing fails
    """
    image = preprocess(Image.open(image_path)).unsqueeze(0).to(device)
    
    with torch.no_grad():
        image_features = model.encode_image(image)
    
    # Normalize the vector (important for cosine similarity)
    image_features = image_features / image_features.norm(dim=-1, keepdim=True)
    
    return image_features.cpu().numpy()


def build_index(image_vectors: np.ndarray) -> faiss.Index:
    """
    Build a FAISS index from image vectors.
    
    Uses IndexFlatIP (Inner Product) which is equivalent to cosine similarity
    for normalized vectors.
    
    Args:
        image_vectors: Matrix of normalized image embeddings
        
    Returns:
        FAISS index
    """
    dimension = image_vectors.shape[1]
    logger.info("Building FAISS index with dimension %d...", dimension)
    
    # IndexFlatIP = Inner Product, equivalent to Cosine for normalized vectors
    index = faiss.IndexFlatIP(dimension)
    index.add(image_vectors)
    
    logger.info("FAISS index built with %d vectors.", index.ntotal)
    return index


def save_index(index: faiss.Index, filenames: List[str]) -> None:
    """
    Save the FAISS index and metadata to disk.
    
    Args:
        index: FAISS index to save
        filenames: List of filenames (ID -> filename mapping)
    """
    faiss.write_index(index, INDEX_FILE)
    logger.info("Saved FAISS index to '%s'", INDEX_FILE)
    
    with open(METADATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(filenames, f, ensure_ascii=False, indent=2)
    logger.info("Saved metadata to '%s'", METADATA_FILE)


def main() -> int:
    """
    Main indexing pipeline.
    
    Returns:
        Exit code (0 for success, 1 for failure)
    """
    logger.info("=" * 60)
    logger.info("Starting Image Indexing Pipeline")
    logger.info("=" * 60)
    
    # Load model
    model, preprocess = load_clip_model()
    
    # Get image files
    files = get_image_files(IMAGE_FOLDER)
    if not files:
        logger.error("No images found! Exiting.")
        return 1
    
    # Process images
    image_vectors: List[np.ndarray] = []
    image_filenames: List[str] = []
    failed_count = 0
    
    logger.info("Processing %d images...", len(files))
    
    for i, filename in enumerate(files):
        image_path = os.path.join(IMAGE_FOLDER, filename)
        
        try:
            vector = process_image(image_path, model, preprocess, DEVICE)
            image_vectors.append(vector)
            image_filenames.append(filename)
            
            # Progress logging every 50 images
            if (i + 1) % 50 == 0 or (i + 1) == len(files):
                logger.info("Processed %d/%d images (%.1f%%)", 
                           i + 1, len(files), 100 * (i + 1) / len(files))
                
        except Exception as e:
            logger.warning("Failed to process '%s': %s", filename, str(e))
            failed_count += 1
    
    if not image_vectors:
        logger.error("No images were successfully processed! Exiting.")
        return 1
    
    # Build index
    vectors_matrix = np.vstack(image_vectors).astype('float32')
    index = build_index(vectors_matrix)
    
    # Save outputs
    save_index(index, image_filenames)
    
    # Summary
    logger.info("=" * 60)
    logger.info("Indexing Complete!")
    logger.info("  - Indexed: %d images", len(image_filenames))
    logger.info("  - Failed: %d images", failed_count)
    logger.info("  - Index file: %s", INDEX_FILE)
    logger.info("  - Metadata file: %s", METADATA_FILE)
    logger.info("=" * 60)
    
    return 0


if __name__ == "__main__":
    sys.exit(main())