import express from 'express'
import mongoose from 'mongoose'
import { Profile, Swipe } from './models.js'

export const app = express()
app.use(express.json({ limit: '10kb' }))
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.get('/api/profiles', async (_req, res, next) => {
  try { res.json(await Profile.find().lean()) } catch (error) { next(error) }
})
app.post('/api/swipe', async (req, res, next) => {
  const body = req.body
  if (!body || Array.isArray(body) || typeof body !== 'object' ||
      Object.keys(body).some((key) => !['profileId', 'direction'].includes(key)) ||
      typeof body.profileId !== 'string' || !mongoose.isObjectIdOrHexString(body.profileId) ||
      !['left', 'right', 'up'].includes(body.direction)) {
    return res.status(400).json({ error: 'Expected profileId and direction (left, right, or up).' })
  }
  try {
    if (!await Profile.exists({ _id: body.profileId })) return res.status(404).json({ error: 'Profile not found.' })
    const swipe = await Swipe.create({ profileId: body.profileId, direction: body.direction })
    return res.status(201).json(swipe)
  } catch (error) { return next(error) }
})
app.use((error, _req, res, _next) => {
  if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON.' })
  if (error.type === 'entity.too.large') return res.status(413).json({ error: 'Payload too large.' })
  return res.status(500).json({ error: 'Internal server error.' })
})
