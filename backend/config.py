"""Central configuration — all tuneable constants in one place."""
import os

# ── Auth ──────────────────────────────────────────────────────────────────────
SECRET_KEY        = "CHANGE_ME_IN_PRODUCTION_use_secrets_token_hex_32"
ALGORITHM         = "HS256"
TOKEN_EXPIRE_MIN  = 30

# ── Chunking ──────────────────────────────────────────────────────────────────
CHUNK_TARGET_WORDS  = 350
CHUNK_OVERLAP_WORDS = 50

# ── Size limits ───────────────────────────────────────────────────────────────
MAX_PDF_BYTES  = 5 * 1024 * 1024   # 5 MB
MAX_TEXT_CHARS = 500_000
MAX_URL_CHARS  = 200_000

# ── Embedding model ───────────────────────────────────────────────────────────
EMBED_MODEL = "all-MiniLM-L6-v2"

# ── Retrieval ─────────────────────────────────────────────────────────────────
TOP_K = 5

# Cosine similarity thresholds differ between dense (MiniLM) and sparse (TF-IDF)
def MIN_RELEVANCE() -> float:
    backend = os.getenv("EMBED_BACKEND", "auto").lower()
    return 0.10 if backend == "tfidf" else 0.40

FLASHCARD_MIN = 2
FLASHCARD_MAX = 5

# ── ChromaDB ──────────────────────────────────────────────────────────────────
CHROMA_PATH       = "./chroma_db"
CHROMA_COLLECTION = "notemind_chunks"

# ── Accepted MIME types ───────────────────────────────────────────────────────
ALLOWED_MIME = {"application/pdf", "text/plain"}
