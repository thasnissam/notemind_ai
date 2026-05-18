import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, FileText, Link, Type, Presentation, FileType } from 'lucide-react'
import { apiUploadFile, apiUploadURL, apiUploadText } from '../api'

const TABS = [
  { id: 'file', label: 'File',  icon: FileText },
  { id: 'url',  label: 'URL',   icon: Link },
  { id: 'text', label: 'Text',  icon: Type },
]

const ACCEPTED = ".pdf,.pptx,.ppt,.docx,.doc"

export default function UploadModal({ onClose, onSuccess }) {
  const [tab,     setTab]     = useState('file')
  const [file,    setFile]    = useState(null)
  const [form,    setForm]    = useState({ title: '', tag: 'general', url: '', content: '' })
  const [status,  setStatus]  = useState('idle')
  const [message, setMessage] = useState('')
  const fileRef = useRef()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    // Auto-fill title from filename (strip extension)
    if (!form.title) {
      const name = f.name.replace(/\.[^/.]+$/, '')
      set('title', name)
    }
  }

  const handleSubmit = async () => {
    setMessage('')
    if (!form.title.trim()) { setMessage('Please enter a title.'); return }

    setStatus('loading')
    try {
      if (tab === 'file') {
        if (!file) throw new Error('Please select a file.')
        await apiUploadFile(file, form.title, form.tag)
      } else if (tab === 'url') {
        if (!form.url.trim()) throw new Error('Please enter a URL.')
        await apiUploadURL(form.url, form.title, form.tag)
      } else {
        if (!form.content.trim()) throw new Error('Please enter note content.')
        await apiUploadText(form.content, form.title, form.tag)
      }

      setStatus('success')
      setMessage('Saved and indexed successfully!')
      onSuccess?.()
      setTimeout(onClose, 1500)
    } catch (err) {
      setStatus('error')
      setMessage(err.message || 'Upload failed.')
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(10,10,20,0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1,   opacity: 1 }}
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          padding: 30, borderRadius: 20, width: '100%', maxWidth: 460,
          color: 'var(--text-primary)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontWeight: 700 }}>Add to NoteMind</h3>
          <X size={20} onClick={onClose} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: tab === t.id ? 'var(--accent)' : 'var(--bg-secondary)',
                color: tab === t.id ? '#fff' : 'var(--text-muted)',
                fontWeight: tab === t.id ? 600 : 400, fontSize: '0.85rem'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* File upload â€” accepts PDF, PPTX, DOCX */}
          {tab === 'file' && (
            <div>
              <input
                type="file"
                accept={ACCEPTED}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                ref={fileRef}
              />
              <div
                onClick={() => fileRef.current.click()}
                style={{
                  border: `2px dashed ${file ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 12, padding: '20px', textAlign: 'center',
                  cursor: 'pointer', background: file ? 'var(--accent-light)' : 'var(--bg-secondary)',
                  transition: 'all 0.2s'
                }}
              >
                <FileText size={24} color={file ? 'var(--accent)' : 'var(--text-muted)'} style={{ marginBottom: 8 }} />
                {file ? (
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>
                    {file.name}
                  </p>
                ) : (
                  <>
                    <p style={{ margin: '0 0 4px', fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                      Click to select a file
                    </p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Supported: PDF, PPTX, DOCX
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {tab === 'url' && (
            <input
              className="input-field"
              placeholder="Paste URL here..."
              value={form.url}
              onChange={e => set('url', e.target.value)}
            />
          )}

          {tab === 'text' && (
            <textarea
              className="input-field"
              placeholder="Write your note..."
              value={form.content}
              onChange={e => set('content', e.target.value)}
              style={{ minHeight: 100, resize: 'vertical' }}
            />
          )}

          <input
            className="input-field"
            placeholder="Title"
            value={form.title}
            onChange={e => set('title', e.target.value)}
          />
          <input
            className="input-field"
            placeholder="Tag (e.g. lecture, research)"
            value={form.tag}
            onChange={e => set('tag', e.target.value)}
          />
        </div>

        {message && (
          <p style={{
            color: status === 'error' ? '#f87171' : '#34d399',
            fontSize: 13, marginTop: 14, marginBottom: 0
          }}>
            {message}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={status === 'loading'}
          style={{
            width: '100%', marginTop: 20, padding: 12, borderRadius: 10,
            background: status === 'loading' ? 'var(--border)' : 'var(--accent)',
            color: 'white', border: 'none', fontWeight: 700, cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            fontSize: '0.95rem'
          }}
        >
          {status === 'loading' ? 'Processing & Indexing' : 'Save to Library'}
        </button>
      </motion.div>
    </div>
  )
}