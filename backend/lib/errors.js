import { env } from './env.js'

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export const badRequest = (message) => new ApiError(400, message)
export const unauthorized = (message = 'Authentication required') => new ApiError(401, message)
export const forbidden = (message = 'Admin access required') => new ApiError(403, message)
export const notFound = (message = 'Resource not found') => new ApiError(404, message)
export const conflict = (message = 'Resource already exists') => new ApiError(409, message)

export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next)
}

export function notFoundHandler(_req, res) {
  res.status(404).json({ message: 'Endpoint not found' })
}

export function errorHandler(err, _req, res, _next) {
  if (err.name === 'MulterError' || err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ message: err.message })
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'A record with these details already exists' })
  }
  if (err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ message: err.message })
  }

  console.error(err)
  const message = env.nodeEnv === 'production' ? 'Internal server error' : err.message || 'Internal server error'
  res.status(500).json({ message })
}
