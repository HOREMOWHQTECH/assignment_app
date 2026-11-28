import { useState } from 'react'
import TopBar from '../components/TopBar.jsx'
import HeroCard from '../components/HeroCard.jsx'
import GoalCard from '../components/GoalCard.jsx'
import QuickLog from '../components/QuickLog.jsx'
import AppShell from '../components/AppShell.jsx'
import { DashboardSkeleton } from '../components/Skeleton.jsx'
import { useDashboard, useQuickLog } from '../api/dashboard.js'
import { errorMessage } from '../api/client.js'

export default function Dashboard() {
  const [selection, setSelection] = useState({ event: 'general', audience: 'general' })
  const { data, isLoading, error } = useDashboard(selection)
  const quickLog = useQuickLog()

  const filters = data?.filters || { events: [], audiences: [] }

  return (
    <AppShell>
      <main>
        <TopBar
          filters={filters}
          event={selection.event}
          audience={selection.audience}
          streak={data?.streak ?? 0}
          onEvent={(event) => setSelection((s) => ({ ...s, event }))}
          onAudience={(audience) => setSelection((s) => ({ ...s, audience }))}
        />
        {error && <div className="auth-err">{errorMessage(error)}</div>}
        {isLoading || !data ? (
          <DashboardSkeleton />
        ) : (
          <>
            <div className="grid">
              <HeroCard user={data.user} />
              <GoalCard goal={data.goal} />
            </div>
            <QuickLog onLog={(action) => quickLog.mutateAsync(action)} />
          </>
        )}
      </main>
    </AppShell>
  )
}
