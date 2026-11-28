import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthShell, GoogleButton } from '../components/AuthShell.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { requestGoogleCredential } from '../auth/google.js'
import { errorMessage } from '../api/client.js'

export default function Login() {
  const navigate = useNavigate()
  const { login, google } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      return setError('Please enter your email and password.')
    }
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      await google(await requestGoogleCredential())
      navigate('/')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue your HOREMOW journey."
      footer={
        <p className="auth-foot">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      }
    >
      <GoogleButton onClick={handleGoogle} label="Sign in with Google" disabled={loading} />
      <div className="divider">or sign in with email</div>

      <form onSubmit={handleSubmit} noValidate>
        {error && <div className="auth-err">{error}</div>}

        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            className="input"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={update('email')}
            autoComplete="email"
          />
        </div>

        <div className="field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            className="input"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={update('password')}
            autoComplete="current-password"
          />
        </div>

        <motion.button
          className="btn pri"
          type="submit"
          style={{ width: '100%', justifyContent: 'center', height: 46, borderRadius: 12, fontSize: 15 }}
          disabled={loading}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </motion.button>
      </form>
    </AuthShell>
  )
}
