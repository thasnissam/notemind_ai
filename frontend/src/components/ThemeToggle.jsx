import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ size = 16 }) {
  const { isDark, toggle } = useTheme()

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.88 }}
      className="btn-ghost"
      style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {isDark ? <Sun size={size} /> : <Moon size={size} />}
      </motion.div>
    </motion.button>
  )
}
