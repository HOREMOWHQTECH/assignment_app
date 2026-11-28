import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthShell, GoogleButton } from '../components/AuthShell.jsx'
import Icon from '../components/Icon.jsx'
import { COUNTRIES, STATES } from '../data/locations.js'
import { useAuth } from '../auth/AuthContext.jsx'
import { requestGoogleCredential } from '../auth/google.js'
import { errorMessage } from '../api/client.js'

const ROLES = [
  { value: 'member', label: 'Member', icon: 'users' },
  { value: 'leader', label: 'Leader', icon: 'shield' },
]

export default function Register() {
  const navigate = useNavigate()
  const { register, google } = useAuth()
  const [form, setForm] = useState({
    name: '', email: '', password: '', country: '', state: '', chapter: '', zone: '', role: 'member',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const stateOptions = STATES[form.country] || []

  const update = (key) => (e) => {
    const value = e.target.value
    setForm((f) => ({
      ...f,
      [key]: value,
      ...(key === 'country' ? { state: '' } : {}),
    }))
  }

  const validate = () => {
    if (!form.name.trim()) return 'Please enter your full name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Please enter a valid email address.'
    if (form.password.length < 6) return 'Password must be at least 6 characters.'
    if (!form.country) return 'Please select your country.'
    if (stateOptions.length && !form.state) return 'Please select your state.'
    if (!form.chapter.trim()) return 'Please enter your chapter.'
    if (!form.zone.trim()) return 'Please enter your zone.'
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) return setError(err)
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/')
    } catch (err2) {
      setError(errorMessage(err2))
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
      title="Create your account"
      subtitle="Join HOREMOW and start your holiness journey today."
      footer={
        <p className="auth-foot">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      }
    >
      <GoogleButton onClick={handleGoogle} label="Sign up with Google" disabled={loading} />
      <div className="divider">or sign up with email</div>

      <form onSubmit={handleSubmit} noValidate>
        {error && <div className="auth-err">{error}</div>}

        <div className="field">
          <label htmlFor="reg-name">Full Name <em>*</em></label>
          <input
            id="reg-name"
            className="input"
            type="text"
            placeholder="e.g. Bro. Emmanuel Okonkwo"
            value={form.name}
            onChange={update('name')}
            autoComplete="name"
          />
        </div>

        <div className="field">
          <label htmlFor="reg-email">Email <em>*</em></label>
          <input
            id="reg-email"
            className="input"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={update('email')}
            autoComplete="email"
          />
        </div>

        <div className="field">
          <label htmlFor="reg-password">Password <em>*</em></label>
          <input
            id="reg-password"
            className="input"
            type="password"
            placeholder="At least 6 characters"
            value={form.password}
            onChange={update('password')}
            autoComplete="new-password"
          />
        </div>

        <div className="field">
          <label htmlFor="reg-country">Country <em>*</em></label>
          <select id="reg-country" value={form.country} onChange={update('country')}>
            <option value="">Select country</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="reg-state">State / Region{stateOptions.length > 0 && <em> *</em>}</label>
          {stateOptions.length > 0 ? (
            <select id="reg-state" value={form.state} onChange={update('state')}>
              <option value="">Select state</option>
              {stateOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          ) : (
            <input
              id="reg-state"
              className="input"
              type="text"
              placeholder="Enter your state or region"
              value={form.state}
              onChange={update('state')}
              autoComplete="address-level1"
            />
          )}
        </div>

        <div className="field">
          <label htmlFor="reg-chapter">Chapter <em>*</em></label>
          <input
            id="reg-chapter"
            className="input"
            type="text"
            placeholder="e.g. Lagos Central Chapter"
            value={form.chapter}
            onChange={update('chapter')}
          />
        </div>

        <div className="field">
          <label htmlFor="reg-zone">Zone <em>*</em></label>
          <input
            id="reg-zone"
            className="input"
            type="text"
            placeholder="e.g. Ikeja Zone"
            value={form.zone}
            onChange={update('zone')}
          />
        </div>

        <div className="field">
          <label>I am a</label>
          <div className="role-toggle" role="radiogroup" aria-label="Role">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                className={form.role === r.value ? 'on' : ''}
                onClick={() => setForm((f) => ({ ...f, role: r.value }))}
                aria-pressed={form.role === r.value}
              >
                <Icon name={r.icon} />
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <motion.button
          className="btn pri"
          type="submit"
          style={{ width: '100%', justifyContent: 'center', height: 46, borderRadius: 12, fontSize: 15 }}
          disabled={loading}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? 'Creating account…' : 'Create Account'}
        </motion.button>
      </form>
    </AuthShell>
  )
}
