import { Router } from 'express'
import { protect } from '../auth/index.js'
import { Log } from '../schema/Log.js'
import { asyncHandler, badRequest } from '../lib/errors.js'
import { optionalText } from '../lib/validation.js'

export const logsRouter = Router()
logsRouter.use(protect)

logsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const action = optionalText(req.body.action, 200)
    if (!action) throw badRequest('action is required')

    const log = await Log.create({ user: req.user.id, action })
    res.status(201).json({
      ok: true,
      action: log.action,
      loggedAt: log.loggedAt.toISOString(),
    })
  }),
)

logsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const logs = await Log.find({ user: req.user.id }).sort({ loggedAt: -1 }).limit(100).lean()
    res.json({ logs })
  }),
)
