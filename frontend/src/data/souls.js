export const SOUL_TAGS = [
  { key: 'standing', label: 'Still standing' },
  { key: 'conference', label: 'Invited to conference' },
  { key: 'none', label: 'None' },
]

export const SOUL_TAG_LABEL = Object.fromEntries(SOUL_TAGS.map((t) => [t.key, t.label]))
