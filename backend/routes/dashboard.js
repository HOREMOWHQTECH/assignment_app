import { Router } from 'express'
import { protect } from '../auth/index.js'
import { User } from '../schema/User.js'
import { computeReport, computeStreak } from '../lib/report.js'
import { EVENT_FILTERS, EVENT_KEYS } from '../constants/defaults.js'
import { asyncHandler, badRequest, notFound } from '../lib/errors.js'
import { events, sanitizeUser } from '../lib/validation.js'

export const dashboardRouter = Router()
dashboardRouter.use(protect)

dashboardRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const eventKey = req.query.event ? events(req.query.event)[0] : null
    const audienceKey = req.query.audience ? events(req.query.audience)[0] : null
    if (req.query.event && !EVENT_KEYS.includes(eventKey)) throw badRequest('Unknown event filter')
    if (req.query.audience && !EVENT_KEYS.includes(audienceKey)) throw badRequest('Unknown audience filter')

    const filterKey = audienceKey || eventKey || 'general'
    const [user, report, streak] = await Promise.all([
      User.findById(req.user.id),
      computeReport(req.user.id, filterKey),
      computeStreak(req.user.id),
    ])
    if (!user) throw notFound('User not found')

    const profile = sanitizeUser(user)
    const roleLabels = { admin: 'Administrator', leader: 'Leader', member: 'General Member / Delegate' }
    const focus = [...report.categories].sort((a, b) => a.pct - b.pct).slice(0, 2).map((category) => category.name)

    res.json({
      user: {
        ...profile,
        role: roleLabels[user.role] || roleLabels.member,
        mandate: `Focus areas: ${focus.join(' and ')}.`,
      },
      goal: {
        percent: report.overall,
        grade: report.grade,
        message: `${report.grade} — grow in ${focus.join(' and ')} to reach First Class.`,
      },
      streak,
      filters: {
        events: EVENT_FILTERS,
        audiences: EVENT_FILTERS,
        event: eventKey || 'general',
        audience: audienceKey || 'general',
      },
      report,
    })
  }),
)
