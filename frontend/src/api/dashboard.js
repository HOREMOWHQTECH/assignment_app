import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// TODO: Replace mock fetchers with real API calls once backend endpoints are ready.
// All hooks below are shaped so only the fetcher bodies need to change.

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms))

async function fetchDashboard() {
  await delay()
  return {
    user: {
      name: 'Bro. Emmanuel Okonkwo',
      role: 'General Member / Delegate',
      event: 'December (General) Conference',
      mandate:
        'General holiness mandate: foundational message listening, core holiness books, soul winning & regular fellowship.',
      country: 'Nigeria',
      chapter: 'Lagos Central Chapter',
      branch: 'Ikeja Central HQ Fellowship',
    },
    goal: {
      percent: 30,
      message: 'Complete 100% in Bible, Books, Messages & Prayer to reach First Class.',
    },
  }
}

async function postQuickLog(action) {
  await delay(250)
  // TODO: POST /api/logs { action }
  return { ok: true, action, loggedAt: new Date().toISOString() }
}

export function useDashboard() {
  return useQuery({ queryKey: ['dashboard'], queryFn: fetchDashboard })
}

export function useQuickLog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: postQuickLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
