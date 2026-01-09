import torch
import clip
from PIL import Image
import os
import faiss
import numpy as np
import json

# 1. SETUP: Load the CLIP model
# 'ViT-B/32' is the standard model: balanced speed and accuracy.
device = "cpu"
print(f"Loading CLIP model on {device}...")
model, preprocess = clip.load("ViT-B/32", device=device)

# 2. CONFIGURATION
IMAGE_FOLDER = "dataset"  # Folder containing your images
INDEX_FILE = "index.faiss" # Output file for the vector index
METADATA_FILE = "metadata.json" # Output file to store filenames

def main():
    # List to hold all image vectors and filenames
    image_vectors = []
    image_filenames = []
    
    # Check if dataset exists
    if not os.path.exists(IMAGE_FOLDER):
        print(f"Error: Folder '{IMAGE_FOLDER}' not found.")
        return

    print("Starting indexing process. This may take a while depending on your CPU...")

    # 3. LOOP: Process every image in the folder
    files = [f for f in os.listdir(IMAGE_FOLDER) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    
    total_files = len(files)
    if total_files == 0:
        print("No images found in the dataset folder!")
        return

    for i, filename in enumerate(files):
        image_path = os.path.join(IMAGE_FOLDER, filename)
        
        try:
            # A. Load and Preprocess Image
            image = preprocess(Image.open(image_path)).unsqueeze(0).to(device)
            
            # B. Extract Features (The "Embedding")
            with torch.no_grad():
                image_features = model.encode_image(image)
            
            # C. Normalize the vector (Important for Cosine Similarity!)
            image_features /= image_features.norm(dim=-1, keepdim=True)
            
            # D. Convert to numpy array and add to list
            image_vectors.append(image_features.cpu().numpy())
            image_filenames.append(filename)
            
            # Print progress every 10 images
            if (i + 1) % 10 == 0:
                print(f"Processed {i + 1}/{total_files} images...")

        except Exception as e:
            print(f"Error processing {filename}: {e}")

    # 4. BUILDING THE INDEX
    if len(image_vectors) > 0:
        # Convert list of arrays to a single big matrix
        image_vectors = np.vstack(image_vectors).astype('float32')
        
        # Create FAISS Index (IndexFlatIP = Inner Product, roughly equivalent to Cosine if normalized)
        dimension = image_vectors.shape[1] # 512 for ViT-B/32
        index = faiss.IndexFlatIP(dimension)
        
        # Add vectors to the index
        index.add(image_vectors)
        
        # 5. SAVE: Write the index and filenames to disk
        faiss.write_index(index, INDEX_FILE)
        
        # Save filenames mapping (ID -> Filename)
        with open(METADATA_FILE, 'w') as f:
            json.dump(image_filenames, f)
            
        print("------------------------------------------------")
        print(f"Success! Indexed {len(image_filenames)} images.")
        print(f"Saved index to '{INDEX_FILE}'")
        print(f"Saved metadata to '{METADATA_FILE}'")
    else:
        print("No valid images were processed.")

if __name__ == "__main__":
    main()