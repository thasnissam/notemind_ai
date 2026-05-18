from typing import List, Optional
from pydantic import BaseModel, field_validator

# ── SHARED MODELS ──

class SourceItem(BaseModel):
    doc_id: int
    title: str
    type: str
    tag: str = "general"
    content: Optional[str] = None  # Added so you can see the snippet in the chat

class FlashcardItem(BaseModel):
    question: str
    answer: str

# ── AUTH MODELS ──

class SignupRequest(BaseModel):
    username: str
    password: str

    @field_validator("username")
    @classmethod
    def username_rules(cls, v: str) -> str:
        if len(v.strip()) < 3:
            raise ValueError("Username must be at least 3 characters")
        return v.strip()

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: int
    username: str
    class Config:
        from_attributes = True

# ── CHAT & RAG MODELS ──

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    query: str
    answer: str
    sources: List[SourceItem]
    # We make these Optional so the app doesn't crash if the AI engine is offline
    insight: Optional[str] = "No deep insight available."
    flashcards: Optional[List[FlashcardItem]] = []
    chunks_used: Optional[int] = 0

class MessageResponse(BaseModel):
    message: str