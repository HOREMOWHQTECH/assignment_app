import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from './Icon.jsx'
import { api } from '../api/client.js'

const ROUTES = [
  { keys: ['bible'], path: '/bible-study', label: 'Bible Study' },
  { keys: ['book'], path: '/books', label: 'HOREMOW Books' },
  { keys: ['message'], path: '/messages', label: 'Messages' },
  { keys: ['soul'], path: '/soul-winning', label: 'Soul Winning' },
  { keys: ['prayer', 'fasting'], path: '/prayer-fasting', label: 'Prayer & Fasting' },
  { keys: ['report'], path: '/reports', label: 'Official Report' },
  { keys: ['setting'], path: '/settings', label: 'Settings' },
  { keys: ['admin'], path: '/admin', label: 'Admin' },
  { keys: ['dashboard', 'home', 'main'], path: '/', label: 'Dashboard' },
]

const ANSWERS = [
  { keys: ['help', 'what can you do'], reply: 'I can take you to any page — just say "go to Bible study", "open books", "show my report", or "prayer timer".' },
  { keys: ['progress', 'score', 'report'], reply: 'Your full progress report is on the Reports page — say "go to report" to open it.' },
  { keys: ['streak'], reply: 'Keep logging daily — your streak grows every day you pray, read, and win souls.' },
  { keys: ['hello', 'hi', 'hey'], reply: 'Hello! I am your HOREMOW voice assistant. Where would you like to go?' },
  { keys: ['thank'], reply: "You're welcome! Keep up the great work." },
]

function speak(text) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.rate = 1
  window.speechSynthesis.speak(u)
}

export default function VoiceAssistant() {
  const [open, setOpen] = useState(false)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [reply, setReply] = useState('Tap the mic and say where you want to go — e.g. "go to Bible study".')
  const recognitionRef = useRef(null)
  const navigate = useNavigate()
  const supported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  useEffect(() => {
    const toggle = () => setOpen((o) => !o)
    window.addEventListener('horemow:voice', toggle)
    return () => window.removeEventListener('horemow:voice', toggle)
  }, [])

  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  const respondLocal = (text) => {
    const t = text.toLowerCase()
    const route = ROUTES.find((r) => r.keys.some((k) => t.includes(k)))
    if (route) {
      navigate(route.path)
      const msg = `Opening ${route.label}.`
      setReply(msg)
      speak(msg)
      return
    }
    const answer = ANSWERS.find((a) => a.keys.some((k) => t.includes(k)))
    const msg = answer ? answer.reply : `I didn't catch that. Try "go to books" or "help".`
    setReply(msg)
    speak(msg)
  }

  const respond = async (text) => {
    try {
      const data = await api('/voice/chat', { method: 'POST', body: { message: text } })
      if (data.action?.type === 'navigate') navigate(data.action.path)
      setReply(data.reply)
      speak(data.reply)
    } catch {
      respondLocal(text)
    }
  }

  const startListening = () => {
    if (!supported) {
      setReply('Voice recognition is not supported in this browser — try Chrome or Edge.')
      return
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const rec = new SR()
    rec.lang = 'en-US'
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript
      setTranscript(text)
      respond(text)
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recognitionRef.current = rec
    setListening(true)
    setTranscript('')
    rec.start()
  }

  const stopAll = () => {
    recognitionRef.current?.stop()
    setListening(false)
    window.speechSynthesis?.cancel()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="voice-panel"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ duration: 0.2 }}
        >
          <div className="voice-panel-head">
            <Icon name="mic" />
            <strong>Voice Assistant</strong>
            <button className="icon-btn" type="button" onClick={() => { stopAll(); setOpen(false) }} aria-label="Close assistant">
              <Icon name="chevD" style={{ transform: 'rotate(180deg)' }} />
            </button>
          </div>
          <div className="voice-panel-body">
            {transcript && <p className="voice-you">“{transcript}”</p>}
            <p className="voice-reply">{reply}</p>
          </div>
          <div className="voice-panel-foot">
            <button
              className={`btn ${listening ? 'pri' : 'out'}`}
              type="button"
              onClick={listening ? stopAll : startListening}
              disabled={!supported && !listening}
            >
              <Icon name={listening ? 'stop' : 'mic'} /> {listening ? 'Listening… tap to stop' : 'Tap to speak'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
