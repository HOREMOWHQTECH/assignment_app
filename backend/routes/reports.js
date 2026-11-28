import { Router } from 'express'
import { protect } from '../auth/index.js'
import { computeReport } from '../lib/report.js'
import { asyncHandler } from '../lib/errors.js'

export const reportsRouter = Router()
reportsRouter.use(protect)

reportsRouter.get(
  '/summary',
  asyncHandler(async (req, res) => {
    res.json(await computeReport(req.user.id))
  }),
)
