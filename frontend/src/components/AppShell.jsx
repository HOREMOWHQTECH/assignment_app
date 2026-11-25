import { useState } from 'react'
import Sidebar from './Sidebar.jsx'

export default function AppShell({ children }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={`app${collapsed ? ' collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      {children}
    </div>
  )
}
