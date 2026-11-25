import { motion } from 'framer-motion'
import GoalRing from './GoalRing.jsx'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

export default function GoalCard({ goal }) {
  const belowHalf = goal.percent < 50
  return (
    <motion.section className="card goal" variants={container} initial="hidden" animate="show">
      <motion.h2 variants={item}>Goal Score</motion.h2>
      <motion.div variants={item}>
        <GoalRing percent={goal.percent} />
      </motion.div>
      <motion.span className={`tag ${belowHalf ? 'amb' : ''}`} variants={item}>
        {belowHalf ? 'Below 50%' : 'On Track'}
      </motion.span>
      <motion.p variants={item}>{goal.message}</motion.p>
    </motion.section>
  )
}
