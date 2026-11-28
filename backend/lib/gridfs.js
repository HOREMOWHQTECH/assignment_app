import mongoose from 'mongoose'
import { GridFSBucket, ObjectId } from 'mongodb'
import { badRequest } from './errors.js'

let bucket

function getBucket() {
  if (!bucket) {
    bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'horemow-pdfs' })
  }
  return bucket
}

async function uploadFile(buffer, filename, contentType, metadata = {}) {
  if (!buffer?.length) throw badRequest('A file is required')

  const id = new ObjectId()
  await new Promise((resolve, reject) => {
    const stream = getBucket().openUploadStream(filename, { id, contentType, metadata })
    stream.on('error', reject)
    stream.on('finish', resolve)
    stream.end(buffer)
  })
  return id
}

export async function uploadPdf(buffer, filename, metadata = {}) {
  return uploadFile(buffer, filename, 'application/pdf', metadata)
}

export async function uploadImage(buffer, filename, contentType, metadata = {}) {
  return uploadFile(buffer, filename, contentType || 'image/jpeg', metadata)
}

async function streamFile(id, res, fallback = {}) {
  if (!ObjectId.isValid(id)) throw badRequest('Invalid file id')

  const objectId = new ObjectId(id)
  const file = await getBucket().find({ _id: objectId }).toArray()
  if (!file.length) return false

  const meta = file[0]
  const filename = (meta.filename || fallback.filename || 'file').replace(/"/g, '')
  res.setHeader('Content-Type', meta.contentType || fallback.contentType || 'application/octet-stream')
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`)
  res.setHeader('Content-Length', meta.length)

  await new Promise((resolve, reject) => {
    const stream = getBucket().openDownloadStream(objectId)
    stream.on('error', reject)
    stream.on('end', resolve)
    stream.pipe(res)
  })
  return true
}

export async function streamPdf(id, res) {
  return streamFile(id, res, { contentType: 'application/pdf', filename: 'book.pdf' })
}

export async function streamImage(id, res) {
  return streamFile(id, res, { contentType: 'image/jpeg', filename: 'cover.jpg' })
}

export async function deleteFile(id) {
  if (!id || !ObjectId.isValid(id)) return
  await getBucket().delete(new ObjectId(id))
}
