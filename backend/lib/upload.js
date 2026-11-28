import multer from 'multer'
import { env } from './env.js'
import { ApiError } from './errors.js'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxUploadMb * 1024 * 1024, files: 2 },
  fileFilter(_req, file, cb) {
    if (file.fieldname === 'file') {
      const isPdf = file.mimetype === 'application/pdf' || /\.pdf$/i.test(file.originalname)
      if (!isPdf) return cb(new ApiError(400, 'Only PDF files are allowed'))
      return cb(null, true)
    }
    if (file.fieldname === 'cover') {
      const isImage = IMAGE_TYPES.includes(file.mimetype) || /\.(jpe?g|png|webp|gif)$/i.test(file.originalname)
      if (!isImage) return cb(new ApiError(400, 'Cover must be a JPG, PNG, WEBP or GIF image'))
      return cb(null, true)
    }
    return cb(new ApiError(400, 'Unexpected file field'), false)
  },
})

export const uploadBookFiles = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
])
