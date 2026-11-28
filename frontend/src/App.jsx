import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthContext.jsx'
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
import Settings from './pages/Settings.jsx'

function Loading() {
  return (
    <div className="app" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <p className="sub">Loading…</p>
    </div>
  )
}

function RequireAuth({ adminOnly = false, children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  if (user) return <Navigate to="/" replace />
  return children
}

const protectedRoute = (element, adminOnly = false) => (
  <RequireAuth adminOnly={adminOnly}>{element}</RequireAuth>
)

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
      <Route path="/" element={protectedRoute(<Dashboard />)} />
      <Route path="/bible-study" element={protectedRoute(<BibleStudy />)} />
      <Route path="/books" element={protectedRoute(<Books />)} />
      <Route path="/books/:bookId" element={protectedRoute(<BookReader />)} />
      <Route path="/messages" element={protectedRoute(<Messages />)} />
      <Route path="/soul-winning" element={protectedRoute(<SoulWinning />)} />
      <Route path="/prayer-fasting" element={protectedRoute(<PrayerFasting />)} />
      <Route path="/reports" element={protectedRoute(<Reports />)} />
      <Route path="/settings" element={protectedRoute(<Settings />)} />
      <Route path="/admin" element={protectedRoute(<Admin />, true)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
