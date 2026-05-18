import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Upload, Library, MessageSquare, ChevronLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const PAGE_TITLES = {
  '/app/dashboard': 'Dashboard',
  '/app/ask': 'Ask AI',
  '/app/upload': 'Upload',
  '/app/collections': 'Collections',
  '/app/settings': 'Settings',
}

export default function TopBar({ onUpload, onChat }) {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const title = PAGE_TITLES[location.pathname] || 'NoteMind'
  const canGoBack = location.pathname !== '/app/dashboard'

  return (
    <div style={{
      height: '72px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 32px', // Increased side padding for the whole bar
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-card)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      backdropFilter: 'blur(12px)',
    }}>
      
      {/* 1. Left Section: Back & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0, minWidth: '160px' }}>
        {canGoBack && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate(-1)}
            className="btn-ghost"
            style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' }}
          >
            <ChevronLeft size={18} color="var(--text-secondary)" />
          </motion.button>
        )}
        <h1 style={{ 
          fontSize: '1rem', 
          fontWeight: 600, 
          color: 'var(--text-primary)', 
          fontFamily: 'Fraunces, serif',
          margin: 0 
        }}>
          {title}
        </h1>
      </div>

      {/* 2. Center Section: Floating search */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          flex: 1,
          maxWidth: '520px',
          position: 'relative',
          margin: '0 24px', // Added margin to separate search from sides
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Search size={15} style={{
          position: 'absolute',
          left: '14px',
          color: 'var(--text-muted)',
          zIndex: 1
        }} />
        <input
          className="input-field"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search your knowledge base..."
          style={{ 
            paddingLeft: '42px', 
            paddingRight: '16px', 
            height: '42px', 
            fontSize: '0.875rem',
            width: '100%'
          }}
        />
      </motion.div>

      {/* 3. Right Section: DE-CONGESTED ACTIONS */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', // Increased gap between buttons
        marginLeft: 'auto', 
        flexShrink: 0 
      }}>
        <button
          className="btn-ghost"
          onClick={onUpload}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '0 12px', 
            fontSize: '0.85rem', 
            height: '40px' 
          }}
        >
          <Upload size={16} /> 
          <span style={{ fontWeight: 500 }}>Upload</span>
        </button>
        
        {/* Ask AI Button: Increased padding and font weight */}
        <button
          className="btn-primary"
          onClick={() => navigate('/app/ask')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            padding: '0 20px', // Increased horizontal padding
            fontSize: '0.9rem', 
            fontWeight: 600, // Make text stand out
            height: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 15px var(--accent-glow)'
          }}
        >
          <MessageSquare size={16} /> 
          <span>Ask AI</span>
        </button>

        {/* Separator Line for the Avatar */}
        <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 4px' }} />

        {/* Avatar: Adjusted for Triadic Harmony */}
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--accent-violet), var(--accent))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '14px',
          fontWeight: 700,
          cursor: 'pointer',
          flexShrink: 0,
        }}>
          {user?.username?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>
    </div>
  )
}