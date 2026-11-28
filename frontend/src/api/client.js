const TOKEN_KEY = 'horemow-token'

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export function getToken() {
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) window.localStorage.setItem(TOKEN_KEY, token)
  else window.localStorage.removeItem(TOKEN_KEY)
}

export function clearToken() {
  setToken(null)
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return response.json()
  }
  const text = await response.text()
  return text ? { message: text } : {}
}

export async function api(path, { method = 'GET', body, signal, headers = {} } = {}) {
  const token = getToken()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    signal,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })

  const data = await parseResponse(response)
  if (!response.ok) {
    if (response.status === 401 && token) clearToken()
    throw new ApiError(data?.message || `Request failed (${response.status})`, response.status, data)
  }
  return data
}

export async function apiForm(path, formData, { method = 'POST', signal } = {}) {
  const token = getToken()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    signal,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })

  const data = await parseResponse(response)
  if (!response.ok) {
    if (response.status === 401 && token) clearToken()
    throw new ApiError(data?.message || `Request failed (${response.status})`, response.status, data)
  }
  return data
}

export async function apiBlob(path) {
  const token = getToken()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!response.ok) {
    const data = await parseResponse(response)
    throw new ApiError(data?.message || `Download failed (${response.status})`, response.status, data)
  }
  return response.blob()
}

export const errorMessage = (error) => error?.message || 'Something went wrong. Please try again.'
