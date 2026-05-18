"""
rag_engine.py
─────────────
Semantic search + answer generation using the Google Gemini API (free tier).
"""
from __future__ import annotations
import os
import traceback
from vector_store import query as vstore_query
from config import TOP_K, MIN_RELEVANCE

# HARD_THRESHOLD: below this = always "not found", no fallback ever
# SOFT_THRESHOLD: MIN_RELEVANCE() from config = 0.40 for MiniLM
#
# < HARD  → not found (clean rejection)
# HARD–SOFT → low-confidence answer (flagged)
# ≥ SOFT  → normal confident answer
HARD_THRESHOLD = 0.20

_model = None

def _get_model():
    global _model
    if _model is None:
        try:
            import google.generativeai as genai
        except ImportError:
            raise RuntimeError("Run: pip install google-generativeai")
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError(
                "GEMINI_API_KEY not set. Get free key at https://aistudio.google.com/app/apikey"
            )
        genai.configure(api_key=api_key)
        _model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=(
                "You are NoteMind, a helpful study assistant. "
                "Answer questions strictly based on the provided document excerpts. "
                "Be concise (3-5 sentences). "
                "If the excerpts do not contain enough information to answer the question, "
                "respond with exactly: "
                "'This information is not available in your uploaded documents.'"
            ),
            generation_config={"temperature": 0.2, "max_output_tokens": 400},
        )
        print("Gemini model ready: gemini-1.5-flash")
    return _model


def _call_gemini(prompt: str) -> str:
    return _get_model().generate_content(prompt).text.strip()


def _not_found(raw_query: str, best_sim: float) -> dict:
    """Clean rejection — never shows wrong sources."""
    return {
        "query":       raw_query,
        "answer":      "This information is not available in your uploaded documents.",
        "sources":     [],
        "insight":     f"No relevant documents found. Best match was only {best_sim:.0%} — below the minimum threshold.",
        "flashcards":  [],
        "chunks_used": 0,
    }


def answer_query(raw_query: str, user_id: int) -> dict:

    # 1. Vector search
    chunks = vstore_query(raw_query, user_id=user_id, top_k=TOP_K)

    if not chunks:
        return {
            "query":       raw_query,
            "answer":      "No documents uploaded yet. Please upload some files first.",
            "sources":     [],
            "insight":     "No indexed documents found.",
            "flashcards":  [],
            "chunks_used": 0,
        }

    best_sim = chunks[0]["similarity"]

    # 2. Hard cutoff — noise queries never get a response
    if best_sim < HARD_THRESHOLD:
        return _not_found(raw_query, best_sim)

    # 3. Soft threshold — genuinely relevant chunks
    soft_threshold = MIN_RELEVANCE()        # 0.40 for MiniLM
    good_chunks    = [c for c in chunks if c["similarity"] >= soft_threshold]
    low_confidence = False

    # 4. Between HARD and SOFT: use only chunks above hard cutoff, flag as low confidence
    if not good_chunks:
        low_confidence = True
        good_chunks    = [c for c in chunks if c["similarity"] >= HARD_THRESHOLD]
        if not good_chunks:
            return _not_found(raw_query, best_sim)

    # 5. Deduplicate sources
    seen, sources = set(), []
    for c in good_chunks:
        if c["doc_id"] not in seen:
            seen.add(c["doc_id"])
            sources.append({
                "doc_id":  c["doc_id"],
                "title":   c["title"],
                "type":    c["type"],
                "tag":     c.get("tag", "general"),
                "content": c["text"],
            })

    # 6. Build RAG context (top 4 chunks)
    context = "\n\n".join(
        f'[From "{c["title"]}" — {c["similarity"]:.0%} match]:\n{c["text"]}'
        for c in good_chunks[:4]
    )

    prompt = (
        f"The user asked: {raw_query}\n\n"
        f"Relevant excerpts from their uploaded documents:\n\n{context}\n\n"
        f"Answer using only the excerpts above. "
        f"If they do not actually answer the question, say so clearly."
    )

    # 7. Call Gemini
    ai_answer = None
    try:
        ai_answer = _call_gemini(prompt)
    except Exception:
        print(traceback.format_exc())

    # 8. Fallback if Gemini is unavailable
    if not ai_answer:
        best = good_chunks[0]
        ai_answer = (
            f"(AI engine unavailable — best matching passage from \"{best['title']}\")\n\n"
            f"{best['text']}"
        )

    # 9. Build insight string
    conf = " Low confidence — match is weak, answer may not be accurate." if low_confidence else ""
    insight = (
        f"Found {len(good_chunks)} passage(s) across {len(sources)} document(s). "
        f"Best match: {best_sim:.0%} similarity.{conf}"
    )

    return {
        "query":       raw_query,
        "answer":      ai_answer,
        "sources":     sources,
        "insight":     insight,
        "flashcards":  [],
        "chunks_used": len(good_chunks),
    }