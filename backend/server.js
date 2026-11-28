import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'

import { env } from './lib/env.js'
import { connectDB } from './lib/db.js'
import { errorHandler, notFoundHandler } from './lib/errors.js'
import { seedDatabase } from './scripts/seed.js'

import { adminRouter } from './routes/admin.js'
import { authRouter } from './routes/auth.js'
import { bibleRouter } from './routes/bible.js'
import { booksRouter } from './routes/books.js'
import { dashboardRouter } from './routes/dashboard.js'
import { logsRouter } from './routes/logs.js'
import { messagesRouter } from './routes/messages.js'
import { prayerRouter } from './routes/prayer.js'
import { reportsRouter } from './routes/reports.js'
import { settingsRouter } from './routes/settings.js'
import { soulsRouter } from './routes/souls.js'
import { voiceRouter } from './routes/voice.js'

const app = express()
const allowedOrigins = env.clientOrigin.split(',').map((origin) => origin.trim()).filter(Boolean)

app.set('trust proxy', 1)
app.disable('x-powered-by')
app.use(cors({
  origin: allowedOrigins.includes('*') ? true : allowedOrigins,
  credentials: true,
}))
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

function healthCheck(_req, res) {
  res.json({
    ok: true,
    service: 'horemow-api',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  })
}

app.get('/health', healthCheck)
app.get('/api/health', healthCheck)

app.use('/api/auth', authRouter)
app.use('/api/bible', bibleRouter)
app.use('/api/bible-study', bibleRouter)
app.use('/api/books', booksRouter)
app.use('/api/messages', messagesRouter)
app.use('/api/souls', soulsRouter)
app.use('/api/prayer', prayerRouter)
app.use('/api/admin', adminRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/voice', voiceRouter)
app.use('/api/reports', reportsRouter)
app.use('/api/dashboard/logs', logsRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/logs', logsRouter)

app.use(notFoundHandler)
app.use(errorHandler)

async function start() {
  if (env.autoSeed) {
    await seedDatabase()
    console.log('Built-in data and admin config verified.')
  } else {
    await connectDB()
  }

  const server = app.listen(env.port, () => {
    console.log(`HOREMOW API listening on http://localhost:${env.port}/api`)
  })

  const shutdown = () => {
    server.close(async () => {
      try {
        await mongoose.connection.close()
      } finally {
        process.exit(0)
      }
    })
  }

  process.once('SIGTERM', shutdown)
  process.once('SIGINT', shutdown)
}

start().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
