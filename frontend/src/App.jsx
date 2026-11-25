import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'

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
      <Route path="/bible-study" element={<Placeholder title="Bible Study" />} />
      <Route path="/books" element={<Placeholder title="HOREMOW Books" />} />
      <Route path="/messages" element={<Placeholder title="Messages" />} />
      <Route path="/soul-winning" element={<Placeholder title="Soul Winning" />} />
      <Route path="/prayer-fasting" element={<Placeholder title="Prayer & Fasting" />} />
      <Route path="/reports" element={<Placeholder title="Official Report" />} />
    </Routes>
  )
}
