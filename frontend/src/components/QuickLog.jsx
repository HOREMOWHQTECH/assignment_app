import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from './Icon.jsx'

const TILES = [
  { icon: 'book', label: '+1 Bible Chapter', action: 'bible_chapter' },
  { icon: 'phones', label: '+1 Message', action: 'message' },
  { icon: 'users', label: '+1 Soul Won', action: 'soul_won' },
  { icon: 'alarm', label: 'Prayer Alarm Timer', action: 'prayer_timer' },
]

export default function QuickLog({ onLog }) {
  const [toast, setToast] = useState(null)

  const handleLog = async (tile) => {
    try {
      await onLog?.(tile.action)
      setToast(`Logged: ${tile.label}`)
    } catch {
      setToast('Could not log — please try again.')
    }
  }

  return (
    <motion.section
      className="card log"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
      aria-labelledby="ql"
    >
      <h2 id="ql">One-Touch Quick Log</h2>
      <div className="tiles">
        {TILES.map((tile) => (
          <motion.button
            key={tile.action}
            className="tile"
            type="button"
            onClick={() => handleLog(tile)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="ic">
              <Icon name={tile.icon} />
            </span>
            {tile.label}
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {toast && (
          <motion.div
            id="toast"
            className="on"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            onAnimationComplete={() => {
              setTimeout(() => setToast(null), 1800)
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}
