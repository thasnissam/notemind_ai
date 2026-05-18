import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Type, LogOut, Moon, Sun, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

const FONT_SIZES = [
  { id: 'small',  label: 'Small',  px: 14 },
  { id: 'medium', label: 'Medium', px: 16 },
  { id: 'large',  label: 'Large',  px: 20 },
]

function SettingRow({ icon: Icon, label, children }) {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '1.1rem 1.25rem', 
      borderBottom: '1px solid var(--border)', 
      gap: '1rem' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ 
          width: 34, 
          height: 34, 
          borderRadius: 10, 
          background: 'var(--accent-light)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          flexShrink: 0 
        }}>
          <Icon size={16} style={{ color: 'var(--accent)' }} />
        </div>
        <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
      </div>
      {children}
    </div>
  )
}

export default function Settings() {
  const { user, logout } = useAuth()
  const { isDark, toggle } = useTheme()
  const navigate = useNavigate()

  const [username, setUsername] = useState(user?.username || 'Architect')
  const [email, setEmail] = useState(user?.email || `${user?.username}@notemind.app`)
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('notemind_fontsize') || 'medium')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const px = FONT_SIZES.find(f => f.id === fontSize)?.px || 16
    document.documentElement.style.fontSize = `${px}px`
    localStorage.setItem('notemind_fontsize', fontSize)
  }, [fontSize])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogout = () => {
    document.documentElement.style.fontSize = '16px'
    logout()
    navigate('/')
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      minHeight: '100vh',
      width: '100%',
      // Added 60px bottom padding for that "little bit of space" after logout
      padding: '80px 24px 60px 24px', 
      background: 'var(--bg-primary)',
      transition: 'background 0.3s ease'
    }}>
      
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }} 
        style={{ textAlign: 'center', marginBottom: '3.5rem' }}
      >
        <h2 style={{ 
          fontFamily: 'Fraunces, serif', 
          fontSize: '2.4rem', 
          color: 'var(--text-primary)', 
          fontStyle: 'italic',
          marginBottom: '0.75rem' 
        }}>
          You have a beautiful mind, {username}.
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          Refine your digital sanctuary and preferences.
        </p>
      </motion.div>

      <div style={{ maxWidth: 620, width: '100%' }}>
        
        {/* Profile Group */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ marginBottom: '1.25rem', overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Profile Details</h3>
          </div>
          <SettingRow icon={User} label="Display Name">
            <input className="input-field" value={username} onChange={e => setUsername(e.target.value)}
              style={{ width: '12rem', height: '38px', fontSize: '0.85rem', textAlign: 'right', border: 'none', background: 'transparent' }} />
          </SettingRow>
          <SettingRow icon={Mail} label="Email Address">
            <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '14rem', height: '38px', fontSize: '0.85rem', textAlign: 'right', border: 'none', background: 'transparent' }} />
          </SettingRow>
        </motion.div>

        {/* Appearance Group */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ marginBottom: '1.25rem', overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Personalization</h3>
          </div>
          <SettingRow icon={isDark ? Moon : Sun} label="Interface Theme">
            <button onClick={toggle}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8, 
                padding: '0.5rem 1rem', 
                borderRadius: 10, 
                background: 'var(--accent-light)', 
                color: 'var(--accent)', 
                border: '1px solid var(--border)', 
                cursor: 'pointer', 
                fontSize: '0.8rem', 
                fontWeight: 600 
              }}>
              {isDark ? <><Moon size={14} /> Dark Mode</> : <><Sun size={14} /> Light Mode</>}
            </button>
          </SettingRow>
          <SettingRow icon={Type} label="Typography Scale">
            <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: 10, padding: 4, border: '1px solid var(--border)' }}>
              {FONT_SIZES.map(f => (
                <button key={f.id} onClick={() => setFontSize(f.id)}
                  style={{ 
                    padding: '0.4rem 1rem', 
                    borderRadius: 7, 
                    background: fontSize === f.id ? 'var(--bg-card)' : 'transparent', 
                    color: fontSize === f.id ? 'var(--accent)' : 'var(--text-muted)', 
                    border: 'none', 
                    cursor: 'pointer', 
                    fontSize: '0.75rem', 
                    fontWeight: fontSize === f.id ? 600 : 400,
                    transition: 'all 0.2s ease'
                  }}>
                  {f.label}
                </button>
              ))}
            </div>
          </SettingRow>
        </motion.div>

        {/* Action Footer: Vertical Stacked, Identical Size, Solid Red Logout */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.2 }}
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '1.25rem',         
            marginTop: '3.5rem',
            width: '100%'
          }}
        >
          <button 
            className="btn-primary" 
            onClick={handleSave}
            style={{ 
              padding: '0.85rem', 
              fontSize: '0.95rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 10,
              width: '100%',         
              justifyContent: 'center',
              borderRadius: '14px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {saved ? <><CheckCircle size={20} /> Changes Saved</> : 'Save changes'}
          </button>

          <button 
            onClick={handleLogout}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 10, 
              background: '#ef4444', 
              border: 'none', 
              padding: '0.85rem',
              width: '100%',         
              justifyContent: 'center',
              borderRadius: '14px',
              cursor: 'pointer', 
              color: '#ffffff',      
              fontSize: '0.95rem',
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.25)', 
              transition: 'transform 0.2s ease, background 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
          >
            <LogOut size={18} /> Log out
          </button>
        </motion.div>

        {/* --- THE FIX: FINAL BOTTOM SPACER --- */}
        <div style={{ height: '80px', width: '100%', flexShrink: 0 }} />
        
      </div>
    </div>
  )
}