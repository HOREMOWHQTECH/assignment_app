import { useQuery } from '@tanstack/react-query'
import { api } from './client.js'

export function useReportSummary() {
  return useQuery({
    queryKey: ['reports', 'summary'],
    queryFn: () => api('/reports/summary'),
  })
}
