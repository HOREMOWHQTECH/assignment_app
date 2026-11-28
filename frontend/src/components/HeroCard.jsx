import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Icon from './Icon.jsx'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.25 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

export default function HeroCard({ user }) {
  return (
    <motion.section
      className="card hero"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div className="tags" variants={item}>
        <span className="tag">
          <Icon name="shield" />
          {user.role}
        </span>
        {user.event && (
          <span className="tag amb">
            <Icon name="cal" />
            {user.event}
          </span>
        )}
      </motion.div>
      <motion.h1 variants={item}>Welcome back, {user.name}</motion.h1>
      <motion.p variants={item}>{user.mandate}</motion.p>
      <motion.div className="meta" variants={item}>
        {user.country && (
          <span>
            Country: <b>{user.country}</b>
          </span>
        )}
        {user.chapter && (
          <span>
            Chapter: <b>{user.chapter}</b>
          </span>
        )}
        {user.zone && (
          <span>
            Zone: <b>{user.zone}</b>
          </span>
        )}
        <Link className="btn out" to="/reports">
          Full Verification Report
          <Icon name="arrow" />
        </Link>
      </motion.div>
    </motion.section>
  )
}
