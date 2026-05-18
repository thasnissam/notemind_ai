import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, MessageSquare, Upload, Library, Settings, Sun, Moon, LogOut } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/app/dashboard',   icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/app/ask',         icon: MessageSquare,   label: 'Ask'         },
  { to: '/app/upload',      icon: Upload,          label: 'Upload'      },
  { to: '/app/collections', icon: Library,         label: 'Collections' },
  { to: '/app/settings',    icon: Settings,        label: 'Settings'    },
]

export default function Sidebar() {
  const [isHovered, setIsHovered] = useState(false)
  const { isDark, toggle } = useTheme()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  // Dynamic colors based on theme
  const textColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.8)' // Dark slate for light mode
  const activeTextColor = isDark ? '#fff' : '#FF6B35'
  const hoverBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'
  const sidebarBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'

  return (
    <div style={{ 
      padding: '16px 0 16px 16px', 
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      zIndex: 50,
      background: 'transparent'
    }}>
      <motion.aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{ 
          width: isHovered ? 230 : 76,
          boxShadow: isHovered ? '0 12px 40px rgba(0,0,0,0.12)' : '0 4px 12px rgba(0,0,0,0.03)'
        }} 
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{ 
          height: '100%',
          background: 'var(--sidebar-bg)', // Ensure this variable updates in your global CSS
          border: `1px solid ${sidebarBorder}`, 
          display: 'flex', 
          flexDirection: 'column', 
          flexShrink: 0, 
          overflow: 'hidden', 
          borderRadius: '24px',
          position: 'relative',
          backdropFilter: 'blur(12px)',
        }}
      >

        {/* Logo Section */}
        <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 12, minHeight: 84 }}>
          <div style={{ 
            width: 36, 
            height: 36, 
            borderRadius: 12, 
            background: 'linear-gradient(135deg, #FF6B35, #EF476F)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(239, 71, 111, 0.3)' 
          }}>
            <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 800, fontFamily: 'Fraunces, serif' }}>N</span>
          </div>
          <AnimatePresence>
            {isHovered && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -10 }} 
                style={{ 
                  color: isDark ? '#fff' : '#1e293b', 
                  fontSize: '0.9rem', 
                  fontWeight: 700, 
                  letterSpacing: '0.1em', 
                  fontFamily: 'Fraunces, serif' 
                }}
              >
                NOTEMIND
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav Section */}
        <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <motion.div 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12, 
                    padding: '12px', 
                    borderRadius: '16px', 
                    background: isActive ? (isDark ? 'rgba(255, 107, 53, 0.15)' : 'rgba(255, 107, 53, 0.1)') : 'transparent', 
                    color: isActive ? activeTextColor : textColor, 
                    cursor: 'pointer', 
                    transition: 'all 0.2s',
                    justifyContent: isHovered ? 'flex-start' : 'center'
                  }}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} style={{ flexShrink: 0 }} />
                  {isHovered && (
                    <motion.span 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      style={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 500, whiteSpace: 'nowrap' }}
                    >
                      {label}
                    </motion.span>
                  )}
                </motion.div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '12px' }}>
          {[
            { onClick: toggle, icon: isDark ? Sun : Moon, label: isDark ? 'Light mode' : 'Dark mode' },
            { onClick: handleLogout, icon: LogOut, label: 'Log Out', color: '#EF476F' },
          ].map(({ onClick, icon: Icon, label, color }) => (
            <button 
              key={label} 
              onClick={onClick}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12, 
                width: '100%', 
                padding: '12px', 
                borderRadius: '16px', 
                background: 'transparent', 
                border: 'none', 
                cursor: 'pointer', 
                color: color || textColor, 
                justifyContent: isHovered ? 'flex-start' : 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = hoverBg}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Icon size={20} strokeWidth={2} style={{ flexShrink: 0 }} />
              {isHovered && (
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{label}</span>
              )}
            </button>
          ))}
        </div>
      </motion.aside>
    </div>
  )
}