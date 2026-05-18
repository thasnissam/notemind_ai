import { useState, useRef, useEffect } from 'react'
import { Send, FileText, BookOpen, Brain, Sparkles, Link, RotateCcw, Presentation, FileType } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiChat } from '../api'

const MAX_HISTORY = 80

function getHistoryKey(userId) {
  // Per-user key — different users never share chat history
  return `notemind_chat_${userId}`
}

export default function AskPage() {
  const { openFile }      = useOutletContext()
  const { user }          = useAuth()
  const historyKey        = getHistoryKey(user?.id || 'guest')

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(historyKey)
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef()
  const textareaRef = useRef()

  // Persist per-user history
  useEffect(() => {
    try {
      localStorage.setItem(historyKey, JSON.stringify(messages.slice(-MAX_HISTORY)))
    } catch {}
  }, [messages, historyKey])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const q = input.trim()
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    setMessages(prev => [...prev, { role: 'user', content: q }])
    setLoading(true)

    try {
      const res = await apiChat(q)
      setMessages(prev => [...prev, {
        role:    'assistant',
        content: res.answer,
        sources: res.sources || [],
        insight: res.insight || '',
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role:    'assistant',
        content: `⚠️ Could not connect to the backend. Make sure the server is running on port 8000.\n\nError: ${err.message}`,
        sources: [],
        isError: true,
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setMessages([])
    localStorage.removeItem(historyKey)
  }

  function sourceIcon(type) {
    if (type === 'pdf')  return <FileText size={13} color="#ef4444" />
    if (type === 'pptx') return <Presentation size={13} color="#f97316" />
    if (type === 'docx') return <FileType size={13} color="#3b82f6" />
    if (type === 'url')  return <Link size={13} color="#6366f1" />
    return <BookOpen size={13} color="#10b981" />
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', maxWidth: '860px', margin: '0 auto', padding: '20px 24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Brain size={21} color="var(--accent)" />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>Ask NoteMind</h2>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Semantic search — no exact keywords needed</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={handleClear} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.78rem' }}>
            <RotateCcw size={12} /> Clear history
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 12 }}>

        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '55%', gap: 14, textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={26} color="var(--accent)" />
            </div>
            <div>
              <h3 style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '1rem' }}>Ask anything about your notes</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: 360, lineHeight: 1.6 }}>
                Type a question in natural language. NoteMind finds relevant passages from your PDFs, slides, docs and notes — even if the exact words don't match.
              </p>
            </div>
          </div>
        )}

        {messages.map((m, idx) => (
          <div key={idx} style={{ marginBottom: 22 }}>
            {m.role === 'user' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ background: 'var(--accent)', color: '#fff', padding: '10px 15px', borderRadius: '16px 16px 4px 16px', maxWidth: '78%', fontSize: '0.91rem', lineHeight: 1.5 }}>
                  {m.content}
                </div>
              </div>
            )}

            {m.role === 'assistant' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, alignItems: 'flex-start' }}>
                <div style={{
                  background: m.isError ? 'rgba(239,68,68,0.07)' : 'var(--bg-card)',
                  border: `1px solid ${m.isError ? 'rgba(239,68,68,0.25)' : 'var(--border)'}`,
                  padding: '13px 17px', borderRadius: '4px 16px 16px 16px',
                  maxWidth: '86%', fontSize: '0.91rem', lineHeight: 1.75,
                  color: 'var(--text-primary)', whiteSpace: 'pre-wrap'
                }}>
                  {m.content}
                </div>

                {m.insight && !m.isError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.73rem', color: 'var(--text-muted)', paddingLeft: 4 }}>
                    <Sparkles size={11} color="var(--accent)" />
                    {m.insight}
                  </div>
                )}

                {m.sources && m.sources.length > 0 && (
                  <div style={{ paddingLeft: 4 }}>
                    <p style={{ margin: '0 0 5px', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sources found</p>
                    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                      {m.sources.map((src, si) => (
                        <button
                          key={si}
                          onClick={() => openFile({ doc_id: src.doc_id, title: src.title, type: src.type, tag: src.tag, content: src.content })}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-primary)', transition: 'border-color 0.18s' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        >
                          {sourceIcon(src.type)}
                          <span style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{src.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: `nmBounce 1s ease-in-out ${i*0.15}s infinite` }} />
              ))}
            </div>
            Searching your documents…
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div style={{ flexShrink: 0, paddingTop: 10 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, background: 'var(--bg-card)', padding: '10px 13px', borderRadius: 14, border: '1px solid var(--border)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
            placeholder="Ask about your notes… (Enter to send, Shift+Enter for new line)"
            rows={1}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.91rem', resize: 'none', lineHeight: 1.5, maxHeight: 120, overflowY: 'auto', fontFamily: 'inherit' }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            style={{ background: loading || !input.trim() ? 'var(--border)' : 'var(--accent)', color: '#fff', border: 'none', borderRadius: 9, padding: '8px 13px', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.2s', flexShrink: 0 }}
          >
            <Send size={16} />
          </button>
        </div>
        <p style={{ textAlign: 'center', margin: '6px 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          NoteMind searches semantically — no exact keywords needed
        </p>
      </div>

      <style>{`@keyframes nmBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }`}</style>
    </div>
  )
}