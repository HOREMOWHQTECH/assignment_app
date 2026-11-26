import { useState } from 'react'
import Sidebar from './Sidebar.jsx'
import VoiceAssistant from './VoiceAssistant.jsx'
import Icon from './Icon.jsx'

export default function AppShell({ children }) {
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= 900,
  )

  return (
    <div className={`app${collapsed ? ' collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <button
        className="menu-fab"
        type="button"
        aria-label="Open menu"
        onClick={() => setCollapsed((c) => !c)}
      >
        <Icon name="menu" />
      </button>
      {!collapsed && <div className="side-backdrop" onClick={() => setCollapsed(true)} />}
      {children}
      <VoiceAssistant />
    </div>
  )
}
