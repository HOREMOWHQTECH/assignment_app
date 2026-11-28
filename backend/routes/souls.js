import { Router } from 'express'
import { protect } from '../auth/index.js'
import { Soul } from '../schema/Soul.js'
import { asyncHandler, badRequest, notFound } from '../lib/errors.js'
import { events, optionalText, requiredText } from '../lib/validation.js'

export const soulsRouter = Router()
soulsRouter.use(protect)

const allowedTags = ['standing', 'conference', 'none']

soulsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const souls = await Soul.find({ user: req.user.id }).sort({ date: -1 }).lean()
    res.json({ souls })
  }),
)

soulsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const tag = optionalText(req.body.tag, 30) || 'none'
    if (!allowedTags.includes(tag)) throw badRequest('Invalid soul tag')

    const soul = await Soul.create({
      user: req.user.id,
      name: requiredText(req.body.name, 'Name'),
      phone: requiredText(req.body.phone, 'Phone'),
      address: optionalText(req.body.address),
      note: optionalText(req.body.note, 2000),
      tag,
      events: events(req.body.events),
      date: req.body.date ? new Date(req.body.date) : new Date(),
    })
    res.status(201).json({ soul })
  }),
)

soulsRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const patch = {}
    for (const field of ['name', 'phone', 'address', 'note', 'tag']) {
      if (req.body[field] !== undefined) patch[field] = optionalText(req.body[field], field === 'note' ? 2000 : 300)
    }
    if (patch.name === '') throw badRequest('Name cannot be empty')
    if (patch.phone === '') throw badRequest('Phone cannot be empty')
    if (patch.tag && !allowedTags.includes(patch.tag)) throw badRequest('Invalid soul tag')
    if (req.body.events !== undefined) patch.events = events(req.body.events)

    const soul = await Soul.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: patch },
      { new: true, runValidators: true },
    )
    if (!soul) throw notFound('Soul entry not found')
    res.json({ soul })
  }),
)

soulsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const soul = await Soul.findOneAndDelete({ _id: req.params.id, user: req.user.id })
    if (!soul) throw notFound('Soul entry not found')
    res.json({ ok: true })
  }),
)
