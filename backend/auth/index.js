import { randomUUID } from 'node:crypto'
import jwt from 'jsonwebtoken'
import { env } from '../lib/env.js'
import { TokenDenylist } from '../schema/TokenDenylist.js'
import { ApiError, asyncHandler } from '../lib/errors.js'

export function signToken(user) {
  return jwt.sign(
    { role: user.role },
    env.jwtSecret,
    { subject: user._id.toString(), jwtid: randomUUID(), expiresIn: env.jwtExpiresIn },
  )
}

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token) throw new ApiError(401, 'Authentication required')

  try {
    const payload = jwt.verify(token, env.jwtSecret)
    if (await TokenDenylist.exists({ jti: payload.jti })) {
      throw new Error('Token revoked')
    }
    req.user = { id: payload.sub, role: payload.role, jti: payload.jti, exp: payload.exp }
    next()
  } catch {
    throw new ApiError(401, 'Invalid or expired token')
  }
})

export function requireAdmin(req, _res, next) {
  if (req.user?.role !== 'admin') return next(new ApiError(403, 'Admin access required'))
  next()
}
