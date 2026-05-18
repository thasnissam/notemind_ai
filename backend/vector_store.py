"""
vector_store.py — ChromaDB semantic search for NoteMind
"""
import chromadb
from config import CHROMA_COLLECTION, CHROMA_PATH
from embedder import get_embedder

_collection = None


def _get_collection():
    global _collection
    if _collection is None:
        client = chromadb.PersistentClient(path=CHROMA_PATH)
        _collection = client.get_or_create_collection(
            name=CHROMA_COLLECTION,
            metadata={"hnsw:space": "cosine"}
        )
    return _collection


def add_document(doc_id: int, chunks: list, user_id: int, metadata: dict = {}):
    if not chunks:
        return

    col        = _get_collection()
    embedder   = get_embedder()
    texts      = [c["text"] for c in chunks]
    embeddings = embedder.encode(texts).tolist()
    ids        = [c["chunk_id"] for c in chunks]
    metas      = [
        {
            "doc_id":      int(doc_id),
            "user_id":     int(user_id),
            "chunk_index": int(c["chunk_index"]),
            "title":       str(metadata.get("title", "Untitled")),
            "tag":         str(metadata.get("tag", "general")),
            "type":        str(metadata.get("type", "pdf")),
        }
        for c in chunks
    ]
    col.upsert(ids=ids, embeddings=embeddings, documents=texts, metadatas=metas)
    print(f"✅ Indexed {len(chunks)} chunks for '{metadata.get('title')}' (user={user_id})")


def query(text: str, *, user_id: int, top_k: int = 8) -> list:
    col = _get_collection()

    if col.count() == 0:
        print("⚠ ChromaDB is empty")
        return []

    # Count this user's chunks only
    try:
        user_data  = col.get(where={"user_id": int(user_id)})
        user_count = len(user_data["ids"])
    except Exception:
        user_count = col.count()

    if user_count == 0:
        print(f"⚠ No chunks for user_id={user_id}")
        return []

    n = min(top_k, user_count)

    embedder  = get_embedder()
    embedding = embedder.encode([text]).tolist()

    results = col.query(
        query_embeddings=embedding,
        n_results=n,
        where={"user_id": int(user_id)},
        include=["documents", "metadatas", "distances"],
    )

    hits = []
    if results["ids"] and results["ids"][0]:
        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0],
        ):
            similarity = round(1.0 - float(dist), 4)
            hits.append({
                "text":       doc,
                "similarity": similarity,
                "title":      meta.get("title", "Untitled"),
                "tag":        meta.get("tag", "general"),
                "doc_id":     int(meta.get("doc_id", 0)),
                "type":       meta.get("type", "pdf"),
            })

    hits.sort(key=lambda x: x["similarity"], reverse=True)

    # Show scores in terminal for debugging
    print(f"\n🔍 '{text[:50]}'")
    for h in hits[:5]:
        bar = "█" * int(h["similarity"] * 15)
        print(f"  {h['similarity']:.3f} {bar:<15} {h['title']}")

    return hits


def delete_document(doc_id: int):
    col = _get_collection()
    col.delete(where={"doc_id": int(doc_id)})
    print(f"🗑 Deleted doc_id={doc_id}")