import { Router } from 'express'
import { protect } from '../auth/index.js'
import { asyncHandler } from '../lib/errors.js'
import { getConfig } from '../lib/config.js'

export const settingsRouter = Router()
settingsRouter.use(protect)

settingsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json(await getConfig('settings'))
  }),
)
