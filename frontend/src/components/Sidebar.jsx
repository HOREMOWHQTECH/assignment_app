import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import Icon from './Icon.jsx'
import { useAppSettings } from '../api/settings.js'

const LINKS = [
  { to: '/', icon: 'grid', label: 'Dashboard', end: true },
  { to: '/bible-study', icon: 'book', label: 'Bible Study', module: 'bibleStudy' },
  { to: '/books', icon: 'lib', label: 'HOREMOW Books', module: 'books' },
  { to: '/messages', icon: 'phones', label: 'Messages', module: 'messages' },
  { to: '/soul-winning', icon: 'users', label: 'Soul Winning', module: 'soulWinning' },
  { to: '/prayer-fasting', icon: 'clock', label: 'Prayer & Fasting', module: 'prayer' },
  { to: '/reports', icon: 'file', label: 'Official Report', module: 'reports' },
]

export default function Sidebar({ collapsed, onToggle }) {
  const { settings } = useAppSettings()
  const links = LINKS.filter((l) => !l.module || settings.modules?.[l.module])
  return (
    <motion.aside
      className="side"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="brand">
        <div className="logo" role="img" aria-label="HOREMOW logo" />
        <span>HOREMOW</span>
        <button
          className="side-toggle"
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
        >
          <Icon name={collapsed ? 'chevR' : 'chevL'} />
        </button>
      </div>
      <nav aria-label="Main">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            title={link.label}
            onClick={() => { if (window.innerWidth <= 900) onToggle() }}
          >
            <Icon name={link.icon} />
            <span className="nav-label">{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <motion.button
        className="voice"
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent('horemow:voice'))}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        <Icon name="mic" />
        <span>Voice AI Assistant</span>
      </motion.button>
    </motion.aside>
  )
}
