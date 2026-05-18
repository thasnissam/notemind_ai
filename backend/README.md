# NoteMind Backend — Auth + RAG API

Secure authentication and local Retrieval-Augmented Generation in one FastAPI service.
No external LLM required — everything runs on CPU.

---

## Stack

| Layer            | Library                              |
|------------------|--------------------------------------|
| Framework        | FastAPI 0.115 + Uvicorn              |
| Database         | SQLite via SQLAlchemy 2.0            |
| Auth             | bcrypt (cost 12) + HS256 JWT         |
| Vector store     | ChromaDB 1.5 (persistent, local)     |
| Embeddings (prod)| sentence-transformers all-MiniLM-L6-v2 |
| Embeddings (dev) | TF-IDF + TruncatedSVD (offline, auto)|
| Text extraction  | pypdf, BeautifulSoup4, requests      |
| Spell correction | TextBlob                             |
| Validation       | Pydantic v2                          |

---

## Quick start

```bash
pip install -r requirements.txt

# Production (downloads MiniLM model on first run, ~22 MB)
uvicorn main:app --reload --port 8000

# Offline / CI (no model download needed)
EMBED_BACKEND=tfidf uvicorn main:app --reload --port 8000
```

Interactive API docs: **http://localhost:8000/docs**

---

## Environment variables

| Variable        | Default                             | Description                          |
|-----------------|-------------------------------------|--------------------------------------|
| `EMBED_BACKEND` | `auto`                              | `auto` \| `minilm` \| `tfidf`        |
| `SECRET_KEY`    | placeholder in config.py            | JWT signing secret (change in prod!) |

Generate a secure key:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## API reference

### Auth

| Method | Path      | Auth | Description                       |
|--------|-----------|------|-----------------------------------|
| POST   | /signup   | —    | Register (username + password)    |
| POST   | /login    | —    | Returns JWT (30 min expiry)       |
| GET    | /me       | JWT  | Current user profile              |

### RAG

| Method | Path               | Auth | Description                          |
|--------|--------------------|------|--------------------------------------|
| POST   | /upload            | JWT  | Upload PDF or plain-text file        |
| POST   | /upload/url        | JWT  | Scrape and ingest a public URL       |
| DELETE | /upload/{doc_id}   | JWT  | Remove document from vector store    |
| POST   | /chat              | JWT  | Query knowledge base — returns RAG response |

---

## Request / response examples

### POST /upload (multipart form)
```
file   : <binary>          # PDF or .txt, max 5 MB
title  : "Deep Work Notes" # required
tag    : "productivity"    # optional, default "general"
```
```json
{ "message": "Successfully processed 'Deep Work Notes'",
  "doc_id": "a1b2c3d4e5f6...",
  "chunks_stored": 4 }
```

### POST /upload/url
```json
{ "url": "https://example.com/article", "title": "Article Title", "tag": "research" }
```

### POST /chat
```json
{ "query": "What is deep work and why does it matter?" }
```
```json
{
  "query":       "What is deep work and why does it matter?",
  "answer":      "Deep Work is defined as professional activities performed ...",
  "insight":     "Answer drawn from \"Deep Work Notes\". primarily under the 'productivity' theme.",
  "sources":     [{ "doc_id": "a1b2...", "title": "Deep Work Notes",
                    "tag": "productivity", "type": "text", "source": "notes.txt" }],
  "flashcards":  [
    { "question": "What is Deep Work?",
      "answer":   "professional activities performed in distraction-free concentration" },
    { "question": "What is Shallow work?",
      "answer":   "logistical tasks performed while distracted that create little value" }
  ],
  "chunks_used": 1
}
```

### Fallback (no relevant chunks)
```json
{
  "answer":     "No relevant information found in your knowledge base. Try uploading some notes or documents first.",
  "chunks_used": 0,
  "sources":    [],
  "flashcards": []
}
```

---

## RAG pipeline

```
query
  │
  ▼
correct_query()        ← TextBlob spell correction (≤12 words)
  │
  ▼
encode(query)          ← MiniLM-L6-v2 or TF-IDF+SVD
  │
  ▼
ChromaDB.query()       ← cosine similarity, top-5 chunks, user-scoped
  │
  ▼
_synthesise_answer()   ← rank sentences by query-word overlap, take top 6
  │
  ▼
_synthesise_insight()  ← count tags/titles, emit one-line theme note
  │
  ▼
generate_flashcards()  ← regex definition extraction → keyword heuristic fallback
  │
  ▼
ChatResponse           ← query, answer, insight, sources, flashcards, chunks_used
```

---

## Embedder backends

| Backend   | Quality  | Requires     | When used              |
|-----------|----------|--------------|------------------------|
| MiniLM    | High     | HF download  | `EMBED_BACKEND=minilm` or `auto` with network |
| TF-IDF    | Good     | Nothing      | `EMBED_BACKEND=tfidf` or `auto` without network |

`auto` (default) tries MiniLM first; falls back to TF-IDF if the model cannot be loaded.
Both backends return 384-dimensional L2-normalised vectors compatible with ChromaDB.

---

## Security notes

- Passwords hashed with **bcrypt cost factor 12** — never stored in plaintext.
- Login returns the **same generic error** for wrong username and wrong password.
- JWT `sub` = username; expiry enforced on every decode.
- All RAG queries are **user-scoped** in ChromaDB — users cannot access each other's data.
- Replace `SECRET_KEY` in `config.py` before any production deployment.
