import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from './Icon.jsx'

export default function UserMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const logout = () => {
    setOpen(false)
    // TODO: clear auth token / call logout endpoint
    navigate('/login')
  }

  return (
    <div className="user-menu" ref={ref}>
      <motion.button
        className={`um-btn${open ? ' open' : ''}`}
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        whileTap={{ scale: 0.9 }}
      >
        <Icon name="user" />
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="um-drop"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            <Link className="um-item" to="/settings" onClick={() => setOpen(false)}>
              Settings
            </Link>
            <button className="um-item danger" type="button" onClick={logout}>
              <Icon name="logout" />
              Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
