export function getLevel(done, total) {
  if (done === 0) return { key: 'none', label: 'Not Started', icon: 'book' }
  const pct = done / total
  if (pct >= 1) return { key: 'platinum', label: 'Platinum', icon: 'star' }
  if (pct >= 0.67) return { key: 'gold', label: 'Gold', icon: 'flame' }
  if (pct >= 0.34) return { key: 'silver', label: 'Silver', icon: 'shield' }
  return { key: 'bronze', label: 'Bronze', icon: 'book' }
}
