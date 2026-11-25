import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthShell, GoogleButton } from '../components/AuthShell.jsx'
import Icon from '../components/Icon.jsx'
import { COUNTRIES, STATES } from '../data/locations.js'

const ROLES = [
  { value: 'member', label: 'Member', icon: 'users' },
  { value: 'leader', label: 'Leader', icon: 'shield' },
]

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    country: '',
    state: '',
    role: 'member',
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
    if (!form.country) return 'Please select your country.'
    if (stateOptions.length && !form.state) return 'Please select your state.'
    return ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const err = validate()
    if (err) return setError(err)
    setError('')
    setLoading(true)
    // TODO: POST /api/auth/register with { name, email, country, state, role }
    setTimeout(() => navigate('/'), 600)
  }

  const handleGoogle = () => {
    // TODO: trigger Google OAuth flow
    navigate('/')
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
      <GoogleButton onClick={handleGoogle} label="Sign up with Google" />
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
          <label htmlFor="reg-country">Country <em>*</em></label>
          <select id="reg-country" value={form.country} onChange={update('country')}>
            <option value="">Select country</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="reg-state">
            {stateOptions.length ? 'State / Region' : 'State / Region'}
            {stateOptions.length > 0 && <em> *</em>}
          </label>
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
            />
          )}
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
