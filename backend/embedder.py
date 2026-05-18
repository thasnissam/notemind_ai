"""
embedder.py
───────────
Pluggable embedding backend for NoteMind.

Priority / selection:
  1. SentenceTransformer (all-MiniLM-L6-v2)  ← TRUE semantic search (default)
  2. TF-IDF + SVD                             ← keyword fallback (opt-in only)

IMPORTANT:
  The TF-IDF backend does NOT produce semantic embeddings.
  It is kept only as a last resort for offline environments where
  sentence-transformers cannot be installed. When active, searches
  work on keyword overlap, not meaning — the semantic search feature
  is degraded and a warning is printed at startup.

  To force TF-IDF: set EMBED_BACKEND=tfidf in your .env
  To force MiniLM:  set EMBED_BACKEND=minilm in your .env
  Default (auto):   tries MiniLM, raises clearly if it fails.
"""
from __future__ import annotations

import logging
import os
from abc import ABC, abstractmethod

import numpy as np

from config import EMBED_MODEL

logger   = logging.getLogger(__name__)
EMBED_DIM = 384


# ── Abstract interface ────────────────────────────────────────────────────────

class BaseEmbedder(ABC):
    @abstractmethod
    def encode(self, texts: list[str]) -> np.ndarray: ...

    @property
    @abstractmethod
    def name(self) -> str: ...

    @property
    def is_semantic(self) -> bool:
        """Returns True only for dense neural embedders (true semantic search)."""
        return True


# ── Backend 1: SentenceTransformer (true semantic search) ─────────────────────

class MiniLMEmbedder(BaseEmbedder):
    def __init__(self) -> None:
        from sentence_transformers import SentenceTransformer
        print(f" Loading embedding model '{EMBED_MODEL}'…")
        self._model = SentenceTransformer(EMBED_MODEL)
        print(f" Embedding model loaded: {EMBED_MODEL}")

    def encode(self, texts: list[str]) -> np.ndarray:
        return self._model.encode(texts, show_progress_bar=False)

    @property
    def name(self) -> str:
        return f"SentenceTransformer ({EMBED_MODEL})"

    @property
    def is_semantic(self) -> bool:
        return True


# ── Backend 2: TF-IDF + SVD (keyword-based, NOT semantic) ─────────────────────

class TFIDFEmbedder(BaseEmbedder):
    """
    Offline fallback using TF-IDF + truncated SVD.
    Produces keyword-overlap vectors, NOT semantic vectors.
    Vectors are L2-normalised and padded to EMBED_DIM for ChromaDB compatibility.

    ⚠️  Semantic search is DEGRADED when this backend is active.
        Queries like "documents about climate change" will NOT match
        files that discuss "global warming" without the exact words.
    """

    _MIN_DOCS_FOR_SVD = 10

    def __init__(self) -> None:
        self._corpus: list[str] = []
        self._fitted            = False
        self._pipeline          = None
        print(
            "\n⚠️  WARNING: Using TF-IDF fallback embedder.\n"
            "    Semantic search is DEGRADED — only keyword matching is active.\n"
            "    To enable true semantic search, install sentence-transformers:\n"
            "        pip install sentence-transformers\n"
            "    then restart the server.\n"
        )

    def _build_pipeline(self, n_features: int):
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.decomposition import TruncatedSVD
        from sklearn.pipeline import Pipeline
        from sklearn.preprocessing import Normalizer

        n_components = min(EMBED_DIM, n_features - 1)
        steps = [
            ("tfidf", TfidfVectorizer(
                max_features=8000,
                ngram_range=(1, 2),
                sublinear_tf=True,
            )),
        ]
        if n_components >= 2:
            steps += [
                ("svd",       TruncatedSVD(n_components=n_components, random_state=42)),
                ("normalise", Normalizer(copy=False)),
            ]
        return Pipeline(steps)

    def _refit(self, extra: list[str]) -> None:
        self._corpus.extend(extra)
        if len(self._corpus) > 50_000:
            self._corpus = self._corpus[-50_000:]

        corpus = list(dict.fromkeys(self._corpus))
        from sklearn.feature_extraction.text import TfidfVectorizer
        probe      = TfidfVectorizer(max_features=8000, ngram_range=(1, 2))
        probe.fit(corpus)
        n_features = len(probe.vocabulary_)

        self._pipeline = self._build_pipeline(n_features)
        self._pipeline.fit(corpus)
        self._fitted   = True

    def _pad_to_dim(self, matrix: np.ndarray) -> np.ndarray:
        current = matrix.shape[1]
        if current >= EMBED_DIM:
            return matrix[:, :EMBED_DIM]
        pad = np.zeros((matrix.shape[0], EMBED_DIM - current), dtype=np.float32)
        return np.hstack([matrix, pad])

    def encode(self, texts: list[str]) -> np.ndarray:
        self._refit(texts)
        raw = self._pipeline.transform(texts)
        if hasattr(raw, "toarray"):
            raw = raw.toarray()
        return self._pad_to_dim(raw.astype(np.float32))

    @property
    def name(self) -> str:
        return "TF-IDF+SVD (keyword fallback — semantic search degraded)"

    @property
    def is_semantic(self) -> bool:
        return False


# ── Factory / singleton ───────────────────────────────────────────────────────

_embedder: BaseEmbedder | None = None


def get_embedder() -> BaseEmbedder:
    global _embedder
    if _embedder is not None:
        return _embedder

    backend = os.getenv("EMBED_BACKEND", "auto").lower()

    # ── Explicit TF-IDF ───────────────────────────────────────────────────────
    if backend == "tfidf":
        _embedder = TFIDFEmbedder()
        logger.warning("Embedder: TF-IDF (forced — semantic search degraded)")
        return _embedder

    # ── MiniLM (forced) ───────────────────────────────────────────────────────
    if backend == "minilm":
        try:
            _embedder = MiniLMEmbedder()
            logger.info("Embedder: %s", _embedder.name)
            return _embedder
        except Exception as exc:
            raise RuntimeError(
                f"Could not load MiniLM model '{EMBED_MODEL}'.\n"
                f"Make sure sentence-transformers is installed:\n"
                f"    pip install sentence-transformers\n"
                f"Original error: {exc}"
            ) from exc

    # ── Auto: try MiniLM, raise clearly on failure ────────────────────────────
    if backend == "auto":
        try:
            _embedder = MiniLMEmbedder()
            logger.info("Embedder: %s", _embedder.name)
            return _embedder
        except Exception as exc:
            # In 'auto' mode we still fall back, but log a clear error
            logger.error(
                "❌ MiniLM failed to load: %s\n"
                "   Falling back to TF-IDF — semantic search is degraded.\n"
                "   Fix: pip install sentence-transformers  then restart.",
                exc,
            )
            _embedder = TFIDFEmbedder()
            return _embedder

    raise ValueError(
        f"Unknown EMBED_BACKEND={backend!r}. "
        "Valid options: 'auto' (default), 'minilm', 'tfidf'."
    )