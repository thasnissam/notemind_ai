import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Brain, Search, BookOpen } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'

const FEATURES = [
  { icon: Brain, title: 'AI-powered recall', desc: 'Ask anything, get answers from your own knowledge.' },
  { icon: Search, title: 'Semantic search', desc: 'Find notes by meaning, not just keywords.' },
  { icon: BookOpen, title: 'Unified library', desc: 'PDFs, URLs, and notes — all in one place.' },
]

// The "Burned Orange Ring" component
const DecorativeRing = ({ position }) => (
  <div style={{
    position: 'absolute',
    zIndex: 0,
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    ...position,
    // Radial gradient: Transparent center -> Orange Glow -> Deep Burned Brown
    background: 'radial-gradient(circle, transparent 35%, #e45412 45%, #5c2a0d 60%, #1a0d04 85%)',
    filter: 'blur(8px)',
    opacity: 0.15,
    pointerEvents: 'none',
    boxShadow: 'inset 0 0 100px #000, 0 0 50px rgba(228, 84, 18, 0.2)',
  }} />
)

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflowX: 'hidden',
    }}>
      {/* BACKGROUND DESIGN ELEMENTS */}
      <DecorativeRing position={{ left: '-150px', top: '10%' }} />
      <DecorativeRing position={{ right: '-150px', bottom: '10%' }} />

      {/* NAVIGATION */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 48px',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #e45412, #d17f59)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'Fraunces, serif' }}>N</span>
          </div>
          <span style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, letterSpacing: '0.06em', color: 'var(--text-primary)' }}>
            NOTEMIND
          </span>
        </div>
        <ThemeToggle />
      </nav>

      {/* MAIN TWO-COLUMN SPREAD */}
      <main style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr', // Left side is slightly wider
        gap: '60px',
        padding: '40px 80px',
        alignItems: 'center',
        zIndex: 1,
      }}>
        
        {/* LEFT COLUMN: HERO CONTENT */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(228, 84, 18, 0.08)',
            color: '#e45412',
            borderRadius: 99,
            padding: '6px 16px',
            fontSize: '13px',
            fontWeight: 500,
            marginBottom: 32,
            border: '1px solid rgba(228, 84, 18, 0.2)',
          }}>
            <Sparkles size={14} />
            Your personal AI knowledge space
          </div>

          <h1 style={{
            fontFamily: 'Fraunces, serif',
            fontSize: 'clamp(60px, 5vw, 90px)',
            fontWeight: 500,
            lineHeight: 1.1,
            color: 'var(--text-primary)',
            marginBottom: 24,
            letterSpacing: '-0.03em',
          }}>
            Note<span style={{ color: '#e45412', fontStyle: 'italic' }}>Mind</span>
          </h1>

          <p style={{
            fontSize: '30px',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '800px',
            marginBottom: 48,
            fontWeight: 500,
          }}>
            A sanctuary for your thoughts. Save anything, find everything, and understand deeply with AI.
          </p>

          <motion.button
            whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(228, 84, 18, 0.3)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/auth')}
            style={{
              padding: '18px 42px',
              fontSize: '17px',
              background: '#e45412',
              color: '#fff',
              border: 'none',
              borderRadius: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontWeight: 500,
              transition: 'background 0.3s ease',
            }}
          >
            Start Thinking <ArrowRight size={20} />
          </motion.button>
        </motion.div>

        {/* RIGHT COLUMN: FEATURES LIST */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              whileHover={{ x: 10 }}
              style={{
                padding: '28px',
                background: 'var(--bg-card)',
                borderRadius: '24px',
                border: '1px solid var(--border)',
                display: 'flex',
                gap: '20px',
                alignItems: 'flex-start',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{
                padding: '12px',
                background: 'rgba(228, 84, 18, 0.08)',
                borderRadius: '12px',
                color: '#e45412'
              }}>
                <Icon size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {title}
                </h3>
                <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* FOOTER */}
      <footer style={{
        textAlign: 'center',
        padding: '48px',
        fontSize: '20px',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border)',
        zIndex: 10,
      }}>
        NoteMind — Your knowledge, amplified.
      </footer>
    </div>
  )
}