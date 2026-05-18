import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, BookOpen, Link, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { apiGetCollections } from '../api'

const TYPE_COLORS = {
  pdf:  { bg: 'rgba(239,68,68,0.1)',  color: '#ef4444', icon: FileText },
  note: { bg: 'rgba(16,185,129,0.1)', color: '#10b981', icon: BookOpen },
  url:  { bg: 'rgba(99,102,241,0.1)', color: '#6366f1', icon: Link },
}

function getTypeStyle(type) {
  return TYPE_COLORS[type] || TYPE_COLORS.note
}

export default function Dashboard() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [tagFilter, setTagFilter] = useState('All')
  const { user } = useAuth()

  const fetchDocs = async () => {
    try {
      setLoading(true)
      const data = await apiGetCollections()
      setItems(data || [])
    } catch (err) {
      console.error('API Error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocs()
    window.addEventListener('notemind_upload', fetchDocs)
    return () => window.removeEventListener('notemind_upload', fetchDocs)
  }, [])

  const allTags = ['All', ...new Set(items.map(i => i.tag).filter(Boolean))]
  const filtered = tagFilter === 'All' ? items : items.filter(i => i.tag === tagFilter)

  return (
    <div style={{ padding: '2rem 3rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', fontWeight: 400, margin: '0 0 4px' }}>
          Good day, {user?.username}.
        </h2>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          {items.length} source{items.length !== 1 ? 's' : ''} in your private base.
        </p>
      </header>

      {/* Tag filters */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setTagFilter(tag)}
            style={{
              padding: '6px 16px', borderRadius: 20,
              border: `1px solid ${tagFilter === tag ? 'var(--accent)' : 'var(--border)'}`,
              background: tagFilter === tag ? 'var(--accent-light)' : 'var(--bg-card)',
              color: tagFilter === tag ? 'var(--accent)' : 'var(--text-muted)',
              cursor: 'pointer', fontSize: '0.82rem', fontWeight: tagFilter === tag ? 600 : 400,
              transition: 'all 0.15s'
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
          <Loader2 size={28} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1.5rem' }}>
          <AnimatePresence>
            {filtered.map((doc, i) => {
              const ts = getTypeStyle(doc.type)
              const Icon = ts.icon
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ boxShadow: '0 8px 28px rgba(0,0,0,0.12)' }}
                  style={{
                    background: 'var(--bg-card)', borderRadius: 18,
                    border: '1px solid var(--border)', padding: '20px 22px',
                    cursor: 'default', transition: 'box-shadow 0.2s'
                  }}
                >
                  {/* Icon only — no action buttons */}
                  <div style={{
                    width: 42, height: 42, borderRadius: 11,
                    background: ts.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16
                  }}>
                    <Icon size={20} color={ts.color} />
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)',
                    margin: '0 0 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {doc.title}
                  </h3>

                  {/* Preview snippet */}
                  <p style={{
                    fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 14px',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden', lineHeight: 1.5
                  }}>
                    {doc.content?.slice(0, 120) || 'No preview available'}
                  </p>

                  {/* Type + tag badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontSize: '0.7rem', padding: '3px 9px', borderRadius: 6,
                      background: ts.bg, color: ts.color, fontWeight: 600
                    }}>
                      {doc.type?.toUpperCase() || 'NOTE'}
                    </span>
                    {doc.tag && (
                      <span style={{
                        fontSize: '0.7rem', padding: '3px 9px', borderRadius: 6,
                        background: 'var(--bg-secondary)', color: 'var(--text-muted)'
                      }}>
                        {doc.tag}
                      </span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div style={{
          textAlign: 'center', padding: '5rem',
          border: '2px dashed var(--border)', borderRadius: '1rem'
        }}>
          <p style={{ color: 'var(--text-muted)' }}>No documents found. Use the upload button to add your first document.</p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
