import { Router } from 'express'
import { protect } from '../auth/index.js'
import { Message } from '../schema/Message.js'
import { asyncHandler, badRequest, notFound } from '../lib/errors.js'
import { events, requiredText } from '../lib/validation.js'

export const messagesRouter = Router()
messagesRouter.use(protect)

messagesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const entries = await Message.find({ user: req.user.id }).sort({ date: -1 }).lean()
    res.json({ entries })
  }),
)

messagesRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const entry = await Message.create({
      user: req.user.id,
      title: requiredText(req.body.title, 'Title'),
      speaker: requiredText(req.body.speaker, 'Speaker'),
      audiences: events(req.body.audiences ?? req.body.audience),
      date: req.body.date ? new Date(req.body.date) : new Date(),
    })
    res.status(201).json({ entry })
  }),
)

messagesRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const entry = await Message.findOneAndDelete({ _id: req.params.id, user: req.user.id })
    if (!entry) throw notFound('Message not found')
    res.json({ ok: true })
  }),
)
