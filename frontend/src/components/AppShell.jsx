import { useState } from 'react'
import Sidebar from './Sidebar.jsx'

export default function AppShell({ children }) {
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= 900,
  )

  return (
    <div className={`app${collapsed ? ' collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      {children}
    </div>
  )
}
