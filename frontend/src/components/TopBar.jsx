import { motion } from 'framer-motion'
import Icon from './Icon.jsx'
import UserMenu from './UserMenu.jsx'
import { useTheme } from '../theme/ThemeContext.jsx'

export default function TopBar({ filters, event, audience, streak, onEvent, onAudience }) {
  const { toggleTheme } = useTheme()
  const events = filters?.events || []
  const audiences = filters?.audiences || []

  return (
    <motion.div
      className="top"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
    >
      <label className="sel">
        Event
        <select value={event} onChange={(e) => onEvent?.(e.target.value)}>
          {events.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <label className="sel" aria-label="Audience">
        <select value={audience} onChange={(e) => onAudience?.(e.target.value)}>
          {audiences.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <div className="right">
        <span className="chip">
          <Icon name="flame" />
          {streak}d Streak
        </span>
        <motion.button
          className="icon-btn"
          type="button"
          aria-label="Switch theme"
          onClick={toggleTheme}
          whileTap={{ scale: 0.9 }}
        >
          <Icon name="sun" className="i sun" />
          <Icon name="moon" className="i moon" />
        </motion.button>
        <UserMenu />
      </div>
    </motion.div>
  )
}
