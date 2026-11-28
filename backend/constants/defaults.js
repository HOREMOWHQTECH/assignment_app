export const EVENT_KEYS = ['general', 'women', 'ministries', 'youth']

export const EVENT_FILTERS = [
  { value: 'general', label: 'December (General)' },
  { value: 'women', label: 'Women' },
  { value: 'ministries', label: 'Ministers' },
  { value: 'youth', label: 'Youth' },
]

export const BENCHMARKS = { general: 40, women: 30, ministries: 20, youth: 60 }

export const SOUL_TARGETS = { general: 50, women: 30, ministries: 20, youth: 60 }

export const PRAYER_TARGETS = { general: 60, women: 60, ministries: 90, youth: 60 }

export const APP_SETTINGS = {
  modules: {
    bibleStudy: true,
    books: true,
    messages: true,
    soulWinning: true,
    prayer: true,
    reports: true,
  },
}

export const CONFIG_DEFAULTS = {
  benchmarks: BENCHMARKS,
  'soul-targets': SOUL_TARGETS,
  'prayer-targets': PRAYER_TARGETS,
  settings: APP_SETTINGS,
}
