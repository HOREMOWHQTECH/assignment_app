import Sidebar from '../components/Sidebar.jsx'
import TopBar from '../components/TopBar.jsx'
import HeroCard from '../components/HeroCard.jsx'
import GoalCard from '../components/GoalCard.jsx'
import QuickLog from '../components/QuickLog.jsx'
import { useDashboard, useQuickLog } from '../api/dashboard.js'

export default function Dashboard() {
  const { data, isLoading } = useDashboard()
  const quickLog = useQuickLog()

  if (isLoading || !data) {
    return (
      <div className="app">
        <Sidebar />
        <main>
          <TopBar />
          <div className="grid">
            <section className="card hero" style={{ minHeight: 320 }} />
            <section className="card goal" style={{ minHeight: 320 }} />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <Sidebar />
      <main>
        <TopBar />
        <div className="grid">
          <HeroCard user={data.user} />
          <GoalCard goal={data.goal} />
        </div>
        <QuickLog onLog={(action) => quickLog.mutate(action)} />
      </main>
    </div>
  )
}
