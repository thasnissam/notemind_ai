import { useNavigate } from 'react-router-dom'
import UploadModal from '../components/UploadModal'

const STORAGE_KEY = 'notemind_uploads'

export default function UploadPage() {
  const navigate = useNavigate()

  const handleSuccess = (result) => {
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      if (!existing.find(i => i.doc_id === result.doc_id)) {
        const item = { doc_id: result.doc_id, title: result.title || 'Untitled', tag: result.tag || 'general', type: result.type || 'text', source: result.source || '', chunks_stored: result.chunks_stored || 0, created_at: Date.now() }
        localStorage.setItem(STORAGE_KEY, JSON.stringify([item, ...existing]))
        window.dispatchEvent(new Event('notemind_upload'))
      }
    } catch {}
  }

  return <UploadModal onClose={() => navigate(-1)} onSuccess={handleSuccess} />
}
