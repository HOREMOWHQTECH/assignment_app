import { motion } from 'framer-motion'
import Icon from './Icon.jsx'
import { useTheme } from '../theme/ThemeContext.jsx'

const EVENTS = ['Annual Cycle', 'Women', 'Ministers', 'Youth', 'December (General)']
const AUDIENCES = ['Ministers', 'State', 'Men', 'Women', 'Youth', 'General']

export default function TopBar() {
  const { toggleTheme } = useTheme()

  return (
    <motion.div
      className="top"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
    >
      <label className="sel">
        Event
        <select defaultValue="December (General)">
          {EVENTS.map((e) => (
            <option key={e}>{e}</option>
          ))}
        </select>
      </label>
      <label className="sel" aria-label="Audience">
        <select defaultValue="General">
          {AUDIENCES.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
      </label>
      <div className="right">
        <span className="chip">
          <Icon name="flame" />
          7d Streak
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
        <a className="btn pri" href="#">
          <Icon name="login" />
          Login / Register
        </a>
      </div>
    </motion.div>
  )
}
