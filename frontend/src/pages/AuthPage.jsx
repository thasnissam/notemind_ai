import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Check, X, ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/ThemeToggle'

const PASSWORD_RULES = [
  { id: 'length',  label: 'At least 8 characters',       test: p => p.length >= 8 },
  { id: 'upper',   label: 'One uppercase letter',         test: p => /[A-Z]/.test(p) },
  { id: 'lower',   label: 'One lowercase letter',         test: p => /[a-z]/.test(p) },
  { id: 'number',  label: 'One number',                   test: p => /\d/.test(p) },
  { id: 'special', label: 'One special character',        test: p => /[^A-Za-z0-9]/.test(p) },
]

export default function AuthPage() {
  const [mode, setMode]       = useState('login')
  const [form, setForm]       = useState({ username: '', password: '' })
  const [showPw, setShowPw]   = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login, signup }     = useAuth()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const rules   = PASSWORD_RULES.map(r => ({ ...r, met: r.test(form.password) }))
  const allMet  = rules.every(r => r.met)
  const showRules = mode === 'signup' && form.password.length > 0

  const handleSubmit = async () => {
    setError('')
    if (!form.username.trim()) { setError('Please enter a username'); return }
    if (!form.password)         { setError('Please enter a password'); return }
    if (mode === 'signup' && !allMet) { setError('Password does not meet all requirements'); return }

    setLoading(true)
    try {
      if (mode === 'signup') await signup(form.username.trim(), form.password)
      else                   await login(form.username.trim(), form.password)
      navigate('/app/dashboard')
    } catch (err) {
      setError(err.detail || err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
        <button className="btn-ghost" onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', fontSize: 13 }}>
          <ArrowLeft size={14} /> Back
        </button>
        <ThemeToggle />
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }} style={{ width: '100%', maxWidth: 400 }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #e45412, #d17f59)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <span style={{ color: '#fff', fontSize: 20, fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>N</span>
            </div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 400, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {mode === 'login' ? 'Welcome back' : 'Create your space'}
            </h1>
            <p style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 6 }}>
              {mode === 'login' ? 'Sign in to your NoteMind account' : 'Start building your knowledge base'}
            </p>
          </div>

          {/* Toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-primary)', borderRadius: 11, padding: 4, marginBottom: 24, border: '1px solid var(--border)' }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                style={{ flex: 1, padding: 8, borderRadius: 8, border: 'none',
                  background: mode === m ? 'var(--bg-card)' : 'transparent',
                  color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: 16, fontWeight: mode === m ? 500 : 400, cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif', transition: 'all 0.18s',
                  boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                {m === 'login' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 15, color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Username</label>
              <input className="input-field" placeholder="e.g. alexmind" value={form.username}
                onChange={e => set('username', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{ padding: '10px 14px', fontSize: 14 }} />
            </div>

            <div>
              <label style={{ fontSize: 15, color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input-field" type={showPw ? 'text' : 'password'}
                  placeholder="Enter password" value={form.password}
                  onChange={e => set('password', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  style={{ padding: '10px 40px 10px 14px', fontSize: 14 }} />
                <button onClick={() => setShowPw(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Live password rules */}
            <AnimatePresence>
              {showRules && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6, border: '1px solid var(--border)', overflow: 'hidden' }}>
                  {rules.map(({ id, label, met }) => (
                    <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: met ? 'rgba(52,211,153,0.15)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }}>
                        {met ? <Check size={9} style={{ color: '#34d399' }} strokeWidth={3} /> : <X size={9} style={{ color: 'var(--text-muted)' }} strokeWidth={3} />}
                      </div>
                      <span style={{ fontSize: 12, color: met ? '#34d399' : 'var(--text-muted)', transition: 'color 0.2s' }}>{label}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ fontSize: 12.5, color: '#f87171', textAlign: 'center', padding: '8px 12px', background: 'rgba(248,113,113,0.08)', borderRadius: 8, border: '1px solid rgba(248,113,113,0.2)' }}>
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
              onClick={handleSubmit} disabled={loading} className="btn-primary"
              style={{ padding: 11, fontSize: 14.5, marginTop: 4, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}>
              {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> {mode === 'login' ? 'Signing in…' : 'Creating account…'}</> : (mode === 'login' ? 'Sign in' : 'Create account')}
            </motion.button>
          </div>
        </motion.div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
