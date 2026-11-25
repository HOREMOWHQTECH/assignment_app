import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import Icon from './Icon.jsx'

const LINKS = [
  { to: '/', icon: 'grid', label: 'Dashboard', end: true },
  { to: '/bible-study', icon: 'book', label: 'Bible Study' },
  { to: '/books', icon: 'lib', label: 'HOREMOW Books' },
  { to: '/messages', icon: 'phones', label: 'Messages' },
  { to: '/soul-winning', icon: 'users', label: 'Soul Winning' },
  { to: '/prayer-fasting', icon: 'clock', label: 'Prayer & Fasting' },
  { to: '/reports', icon: 'file', label: 'Official Report' },
]

export default function Sidebar() {
  return (
    <motion.aside
      className="side"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="brand">
        <div className="logo" role="img" aria-label="HOREMOW logo" />
        <span>HOREMOW</span>
      </div>
      <nav aria-label="Main">
        {LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end}>
            <Icon name={link.icon} />
            {link.label}
          </NavLink>
        ))}
      </nav>
      <motion.button
        className="voice"
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        <Icon name="mic" />
        Voice AI Assistant
      </motion.button>
    </motion.aside>
  )
}
