# NoteMind — Frontend + Backend Integration

## Quick start

### 1. Start the backend
```bash
cd notemind-backend
pip install -r requirements.txt

# With MiniLM model (recommended for production):
uvicorn main:app --reload --port 8000

# Offline / CI (no model download needed):
EMBED_BACKEND=tfidf uvicorn main:app --reload --port 8000
```

### 2. Start the frontend
```bash
cd notemind
npm install
npm run dev       # → http://localhost:5173
```

## Environment variables

### Frontend (`notemind/.env`)
```
VITE_API_URL=http://localhost:8000
```
The frontend reads `VITE_API_URL` for all API calls. Change this for staging/production.

### Backend
```bash
EMBED_BACKEND=tfidf   # force offline TF-IDF embedder
SECRET_KEY=...        # JWT signing secret (change before deploying!)
```

## How it works

| Action           | Frontend → Backend                          |
|------------------|---------------------------------------------|
| Sign up          | POST /signup                                |
| Log in           | POST /login → stores JWT in localStorage    |
| Route protection | AppLayout checks `user` from AuthContext    |
| Upload PDF       | POST /upload (multipart)                    |
| Upload URL       | POST /upload/url (JSON)                     |
| Upload text      | POST /upload (multipart, text/plain blob)   |
| Chat             | POST /chat → answer + insight + sources + flashcards |
| Delete doc       | DELETE /upload/{doc_id}                     |
| Log out          | Clears JWT + user from localStorage         |

## Data flow notes

- **JWT storage**: `localStorage.getItem('notemind_token')`
- **Upload history**: `localStorage.getItem('notemind_uploads')` — an array of `{doc_id, title, tag, type, chunks_stored}`
- **Collections** and **Dashboard** both read from `notemind_uploads` and listen for the `notemind_upload` window event
- **Font size** is persisted in `localStorage.getItem('notemind_fontsize')`
- **Theme** (dark/light) is persisted in `localStorage.getItem('notemind-theme')`
