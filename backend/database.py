from sqlalchemy import create_engine, Column, Integer, String, Text, LargeBinary, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

DATABASE_URL = "sqlite:///./notemind.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id       = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    documents = relationship("Document", back_populates="owner")


class Document(Base):
    __tablename__ = "documents"
    id         = Column(Integer, primary_key=True, index=True)
    title      = Column(String(255), nullable=False)
    tag        = Column(String(50),  default="general")
    type       = Column(String(20),  default="pdf")     # pdf | note | url | pptx | docx
    content    = Column(Text,        nullable=False)     # extracted text
    source_url = Column(String(2000), nullable=True)     # original URL for web clips
    raw_bytes  = Column(LargeBinary,  nullable=True)     # original PDF binary
    user_id    = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    owner      = relationship("User", back_populates="documents")


class ChatMessage(Base):
    __tablename__ = "chat_history"
    id        = Column(Integer, primary_key=True, index=True)
    user_id   = Column(Integer, ForeignKey("users.id"))
    query     = Column(Text, nullable=False)
    response  = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()