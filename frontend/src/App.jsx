import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import BibleStudy from './pages/BibleStudy.jsx'
import Books from './pages/Books.jsx'
import BookReader from './pages/BookReader.jsx'
import Messages from './pages/Messages.jsx'
import Admin from './pages/Admin.jsx'
import SoulWinning from './pages/SoulWinning.jsx'
import PrayerFasting from './pages/PrayerFasting.jsx'
import Reports from './pages/Reports.jsx'

function Placeholder({ title }) {
  return (
    <div className="app">
      <main style={{ padding: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>{title}</h1>
        <p style={{ color: 'var(--muted)' }}>Coming soon — awaiting backend API.</p>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/bible-study" element={<BibleStudy />} />
      <Route path="/books" element={<Books />} />
      <Route path="/books/:bookId" element={<BookReader />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/soul-winning" element={<SoulWinning />} />
      <Route path="/prayer-fasting" element={<PrayerFasting />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/settings" element={<Placeholder title="Settings" />} />
    </Routes>
  )
}
