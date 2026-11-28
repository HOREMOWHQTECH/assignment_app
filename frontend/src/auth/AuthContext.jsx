import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api, clearToken, getToken, setToken as storeToken } from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const [token, setTokenState] = useState(() => getToken())
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(getToken()))

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return undefined
    }
    let active = true
    api('/auth/me')
      .then((data) => { if (active) setUser(data.user) })
      .catch(() => {
        clearToken()
        if (active) {
          setTokenState(null)
          setUser(null)
        }
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [token])

  const persist = useCallback((data) => {
    storeToken(data.token)
    setTokenState(data.token)
    setUser(data.user)
    queryClient.clear()
    return data.user
  }, [queryClient])

  const login = useCallback(async (email, password) => {
    return persist(await api('/auth/login', { method: 'POST', body: { email, password } }))
  }, [persist])

  const register = useCallback(async (payload) => {
    return persist(await api('/auth/register', { method: 'POST', body: payload }))
  }, [persist])

  const google = useCallback(async (credential) => {
    return persist(await api('/auth/google', { method: 'POST', body: { credential } }))
  }, [persist])

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' })
    } catch {
      // Clear locally even if the session has already expired.
    }
    clearToken()
    setTokenState(null)
    setUser(null)
    queryClient.clear()
  }, [queryClient])

  const updateProfile = useCallback(async (patch) => {
    const data = await api('/auth/me', { method: 'PATCH', body: patch })
    setUser(data.user)
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    return data.user
  }, [queryClient])

  const changePassword = useCallback(async (payload) => {
    return api('/auth/password', { method: 'PATCH', body: payload })
  }, [])

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    google,
    logout,
    updateProfile,
    changePassword,
  }), [user, token, loading, login, register, google, logout, updateProfile, changePassword])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
