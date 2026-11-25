import TopBar from '../components/TopBar.jsx'
import HeroCard from '../components/HeroCard.jsx'
import GoalCard from '../components/GoalCard.jsx'
import QuickLog from '../components/QuickLog.jsx'
import AppShell from '../components/AppShell.jsx'
import { DashboardSkeleton } from '../components/Skeleton.jsx'
import { useDashboard, useQuickLog } from '../api/dashboard.js'

export default function Dashboard() {
  const { data, isLoading } = useDashboard()
  const quickLog = useQuickLog()

  return (
    <AppShell>
      <main>
        <TopBar />
        {isLoading || !data ? (
          <DashboardSkeleton />
        ) : (
          <>
            <div className="grid">
              <HeroCard user={data.user} />
              <GoalCard goal={data.goal} />
            </div>
            <QuickLog onLog={(action) => quickLog.mutate(action)} />
          </>
        )}
      </main>
    </AppShell>
  )
}
