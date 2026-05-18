import io
import traceback
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import User, Document, get_db, init_db
from dependencies import get_current_user
from rag_engine import answer_query
from schemas import SignupRequest, LoginRequest, ChatRequest, ChatResponse
from text_utils import chunk_text, extract_pdf, extract_pptx, extract_docx
import vector_store
from security import hash_password, verify_password, create_access_token


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    print("🚀 NoteMind Database Initialized")
    yield


app = FastAPI(title="NoteMind API v3.2", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TextNoteRequest(BaseModel):
    title: str
    content: str = ""
    url: str = ""
    tag: str = "general"


class DocumentOut(BaseModel):
    id: int
    title: str
    tag: Optional[str] = "general"
    type: Optional[str] = "pdf"
    content: str
    source_url: Optional[str] = None

    class Config:
        from_attributes = True


# ── File type detection ───────────────────────────────────────────────────────

def detect_type_and_extract(filename: str, raw_bytes: bytes) -> tuple[str, str]:
    name = (filename or "").lower()
    if name.endswith(".pdf"):
        return "pdf", extract_pdf(raw_bytes)
    if name.endswith(".pptx") or name.endswith(".ppt"):
        try:
            return "pptx", extract_pptx(raw_bytes)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not read PowerPoint: {e}")
    if name.endswith(".docx") or name.endswith(".doc"):
        try:
            return "docx", extract_docx(raw_bytes)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not read Word document: {e}")
    raise HTTPException(status_code=400, detail="Unsupported file type. Please upload PDF, PPTX, or DOCX.")


# ── MIME types for serving files back ────────────────────────────────────────

MIME_MAP = {
    "pdf":  "application/pdf",
    "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

EXT_MAP = {
    "pdf":  "pdf",
    "pptx": "pptx",
    "docx": "docx",
}


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "online", "message": "NoteMind Backend Active"}


@app.post("/signup")
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == body.username).first():
        raise HTTPException(status_code=400, detail="User already exists")
    new_user = User(username=body.username, password=hash_password(body.password))
    db.add(new_user)
    db.commit()
    return {"message": "User created successfully"}


@app.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == body.username).first()
    if not user or not verify_password(body.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = create_access_token(data={"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}


@app.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "username": current_user.username}


@app.get("/collections", response_model=List[DocumentOut])
def get_collections(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.id.desc()).all()


@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    title: str = Form(...),
    tag: str = Form("general"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        raw_bytes = await file.read()
        # File type detection and extraction
        doc_type, text = detect_type_and_extract(file.filename, raw_bytes)

        if not text.strip():
            raise HTTPException(status_code=400, detail="No readable text found in this file.")

        new_doc = Document(
            title=title, content=text, tag=tag,
            user_id=current_user.id, type=doc_type,
            raw_bytes=raw_bytes   # ← store raw bytes for ALL types (pdf, pptx, docx)
        )
        db.add(new_doc)
        db.commit()
        db.refresh(new_doc)

        chunks = chunk_text(text, str(new_doc.id))
        if not chunks:
            raise HTTPException(status_code=400, detail="File has no readable text content.")

        vector_store.add_document(
            new_doc.id, chunks, current_user.id,
            metadata={"title": title, "tag": tag, "type": doc_type}
        )
        return {"message": f"Upload successful ({doc_type.upper()})", "doc_id": new_doc.id}

    except HTTPException:
        raise
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/upload-text")
async def upload_text(
    body: TextNoteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    import re
    content_to_save = body.content if body.content else f"URL Source: {body.url}"
    doc_type = "url" if (not body.content and body.url) else "note"

    source_url = body.url or None
    if not source_url and body.content:
        m = re.search(r"\[Clipped from: (.+?)\]", body.content)
        if m:
            source_url = m.group(1).strip()

    new_doc = Document(
        title=body.title, content=content_to_save, tag=body.tag,
        user_id=current_user.id, type=doc_type, source_url=source_url
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    chunks = chunk_text(content_to_save, str(new_doc.id))
    if chunks:
        vector_store.add_document(
            new_doc.id, chunks, current_user.id,
            metadata={"title": body.title, "tag": body.tag, "type": doc_type}
        )
    return {"message": "Note saved", "doc_id": new_doc.id}


@app.delete("/upload/{doc_id}")
def delete_document(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    vector_store.delete_document(doc_id)
    db.delete(doc)
    db.commit()
    return {"message": "Document deleted"}


@app.post("/chat", response_model=ChatResponse)
def chat(body: ChatRequest, current_user: User = Depends(get_current_user)):
    return answer_query(body.query, user_id=current_user.id)


@app.get("/api/docs/view/{doc_id}")
async def view_document(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"title": doc.title, "content": doc.content, "type": doc.type, "tag": doc.tag, "source_url": doc.source_url}


@app.get("/api/docs/file/{doc_id}")
async def serve_file(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Serve the original file bytes for any type — PDF, PPTX, DOCX.
    FileViewer fetches this with the auth token and creates a blob URL.
    """
    doc = db.query(Document).filter(
        Document.id == doc_id,
        Document.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if not doc.raw_bytes:
        raise HTTPException(status_code=404, detail="Original file not stored. Please re-upload this document.")

    mime = MIME_MAP.get(doc.type, "application/octet-stream")
    ext  = EXT_MAP.get(doc.type, "bin")

    return StreamingResponse(
        io.BytesIO(doc.raw_bytes),
        media_type=mime,
        headers={"Content-Disposition": f'inline; filename="{doc.title}.{ext}"'}
    )


# Keep the old PDF endpoint working for backwards compatibility
@app.get("/api/docs/pdf/{doc_id}")
async def serve_pdf(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await serve_file(doc_id, current_user, db)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)