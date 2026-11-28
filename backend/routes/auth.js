import { randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { OAuth2Client } from 'google-auth-library'
import { Router } from 'express'
import { env } from '../lib/env.js'
import { EVENT_KEYS } from '../constants/defaults.js'
import { protect, signToken } from '../auth/index.js'
import { TokenDenylist } from '../schema/TokenDenylist.js'
import { User } from '../schema/User.js'
import { asyncHandler, badRequest, conflict, notFound, unauthorized } from '../lib/errors.js'
import { isEmail, normalizeEmail, optionalText, requiredText, sanitizeUser } from '../lib/validation.js'

export const authRouter = Router()
const googleClient = env.googleClientId ? new OAuth2Client(env.googleClientId) : null

function authResponse(user) {
  return { token: signToken(user), user: sanitizeUser(user) }
}

authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const name = requiredText(req.body.name, 'Name')
    const email = normalizeEmail(req.body.email)
    if (!isEmail(email)) throw badRequest('A valid email address is required')

    const password = String(req.body.password || '')
    if (password.length < 6) throw badRequest('Password must be at least 6 characters')

    const role = req.body.role || 'member'
    if (!['member', 'leader'].includes(role)) throw badRequest('Invalid role')

    if (await User.exists({ email })) throw conflict('An account with this email already exists')

    const user = await User.create({
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role,
      country: optionalText(req.body.country, 100),
      state: optionalText(req.body.state, 100),
      chapter: requiredText(req.body.chapter, 'Chapter'),
      zone: requiredText(req.body.zone, 'Zone'),
    })

    res.status(201).json(authResponse(user))
  }),
)

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body.email)
    const password = String(req.body.password || '')
    if (!email || !password) throw badRequest('Email and password are required')

    const user = await User.findOne({ email }).select('+passwordHash')
    if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      throw unauthorized('Invalid email or password')
    }

    res.json(authResponse(user))
  }),
)

authRouter.post(
  '/google',
  asyncHandler(async (req, res) => {
    const credential = req.body.credential || req.body.idToken || req.body.token
    if (!credential) throw badRequest('A Google ID token is required')
    if (!googleClient) throw badRequest('GOOGLE_CLIENT_ID is not configured on the server')

    let payload
    try {
      const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: env.googleClientId })
      payload = ticket.getPayload()
    } catch {
      throw unauthorized('Invalid Google ID token')
    }
    if (!payload?.email || !payload?.sub) throw unauthorized('Google account details are unavailable')

    const email = normalizeEmail(payload.email)
    let user = await User.findOne({ googleId: payload.sub })
    if (!user) user = await User.findOne({ email })

    if (user) {
      if (!user.googleId) {
        user.googleId = payload.sub
        await user.save()
      }
    } else {
      user = await User.create({
        name: payload.name || email.split('@')[0],
        email,
        googleId: payload.sub,
        role: 'member',
        passwordHash: await bcrypt.hash(randomBytes(32).toString('hex'), 10),
      })
    }

    res.json(authResponse(user))
  }),
)

authRouter.post(
  '/logout',
  protect,
  asyncHandler(async (req, res) => {
    const expiresAt = new Date((req.user.exp || Math.floor(Date.now() / 1000)) * 1000)
    await TokenDenylist.updateOne(
      { jti: req.user.jti },
      { $setOnInsert: { jti: req.user.jti }, $set: { expiresAt } },
      { upsert: true },
    )
    res.json({ ok: true })
  }),
)

authRouter.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)
    if (!user) throw notFound('User not found')
    res.json({ user: sanitizeUser(user) })
  }),
)

authRouter.patch(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)
    if (!user) throw notFound('User not found')

    const patch = {}
    if (req.body.name !== undefined) patch.name = requiredText(req.body.name, 'Name')
    if (req.body.chapter !== undefined) patch.chapter = requiredText(req.body.chapter, 'Chapter')
    if (req.body.zone !== undefined) patch.zone = requiredText(req.body.zone, 'Zone')
    for (const field of ['country', 'state']) {
      if (req.body[field] !== undefined) patch[field] = optionalText(req.body[field], 200)
    }
    if (req.body.event !== undefined) {
      const event = optionalText(req.body.event, 100)
      if (event && !EVENT_KEYS.includes(event)) throw badRequest('Invalid event')
      patch.event = event
    }
    if (req.body.email !== undefined) {
      const email = normalizeEmail(req.body.email)
      if (!isEmail(email)) throw badRequest('A valid email address is required')
      if (email !== user.email && await User.exists({ email })) {
        throw conflict('An account with this email already exists')
      }
      patch.email = email
    }

    Object.assign(user, patch)
    await user.save()
    res.json({ user: sanitizeUser(user) })
  }),
)

authRouter.patch(
  '/password',
  protect,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('+passwordHash')
    if (!user) throw notFound('User not found')
    if (!user.passwordHash) throw badRequest('This account does not have a password to change')

    const currentPassword = String(req.body.currentPassword || '')
    const newPassword = String(req.body.newPassword || '')
    if (!currentPassword || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw unauthorized('Current password is incorrect')
    }
    if (newPassword.length < 6) throw badRequest('New password must be at least 6 characters')

    user.passwordHash = await bcrypt.hash(newPassword, 10)
    await user.save()
    res.json({ ok: true })
  }),
)
