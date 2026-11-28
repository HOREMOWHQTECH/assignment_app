import { Setting } from '../schema/Setting.js'
import { CONFIG_DEFAULTS } from '../constants/defaults.js'

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value)

function mergeDeep(base, override = {}) {
  const result = structuredClone(base)
  for (const [key, value] of Object.entries(override)) {
    if (isObject(value) && isObject(result[key])) {
      result[key] = mergeDeep(result[key], value)
    } else {
      result[key] = value
    }
  }
  return result
}

export async function getConfig(key) {
  const fallback = CONFIG_DEFAULTS[key]
  if (!fallback) return null
  const record = await Setting.findOne({ key }).lean()
  return record ? mergeDeep(fallback, record.value) : structuredClone(fallback)
}

export async function setConfig(key, value) {
  const fallback = CONFIG_DEFAULTS[key]
  if (!fallback) return null
  const record = await Setting.findOneAndUpdate(
    { key },
    { $set: { value: mergeDeep(fallback, value) } },
    { new: true, upsert: true },
  ).lean()
  return record.value
}
