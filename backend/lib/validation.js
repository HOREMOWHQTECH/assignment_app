import { badRequest } from './errors.js'
import { EVENT_KEYS } from '../constants/defaults.js'

export const normalizeEmail = (email) => String(email || '').trim().toLowerCase()

export const isEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export function requiredText(value, label) {
  const text = String(value ?? '').trim()
  if (!text) throw badRequest(`${label} is required`)
  return text
}

export function optionalText(value, max = 500) {
  return String(value ?? '').trim().slice(0, max)
}

export function integer(value, label, { min = 0, fallback } = {}) {
  if (value === undefined || value === null || value === '') {
    if (fallback !== undefined) return fallback
    throw badRequest(`${label} is required`)
  }
  const num = Number(value)
  if (!Number.isInteger(num) || num < min) throw badRequest(`${label} must be an integer of at least ${min}`)
  return num
}

export function events(value) {
  const list = Array.isArray(value) ? value : value ? [value] : []
  const cleaned = [...new Set(list.map((item) => String(item).trim()).filter(Boolean))]
  if (!cleaned.length) return ['general']
  const invalid = cleaned.filter((item) => !EVENT_KEYS.includes(item))
  if (invalid.length) throw badRequest(`Unknown event tag: ${invalid.join(', ')}`)
  return cleaned
}

export function sanitizeUser(user) {
  if (!user) return null
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    country: user.country || '',
    state: user.state || '',
    event: user.event || '',
    chapter: user.chapter || '',
    zone: user.zone || '',
    createdAt: user.createdAt,
  }
}
