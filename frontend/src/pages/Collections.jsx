import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Library, Search, FileText, BookOpen, Link, Trash2, Loader2, AlertTriangle, X, Filter } from 'lucide-react'
import { apiGetCollections, apiDeleteDocument } from '../api'

const TYPE_COLORS = {
  pdf:  { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444',  icon: FileText },
  note: { bg: 'rgba(16,185,129,0.1)',  color: '#10b981',  icon: BookOpen },
  url:  { bg: 'rgba(99,102,241,0.1)',  color: '#6366f1',  icon: Link },
}

function getTypeStyle(type) {
  return TYPE_COLORS[type] || TYPE_COLORS.note
}

// ── In-screen Delete Confirmation Dialog ─────────────────────────────────────
function DeleteDialog({ file, onConfirm, onCancel, loading }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
    }}>
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        style={{
          background: 'var(--bg-card)', borderRadius: 20,
          border: '1px solid var(--border)', padding: 32,
          maxWidth: 420, width: '100%',
          boxShadow: '0 24px 60px rgba(0,0,0,0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: 'rgba(239,68,68,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <AlertTriangle size={22} color="#ef4444" />
          </div>
          <div>
            <h3 style={{ margin: '0 0 6px', color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem' }}>
              Delete Document?
            </h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>
              "<strong style={{ color: 'var(--text-primary)' }}>{file?.title}</strong>" will be permanently removed from your library and its AI memory will be erased. This cannot be undone.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '9px 20px', borderRadius: 10, border: '1px solid var(--border)',
              background: 'var(--bg-secondary)', color: 'var(--text-primary)',
              cursor: 'pointer', fontWeight: 500, fontSize: '0.88rem'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '9px 20px', borderRadius: 10, border: 'none',
              background: '#ef4444', color: '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 600, fontSize: '0.88rem',
              display: 'flex', alignItems: 'center', gap: 7,
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {loading ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Main Collections Page ─────────────────────────────────────────────────────
export default function Collections() {
  const { openFile } = useOutletContext()
  const [files, setFiles] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [tagFilter, setTagFilter] = useState('all')
  const [deleteTarget, setDeleteTarget] = useState(null)   // file to confirm
  const [deleteLoading, setDeleteLoading] = useState(false)

  // ── Load files ──
  const loadFiles = async () => {
    try {
      setLoading(true)
      const data = await apiGetCollections()
      setFiles((data || []).sort((a, b) => b.id - a.id))
    } catch (err) {
      console.error('Failed to load collections:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFiles()
    window.addEventListener('notemind_upload', loadFiles)
    return () => window.removeEventListener('notemind_upload', loadFiles)
  }, [])

  // ── Delete ──
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await apiDeleteDocument(deleteTarget.id)
      setFiles(prev => prev.filter(f => f.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      alert('Delete failed. Please ensure the backend is running.')
      console.error(err)
    } finally {
      setDeleteLoading(false)
    }
  }

  // ── Derived filter values ──
  const allTags = ['all', ...new Set(files.map(f => f.tag).filter(Boolean))]
  const allTypes = ['all', ...new Set(files.map(f => f.type).filter(Boolean))]

  const filtered = files.filter(f => {
    const matchSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.tag && f.tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchType = typeFilter === 'all' || f.type === typeFilter
    const matchTag  = tagFilter  === 'all' || f.tag  === tagFilter
    return matchSearch && matchType && matchTag
  })

  const chipStyle = (active) => ({
    padding: '6px 14px', borderRadius: 20, border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    background: active ? 'var(--accent-light)' : 'var(--bg-card)',
    color: active ? 'var(--accent)' : 'var(--text-muted)',
    cursor: 'pointer', fontSize: '0.8rem', fontWeight: active ? 600 : 400,
    transition: 'all 0.15s'
  })

  return (
    <div style={{ padding: '40px 60px', width: '100%', maxWidth: 1400 }}>

      {/* ── Header ── */}
      <header style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <Library size={24} color="var(--accent)" />
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', color: 'var(--text-primary)', margin: 0 }}>
            Your Knowledge Base
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
          {files.length} document{files.length !== 1 ? 's' : ''} indexed for semantic search
        </p>
      </header>

      {/* ── Search bar ── */}
      <div style={{ position: 'relative', maxWidth: 460, marginBottom: 20 }}>
        <Search size={17} style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--text-muted)', pointerEvents: 'none'
        }} />
        <input
          type="text"
          placeholder="Search by title or tag…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: '100%', padding: '11px 12px 11px 42px', borderRadius: 14,
            border: '1px solid var(--border)', background: 'var(--bg-card)',
            color: 'var(--text-primary)', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box'
          }}
        />
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 32, alignItems: 'flex-start' }}>
        {/* Type filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Filter size={11} /> Type
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            {allTypes.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} style={chipStyle(typeFilter === t)}>
                {t === 'all' ? 'All types' : t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Tag filter */}
        {allTags.length > 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Tag
            </span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {allTags.map(t => (
                <button key={t} onClick={() => setTagFilter(t)} style={chipStyle(tagFilter === t)}>
                  {t === 'all' ? 'All tags' : t}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Cards grid ── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
          <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} color="var(--accent)" />
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
          gap: 22
        }}>
          <AnimatePresence mode="popLayout">
            {filtered.map(file => {
              const ts = getTypeStyle(file.type)
              const Icon = ts.icon
              return (
                <motion.div
                  layout
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.18 } }}
                  onClick={() => openFile({
                    doc_id: file.id,
                    title: file.title,
                    type: file.type,
                    tag: file.tag,
                    content: file.content
                  })}
                  style={{
                    background: 'var(--bg-card)', borderRadius: 18,
                    border: '1px solid var(--border)', padding: '20px 22px',
                    cursor: 'pointer', position: 'relative',
                    transition: 'box-shadow 0.2s, border-color 0.2s'
                  }}
                  whileHover={{ boxShadow: '0 8px 28px rgba(0,0,0,0.12)' }}
                >
                  {/* Top row: icon + delete */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 11,
                      background: ts.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Icon size={20} color={ts.color} />
                    </div>

                    <button
                      onClick={e => { e.stopPropagation(); setDeleteTarget(file) }}
                      title="Delete document"
                      style={{
                        background: 'transparent', border: 'none', padding: '4px 6px',
                        color: 'var(--text-muted)', cursor: 'pointer', borderRadius: 8,
                        transition: 'color 0.15s, background 0.15s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)',
                    margin: '0 0 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {file.title}
                  </h3>

                  {/* Preview snippet */}
                  <p style={{
                    fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 14px',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden', lineHeight: 1.5
                  }}>
                    {file.content?.slice(0, 120) || 'No preview available'}
                  </p>

                  {/* Tags row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.7rem', padding: '3px 9px', borderRadius: 6,
                      background: ts.bg, color: ts.color, fontWeight: 600
                    }}>
                      {file.type?.toUpperCase() || 'NOTE'}
                    </span>
                    {file.tag && (
                      <span style={{
                        fontSize: '0.7rem', padding: '3px 9px', borderRadius: 6,
                        background: 'var(--bg-secondary)', color: 'var(--text-muted)'
                      }}>
                        {file.tag}
                      </span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      

      {/* ── Delete confirmation dialog ── */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteDialog
            file={deleteTarget}
            onConfirm={handleDeleteConfirm}
            onCancel={() => !deleteLoading && setDeleteTarget(null)}
            loading={deleteLoading}
          />
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}