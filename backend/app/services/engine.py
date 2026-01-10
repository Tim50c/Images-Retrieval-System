"""
Search Engine module for the Image Retrieval System.

This module provides the core functionality for:
- Converting text and images to CLIP embeddings
- Searching for similar images using FAISS
- Refining search results using the Rocchio algorithm
"""
import logging
from typing import List, Dict, Any, Optional, Tuple

import torch
import clip
import faiss
import numpy as np
from PIL import Image

from app.config import settings

# Configure module logger
logger = logging.getLogger(__name__)


class SearchEngine:
    """
    CLIP-based image search engine with FAISS indexing and Rocchio refinement.
    
    This engine uses OpenAI's CLIP model to create embeddings for both text and images,
    enabling cross-modal search. The FAISS index provides efficient similarity search,
    and the Rocchio algorithm allows for relevance feedback refinement.
    
    Attributes:
        device: PyTorch device (cpu/cuda)
        model: CLIP model instance
        preprocess: CLIP preprocessing function
        index: FAISS index for similarity search
        metadata: List mapping index IDs to filenames
        all_vectors: Cached vectors for Rocchio calculations
    """
    
    def __init__(self):
        """Initialize the search engine with CLIP model and FAISS index."""
        logger.info("Initializing SearchEngine...")
        
        self.device = settings.DEVICE
        logger.info("Loading CLIP model '%s' on device '%s'...", settings.CLIP_MODEL, self.device)
        self.model, self.preprocess = clip.load(settings.CLIP_MODEL, device=self.device)
        
        # Load FAISS Index
        logger.info("Loading FAISS index from '%s'...", settings.INDEX_PATH)
        self.index = faiss.read_index(settings.INDEX_PATH)
        
        # Load Metadata (mapping ID -> filename)
        logger.info("Loading metadata from '%s'...", settings.METADATA_PATH)
        with open(settings.METADATA_PATH, 'r', encoding='utf-8') as f:
            import json
            self.metadata: List[str] = json.load(f)
        
        # Get vector dimension from index
        self._vector_dim = self.index.d
        
        # Cache vectors in memory for Rocchio calculations
        # Note: For very large indexes (millions), consider lazy loading
        logger.info("Caching %d vectors for Rocchio refinement...", self.index.ntotal)
        self.all_vectors: np.ndarray = self.index.reconstruct_n(0, self.index.ntotal)
        
        logger.info("SearchEngine initialized successfully with %d indexed images.", self.index.ntotal)

    def _text_to_vector(self, text: str) -> np.ndarray:
        """
        Convert text to a normalized CLIP embedding vector.
        
        Args:
            text: Input text query
            
        Returns:
            Normalized embedding vector (768-dimensional for ViT-L/14)
        """
        text_tokens = clip.tokenize([text]).to(self.device)
        with torch.no_grad():
            text_features = self.model.encode_text(text_tokens)
        return self._normalize(text_features.cpu().numpy()[0])

    def _image_to_vector(self, image_path: str) -> np.ndarray:
        """
        Convert an image file to a normalized CLIP embedding vector.
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Normalized embedding vector (768-dimensional for ViT-L/14)
            
        Raises:
            FileNotFoundError: If the image file doesn't exist
            PIL.UnidentifiedImageError: If the file is not a valid image
        """
        image = self.preprocess(Image.open(image_path)).unsqueeze(0).to(self.device)
        with torch.no_grad():
            image_features = self.model.encode_image(image)
        return self._normalize(image_features.cpu().numpy()[0])

    def _normalize(self, vector: np.ndarray) -> np.ndarray:
        """
        Normalize a vector to unit length (L2 normalization).
        
        Args:
            vector: Input vector
            
        Returns:
            Normalized vector with L2 norm of 1, or zero vector if input is zero
        """
        norm = np.linalg.norm(vector)
        if norm == 0:
            return vector
        return vector / norm

    def search(self, query_vector: np.ndarray, top_k: int = 20) -> List[Dict[str, Any]]:
        """
        Search for similar images using the FAISS index.
        
        Args:
            query_vector: Normalized embedding vector (768-dimensional for ViT-L/14)
            top_k: Number of results to return (default: 20)
            
        Returns:
            List of result dictionaries containing:
                - id: Index ID of the image
                - filename: Original filename
                - score: Similarity score (higher is better)
                - url: Full URL to access the image
        """
        # FAISS search expects a matrix of float32
        query_vector = query_vector.astype('float32').reshape(1, -1)
        scores, indices = self.index.search(query_vector, top_k)
        
        results: List[Dict[str, Any]] = []
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1:  # Invalid result (happens when index has fewer items than top_k)
                continue
            results.append({
                "id": int(idx),
                "filename": self.metadata[idx],
                "score": float(score),
                "url": f"{settings.BASE_URL}/images/{self.metadata[idx]}"
            })
        return results

    def get_vectors_by_ids(self, ids: List[int]) -> np.ndarray:
        """
        Get vectors for specific image IDs.
        
        This method is optimized for small batches. For the Rocchio algorithm,
        we use the cached all_vectors for efficiency.
        
        Args:
            ids: List of image index IDs
            
        Returns:
            NumPy array of vectors, shape (len(ids), vector_dim)
        """
        if not ids:
            return np.zeros((0, self._vector_dim), dtype='float32')
        return self.all_vectors[ids]

    def _parse_text_feedback(self, feedback_text: str) -> Tuple[List[str], List[str]]:
        """
        Parse text feedback to extract positive and negative concepts.
        
        Handles patterns like:
        - "more blue, less red" -> positive: ["blue"], negative: ["red"]
        - "no people" -> positive: [], negative: ["people"]
        - "add sunset" -> positive: ["sunset"], negative: []
        
        Args:
            feedback_text: Raw feedback text from user
            
        Returns:
            Tuple of (positive_concepts, negative_concepts)
        """
        import re
        
        positive_concepts: List[str] = []
        negative_concepts: List[str] = []
        
        # Normalize text
        text = feedback_text.lower().strip()
        
        # Patterns for negative feedback
        negative_patterns = [
            r'\bno\s+(\w+(?:\s+\w+)?)',           # "no people", "no bright colors"
            r'\bwithout\s+(\w+(?:\s+\w+)?)',       # "without text"
            r'\bremove\s+(\w+(?:\s+\w+)?)',        # "remove background"
            r'\bless\s+(\w+(?:\s+\w+)?)',          # "less colorful"
            r'\bnot\s+(\w+(?:\s+\w+)?)',           # "not blurry"
            r'\bexclude\s+(\w+(?:\s+\w+)?)',       # "exclude cars"
        ]
        
        # Patterns for positive feedback
        positive_patterns = [
            r'\bmore\s+(\w+(?:\s+\w+)?)',          # "more vibrant"
            r'\badd\s+(\w+(?:\s+\w+)?)',           # "add sunset"
            r'\bwith\s+(\w+(?:\s+\w+)?)',          # "with mountains"
            r'\bmake\s+it\s+(\w+(?:\s+\w+)?)',     # "make it darker"
            r'\binclude\s+(\w+(?:\s+\w+)?)',       # "include trees"
        ]
        
        # Extract negative concepts
        for pattern in negative_patterns:
            matches = re.findall(pattern, text)
            negative_concepts.extend(matches)
        
        # Extract positive concepts
        for pattern in positive_patterns:
            matches = re.findall(pattern, text)
            positive_concepts.extend(matches)
        
        # If no patterns matched, treat entire text as positive concept
        if not positive_concepts and not negative_concepts:
            positive_concepts = [text]
        
        logger.debug("Parsed feedback - positive: %s, negative: %s", 
                    positive_concepts, negative_concepts)
        
        return positive_concepts, negative_concepts

    def _compute_text_feedback_vector(
        self, 
        feedback_text: str,
        use_parsing: bool = True
    ) -> np.ndarray:
        """
        Compute the text feedback vector with optional concept parsing.
        
        This method can either:
        1. Parse the text to extract positive/negative concepts (better for refinement)
        2. Use the raw text directly (fallback)
        
        Args:
            feedback_text: User's text feedback
            use_parsing: Whether to parse for positive/negative concepts
            
        Returns:
            Combined feedback vector
        """
        if not use_parsing:
            return self._text_to_vector(feedback_text)
        
        positive_concepts, negative_concepts = self._parse_text_feedback(feedback_text)
        
        feedback_vec = np.zeros(self._vector_dim, dtype='float32')
        
        # Add positive concept vectors
        for concept in positive_concepts:
            concept_vec = self._text_to_vector(concept)
            feedback_vec = feedback_vec + concept_vec
            
        # Subtract negative concept vectors
        for concept in negative_concepts:
            concept_vec = self._text_to_vector(concept)
            feedback_vec = feedback_vec - concept_vec
        
        # Normalize the combined feedback
        return self._normalize(feedback_vec)

    def rocchio_refine(
        self,
        current_query_vec: Optional[np.ndarray],
        relevant_ids: List[int],
        irrelevant_ids: List[int],
        feedback_text: Optional[str] = None,
        alpha: float = 1.0,
        beta: float = 0.75,
        gamma: float = 0.25,
        delta: float = 0.8,
        use_text_parsing: bool = True
    ) -> np.ndarray:
        """
        Refine search using the Rocchio relevance feedback algorithm.
        
        The refined query vector is computed as:
            q' = α*q + β*mean(relevant) - γ*mean(irrelevant) + δ*text_feedback
        
        Key improvements over standard Rocchio:
        1. Text feedback is parsed to extract positive/negative concepts
        2. Adaptive weighting: delta is reduced when image feedback is present
        3. Handles "more X", "less Y", "no Z" patterns intelligently
        
        Args:
            current_query_vec: Original query vector (can be None if starting fresh)
            relevant_ids: List of IDs for images marked as relevant
            irrelevant_ids: List of IDs for images marked as irrelevant
            feedback_text: Optional text feedback to incorporate
            alpha: Weight for the original query (default: 1.0, 0.0 if no query)
            beta: Weight for relevant documents centroid (default: 0.75)
            gamma: Weight for irrelevant documents centroid (default: 0.25)
            delta: Weight for text feedback vector (default: 0.8)
            use_text_parsing: Whether to parse text for concepts (default: True)
            
        Returns:
            Refined and normalized query vector
        """
        # Handle the case where there's no original query
        if current_query_vec is None:
            current_query_vec = np.zeros(self._vector_dim, dtype='float32')
            alpha = 0.0
            logger.debug("No original query vector provided, starting from zero vector")
        else:
            current_query_vec = np.asarray(current_query_vec, dtype='float32')
        
        # --- Adaptive Weighting ---
        # If user provided image feedback, reduce text weight to avoid conflict
        has_image_feedback = bool(relevant_ids or irrelevant_ids)
        effective_delta = delta * 0.5 if has_image_feedback else delta
        
        # If no original query but text feedback exists, increase text weight
        if alpha == 0.0 and feedback_text:
            effective_delta = 1.0
            logger.debug("No original query, using text feedback as primary signal")
        
        # --- PART 1: Rocchio (Image Feedback) ---
        if relevant_ids:
            relevant_vecs = self.all_vectors[relevant_ids]
            mean_relevant = np.mean(relevant_vecs, axis=0)
            logger.debug("Computing mean of %d relevant vectors", len(relevant_ids))
        else:
            mean_relevant = np.zeros_like(current_query_vec)

        if irrelevant_ids:
            irrelevant_vecs = self.all_vectors[irrelevant_ids]
            mean_irrelevant = np.mean(irrelevant_vecs, axis=0)
            logger.debug("Computing mean of %d irrelevant vectors", len(irrelevant_ids))
        else:
            mean_irrelevant = np.zeros_like(current_query_vec)

        # Standard Rocchio Formula
        refined_vec = (
            (alpha * current_query_vec) +
            (beta * mean_relevant) -
            (gamma * mean_irrelevant)
        )
        
        # --- PART 2: Text Feedback (Hybrid with Concept Parsing) ---
        if feedback_text:
            logger.info("Applying text feedback: '%s' (weight=%.2f, parsing=%s)", 
                       feedback_text, effective_delta, use_text_parsing)
            feedback_vec = self._compute_text_feedback_vector(feedback_text, use_text_parsing)
            refined_vec = refined_vec + (effective_delta * feedback_vec)

        return self._normalize(refined_vec)


def get_engine() -> SearchEngine:
    """
    Get the search engine singleton instance.
    
    Returns:
        SearchEngine: The global search engine instance
    """
    return engine


# Create singleton instance on module load
engine = SearchEngine()