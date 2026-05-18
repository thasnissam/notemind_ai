# NoteMind AI

## AI-Powered Personal Knowledge Management System using Semantic Search and Retrieval-Augmented Generation (RAG)

---

## Project Overview

NoteMind AI is an AI-powered Personal Knowledge Management (PKM) system developed as a Final Year Project. The system combines Semantic Search, Vector Databases, and Retrieval-Augmented Generation (RAG) to improve document retrieval and contextual knowledge interaction.

The system enables users to upload documents, perform semantic similarity searches, and receive grounded AI-generated responses using uploaded content.

---

## Features

- Semantic Search using Sentence-BERT embeddings
- Retrieval-Augmented Generation (RAG)
- AI-powered contextual question answering
- PDF, DOCX, and PPTX document support
- Text note management
- Web clipping enhancement feature
- ChromaDB vector database integration
- Google Gemini API integration
- Confidence-aware retrieval filtering
- Authentication system

---

## Technologies Used

### Frontend
- React
- Tailwind CSS
- Vite

### Backend
- FastAPI
- Python

### Database
- SQLite

### Vector Database
- ChromaDB

### AI & NLP
- Sentence-Transformers (MiniLM)
- Google Gemini API

---

## System Workflow

1. User uploads documents or notes
2. Documents are converted into text
3. Text is divided into chunks
4. Sentence-BERT generates embeddings
5. Embeddings are stored in ChromaDB
6. Semantic similarity search retrieves relevant chunks
7. Gemini API generates grounded AI responses

---

## Supported File Types

- PDF
- DOCX
- PPTX
- Text Notes
- Web Clipped Content

---

## Project Structure

```text
notemind_ai/
│
├── backend/
├── frontend/
├── diagrams/
├── screenshots/
├── report/
└── README.md
