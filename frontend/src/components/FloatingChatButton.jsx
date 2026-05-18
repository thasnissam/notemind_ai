import { motion } from 'framer-motion'
import { MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function FloatingChatButton() {
  const navigate = useNavigate()

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.93 }}
      onClick={() => navigate('/app/ask')}
      style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        width: 52,
        height: 52,
        borderRadius: '50%',
        background: 'var(--accent)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(91,91,214,0.4)',
        zIndex: 50,
        color: '#fff',
      }}
    >
      <MessageSquare size={20} strokeWidth={2} />
    </motion.button>
  )
}
