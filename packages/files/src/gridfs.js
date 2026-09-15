/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * GridFS storage adapter
 *
 * GridFSBucket comes from the injected Meteor Mongo driver so this package
 * never imports meteor/* or a second mongodb copy.
 *
 * gridFsId is stored as a 24-char hex string. Meteor.Collection turns a native
 * ObjectId into Meteor.ObjectID; GridFS find({ _id }) then misses the file.
 */
import { StorageAdapter } from './adapter.js'
import { GRIDFS_BUCKET } from './constants.js'

export class GridFSAdapter extends StorageAdapter {
  constructor({ db, GridFSBucket, ObjectId, bucketName = GRIDFS_BUCKET }) {
    super()
    if (!db || !GridFSBucket || !ObjectId) {
      throw new Error('GridFSAdapter requires db, GridFSBucket, and ObjectId from MongoInternals')
    }

    this.ObjectId = ObjectId
    this.bucket = new GridFSBucket(db, { bucketName })
  }

  async write({ filename, mime, streamOrBuffer }) {
    const bytes = toNodeBuffer(streamOrBuffer)
    const uploadStream = this.bucket.openUploadStream(filename, {
      contentType: mime,
    })

    await new Promise((resolve, reject) => {
      uploadStream.once('error', reject)
      uploadStream.once('finish', resolve)
      uploadStream.end(bytes)
    })

    return uploadStream.id.toHexString()
  }

  async read(id) {
    return this.bucket.openDownloadStream(this.toNativeObjectId(id))
  }

  async remove(id) {
    try {
      await this.bucket.delete(this.toNativeObjectId(id))
    } catch (error) {
      if (isMissingGridFsFile(error)) {
        return
      }
      throw error
    }
  }

  toNativeObjectId(id) {
    const hex = readObjectIdHex(id)
    return new this.ObjectId(hex)
  }
}

function toNodeBuffer(streamOrBuffer) {
  if (Buffer.isBuffer(streamOrBuffer)) {
    return streamOrBuffer
  }
  if (streamOrBuffer instanceof Uint8Array) {
    return Buffer.from(streamOrBuffer)
  }

  throw new Error('GridFSAdapter.write expects a Buffer or Uint8Array in v1')
}

function readObjectIdHex(id) {
  if (typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)) {
    return id
  }
  if (id && typeof id.toHexString === 'function') {
    return id.toHexString()
  }
  if (typeof id?._str === 'string') {
    return id._str
  }

  throw new Error('gridFsId must be a 24-character hex string')
}

function isMissingGridFsFile(error) {
  const message = String(error?.message ?? '')
  return message.includes('FileNotFound') || error?.code === 'ENOENT'
}
