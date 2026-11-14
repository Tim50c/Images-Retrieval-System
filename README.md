# Interactive Image Search

A multimodal image retrieval system built on **CLIP** and **FAISS**. Search a collection of ~24K images with a text description or an example image, then refine the results interactively with relevance feedback.

## Features

- **Text search**: describe what you want, e.g. "a dog on the beach".
- **Image search**: upload an image to find visually and semantically similar ones.
- **Interactive refinement**: mark results as relevant or irrelevant and optionally add text feedback such as "more blue, no people". The query vector is recomputed with the **Rocchio algorithm** and the search runs again.

## How it works

```
 Offline                              Online
 ───────                              ──────
 dataset/ ──► CLIP image encoder      text / image query ──► CLIP encoder
                  │                                              │
                  ▼                                              ▼
        FAISS IndexFlatIP  ◄──── inner product (cosine) ──── query vector
        + metadata.json                    │
                                           ▼
                              top-K results ──► user feedback ──► Rocchio ──► new query vector
```

1. **Indexing** ([backend/indexer.py](backend/indexer.py)): every image is encoded by CLIP ViT-L/14 into a 768-d L2-normalized vector and stored in a FAISS `IndexFlatIP` index. A `metadata.json` maps index IDs to filenames.
2. **Search**: text and images share the same CLIP embedding space, so either can be used as a query. FAISS returns the top-K nearest images by cosine similarity (exact, brute-force search).
3. **Refinement** ([backend/app/services/engine.py](backend/app/services/engine.py)): the refined query is

   `q' = α·q + β·mean(relevant) − γ·mean(irrelevant) + δ·text_feedback`

   with α=1.0, β=0.75, γ=0.25, δ=0.8. Text feedback is parsed with regex into positive concepts ("more X", "add X", "with X") and negative concepts ("no X", "less X", "without X"). Negative concept vectors are subtracted from the query. When image feedback is present, the text weight is halved to avoid conflicting signals.

## Tech stack

| Layer | Technology |
|---|---|
| Model | OpenAI CLIP ViT-L/14, PyTorch |
| Vector search | FAISS (`IndexFlatIP`) |
| Backend | Python 3.13, FastAPI, Uvicorn, Pillow, NumPy, uv |
| Frontend | React 19, Vite 7, Material UI 7, Axios |

## Project structure

```
backend/
  app/
    main.py            FastAPI app and endpoints
    config.py          Settings from environment variables
    schemas.py         Pydantic response models
    services/engine.py CLIP encoding, FAISS search, Rocchio refinement
  indexer.py           Builds index.faiss and metadata.json from dataset/
frontend/
  src/
    App.jsx            State and search/refine flow
    api/client.js      API calls
    components/        Search box, results grid, refinement bar, layout
```

## Getting started

### Prerequisites

- Python 3.13 and [uv](https://docs.astral.sh/uv/)
- Node.js 18+
- A folder of images (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`)

### 1. Backend

```bash
cd backend
uv sync

# Put your images in backend/dataset/, then build the index
uv run python indexer.py

# Start the API on http://localhost:8000
uv run uvicorn app.main:app --reload
```

`dataset/`, `index.faiss` and `metadata.json` are git-ignored, so you need to build the index yourself. The first run downloads the CLIP ViT-L/14 weights (about 900 MB). Indexing on CPU is slow for large collections. Set `CLIP_DEVICE=cuda` if you have a GPU.

Interactive API docs are available at `http://localhost:8000/docs`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check: model name and number of indexed images |
| POST | `/search/text?query=...` | Search by text |
| POST | `/search/image` | Search by uploaded image (multipart field `file`) |
| POST | `/refine` | Rocchio refinement (multipart form, see below) |
| GET | `/images/{filename}` | Serves images from the dataset |

`/refine` form fields: `text_query` or `file` (the original query), `relevant_images` and `irrelevant_images` (JSON arrays of image IDs), and `feedback_text` (optional).

Each result looks like:

```json
{ "id": 42, "filename": "42.jpg", "score": 0.85, "url": "http://localhost:8000/images/42.jpg" }
```

## Configuration

Settings are read from environment variables (see [backend/.env.example](backend/.env.example)):

| Variable | Default | Description |
|---|---|---|
| `CLIP_MODEL` | `ViT-L/14` | CLIP variant. Rebuild the index if you change it |
| `CLIP_DEVICE` | `cpu` | `cpu` or `cuda` |
| `INDEX_PATH` | `index.faiss` | FAISS index file |
| `METADATA_PATH` | `metadata.json` | ID to filename mapping |
| `DATASET_PATH` | `dataset` | Image folder |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowed origins |
| `BASE_URL` | `http://localhost:8000` | Used to build image URLs |
| `MAX_FILE_SIZE` | `10485760` | Upload limit in bytes (10 MB) |
| `DEFAULT_TOP_K` | `20` | Number of results returned |

The backend does not load `.env` files automatically. Export the variables in your shell or use a tool that loads them.

## Limitations

- Search is exact brute-force (`IndexFlatIP`), which suits tens of thousands of images but not millions.
- The frontend API URL is hard-coded to `http://localhost:8000` in [frontend/src/api/client.js](frontend/src/api/client.js).
- No quantitative evaluation (e.g. Recall@K) is included.
- CLIP is used as-is (pretrained), with no fine-tuning.
