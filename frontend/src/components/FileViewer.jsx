import { useState, useEffect } from 'react'
import { X, Maximize2, Minimize2, ExternalLink, FileText, BookOpen, Link, Presentation, FileType } from 'lucide-react'

function typeInfo(type) {
  switch (type) {
    case 'pdf':  return { icon: <FileText size={18} color="#ef4444" />,     label: 'PDF',          color: '#ef4444' }
    case 'pptx': return { icon: <Presentation size={18} color="#f97316" />, label: 'PowerPoint',   color: '#f97316' }
    case 'docx': return { icon: <FileType size={18} color="#3b82f6" />,     label: 'Word',         color: '#3b82f6' }
    case 'url':  return { icon: <Link size={18} color="#6366f1" />,         label: 'Web Clip',     color: '#6366f1' }
    default:     return { icon: <BookOpen size={18} color="#10b981" />,     label: 'Note',         color: '#10b981' }
  }
}

export default function FileViewer({ file, onClose, variant = 'modal' }) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  if (!file) return null

  const inner = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <ViewerHeader file={file} onClose={onClose} isFullscreen={isFullscreen} onToggleFullscreen={() => setIsFullscreen(f => !f)} />
      <ViewerBody file={file} />
    </div>
  )

  if (isFullscreen) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'var(--bg-card)', display: 'flex', flexDirection: 'column' }}>
        {inner}
      </div>
    )
  }

  if (variant === 'modal') {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }} onClick={onClose}>
        <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', width: '92%', height: '92%', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          {inner}
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {inner}
    </div>
  )
}

function ViewerHeader({ file, onClose, isFullscreen, onToggleFullscreen }) {
  const { icon, label } = typeInfo(file.type)
  return (
    <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        {icon}
        <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.title}</span>
        <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 6, background: 'var(--accent-light)', color: 'var(--accent)', fontWeight: 600, flexShrink: 0 }}>{label}</span>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <button onClick={onToggleFullscreen} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.76rem' }}>
          {isFullscreen ? <><Minimize2 size={13} /> Exit</> : <><Maximize2 size={13} /> Fullscreen</>}
        </button>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}>
          <X size={19} />
        </button>
      </div>
    </div>
  )
}

function ViewerBody({ file }) {
  if (file.type === 'pdf')  return <BlobViewer file={file} mimeType="application/pdf" />
  if (file.type === 'pptx') return <BlobViewer file={file} mimeType="application/vnd.openxmlformats-officedocument.presentationml.presentation" fallback={<PptxFallback file={file} />} />
  if (file.type === 'docx') return <BlobViewer file={file} mimeType="application/vnd.openxmlformats-officedocument.wordprocessingml.document" fallback={<DocxFallback file={file} />} />
  if (file.type === 'url')  return <UrlViewer file={file} />
  return <NoteViewer file={file} />
}

// ── Universal blob viewer — works for PDF, PPTX, DOCX ────────────────────────
// Fetches the original file with auth token, creates a blob URL, renders in iframe
function BlobViewer({ file, mimeType, fallback }) {
  const [blobUrl, setBlobUrl] = useState(null)
  const [status,  setStatus]  = useState('loading')

  useEffect(() => {
    if (!file.doc_id) { setStatus('fallback'); return }
    const token = localStorage.getItem('notemind_token') || ''
    let objUrl = null

    fetch(`http://127.0.0.1:8000/api/docs/file/${file.doc_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.blob() })
      .then(blob => {
        objUrl = URL.createObjectURL(new Blob([blob], { type: mimeType }))
        setBlobUrl(objUrl)
        setStatus('ready')
      })
      .catch(err => {
        console.warn('BlobViewer fetch failed:', err.message)
        setStatus('fallback')
      })

    return () => { if (objUrl) URL.revokeObjectURL(objUrl) }
  }, [file.doc_id, mimeType])

  if (status === 'loading') {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'fvspin 0.7s linear infinite' }} />
        Loading file…
        <style>{`@keyframes fvspin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  if (status === 'fallback') {
    // Show extracted text fallback for pptx/docx, or plain text for pdf
    if (fallback) return fallback
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
        <div style={{ marginBottom: 14, padding: '10px 14px', background: 'rgba(249,115,22,0.1)', borderRadius: 9, fontSize: '0.82rem', color: '#f97316' }}>
          ⚠️ Original file not found. Please re-upload to view the full document. Showing extracted text.
        </div>
        <pre style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: '0.9rem', color: 'var(--text-primary)', fontFamily: 'inherit' }}>
          {file.content}
        </pre>
      </div>
    )
  }

  return (
    <iframe
      src={blobUrl}
      title={file.title}
      style={{ flex: 1, border: 'none', width: '100%', height: '100%', minHeight: 0 }}
    />
  )
}

// ── PPTX text fallback (slide cards) ─────────────────────────────────────────
function PptxFallback({ file }) {
  const raw   = file.content || ''
  const parts = raw.split(/(\[Slide \d+\])/).filter(Boolean)
  const slides = []
  for (let i = 0; i < parts.length; i++) {
    if (/^\[Slide \d+\]$/.test(parts[i])) {
      slides.push({ label: parts[i], text: (parts[i + 1] || '').trim() })
      i++
    }
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#111', padding: '24px' }}>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        <div style={{ marginBottom: 20, padding: '8px 14px', background: 'rgba(249,115,22,0.12)', borderRadius: 9, fontSize: '0.8rem', color: '#f97316', fontWeight: 500 }}>
          ⚠️ Re-upload this file to view it as original. Showing extracted slide text.
        </div>
        {slides.map((s, i) => (
          <div key={i} style={{ marginBottom: 16, background: 'linear-gradient(135deg,#1e1a2e,#16131f)', borderRadius: 14, border: '1px solid rgba(249,115,22,0.2)', overflow: 'hidden' }}>
            <div style={{ background: 'rgba(249,115,22,0.1)', padding: '9px 18px', borderBottom: '1px solid rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(249,115,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700, color: '#f97316' }}>{i + 1}</div>
              <span style={{ fontSize: '0.7rem', color: '#f97316', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</span>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: '0.9rem', color: '#e8e4f0' }}>{s.text || '(no text on this slide)'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── DOCX text fallback (word-like page) ───────────────────────────────────────
function DocxFallback({ file }) {
  const paragraphs = (file.content || '').split('\n').filter(p => p.trim())
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#f0ede8', padding: '24px' }}>
      <div style={{ maxWidth: 740, margin: '0 auto' }}>
        <div style={{ marginBottom: 16, padding: '8px 14px', background: 'rgba(59,130,246,0.1)', borderRadius: 9, fontSize: '0.8rem', color: '#3b82f6', fontWeight: 500 }}>
          ⚠️ Re-upload this file to view it as original. Showing extracted text.
        </div>
        <div style={{ background: '#fff', borderRadius: 4, boxShadow: '0 2px 40px rgba(0,0,0,0.15)', padding: '56px 64px', minHeight: 500 }}>
          <h2 style={{ margin: '0 0 24px', fontSize: '1.35rem', fontWeight: 700, color: '#111', fontFamily: 'Georgia,serif', borderBottom: '2px solid #e5e5e5', paddingBottom: 14 }}>{file.title}</h2>
          {paragraphs.map((para, i) => {
            const isHeading = para.length < 80 && para === para.toUpperCase() && para.trim().length > 3
            return (
              <p key={i} style={{ margin: `0 0 ${isHeading ? 4 : 12}px`, lineHeight: 1.85, fontSize: isHeading ? '0.95rem' : '0.92rem', color: isHeading ? '#111' : '#2d2d2d', fontWeight: isHeading ? 700 : 400, fontFamily: 'Georgia,serif', marginTop: isHeading ? 20 : 0 }}>
                {para}
              </p>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── URL viewer ────────────────────────────────────────────────────────────────
function UrlViewer({ file }) {
  const [failed, setFailed] = useState(false)
  const urlMatch = (file.content || '').match(/\[Clipped from: (.+?)\]/)
  const altMatch = (file.content || '').match(/URL Source: (.+?)(\n|$)/)
  const url      = file.source_url || (urlMatch ? urlMatch[1].trim() : '') || (altMatch ? altMatch[1].trim() : '')
  const bodyText = (file.content || '').replace(/\[Clipped from:.*?\]\n*/g, '').replace(/URL Source:.*?(\n|$)/g, '').trim()

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '9px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <Link size={13} color="var(--text-muted)" />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url || 'Clipped web content'}</span>
        {url && (
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: 'var(--accent)', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600, flexShrink: 0 }}>
            <ExternalLink size={12} /> Open URL
          </a>
        )}
      </div>
      {url && !failed ? (
        <iframe src={url} title={file.title} style={{ flex: 1, border: 'none', width: '100%', minHeight: 0 }} sandbox="allow-scripts allow-same-origin allow-popups allow-forms" onError={() => setFailed(true)} />
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
          {failed && <div style={{ marginBottom: 12, padding: '9px 14px', background: 'rgba(99,102,241,0.1)', borderRadius: 9, fontSize: '0.8rem', color: '#818cf8' }}>🔒 This site blocks embedding. Showing saved content.</div>}
          <pre style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: '0.9rem', color: 'var(--text-primary)', fontFamily: 'inherit' }}>{bodyText || file.content}</pre>
        </div>
      )}
    </div>
  )
}

// ── Note viewer ───────────────────────────────────────────────────────────────
function NoteViewer({ file }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', background: 'var(--bg-secondary)', borderRadius: 14, padding: '26px 30px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
          <BookOpen size={15} color="#10b981" />
          <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Text Note</span>
        </div>
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.85, fontSize: '0.93rem', color: 'var(--text-primary)' }}>
          {file.content || 'This note has no content.'}
        </div>
      </div>
    </div>
  )
}

