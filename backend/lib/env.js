import dotenv from 'dotenv'

dotenv.config()

const number = (value, fallback) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const env = {
  port: number(process.env.PORT, 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/horemow',
  jwtSecret: process.env.JWT_SECRET || 'horemow-development-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  maxUploadMb: number(process.env.MAX_UPLOAD_MB, 20),
  autoSeed: process.env.AUTO_SEED !== 'false',
}

if (env.nodeEnv === 'production' && env.jwtSecret.startsWith('horemow-development')) {
  throw new Error('JWT_SECRET must be set to a long random value in production')
}
