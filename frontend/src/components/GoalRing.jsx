import { motion } from 'framer-motion'

const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS // 326.7

export default function GoalRing({ percent = 30 }) {
  const offset = CIRCUMFERENCE * (1 - percent / 100)

  return (
    <motion.div
      className="ring"
      role="img"
      aria-label={`${percent}% completion`}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
    >
      <svg viewBox="0 0 120 120">
        <circle className="t" cx="60" cy="60" r={RADIUS} />
        <motion.circle
          className="v"
          cx="60"
          cy="60"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
        />
      </svg>
      <div>
        <strong>{percent}%</strong>
        <small>Completion</small>
      </div>
    </motion.div>
  )
}
