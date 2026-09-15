/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * GridFS storage adapter
 *
 * GridFSBucket comes from the injected Meteor Mongo driver so this package
 * never imports meteor/* or a second mongodb copy.
 */
import { StorageAdapter } from './adapter.js'
import { GRIDFS_BUCKET } from './constants.js'

export class GridFSAdapter extends StorageAdapter {
  constructor({ db, GridFSBucket, bucketName = GRIDFS_BUCKET }) {
    super()
    if (!db || !GridFSBucket) {
      throw new Error('GridFSAdapter requires db and GridFSBucket from MongoInternals')
    }

    this.bucket = new GridFSBucket(db, { bucketName })
  }

  async write({ filename, mime, streamOrBuffer }) {
    const bytes = toUint8Array(streamOrBuffer)
    const uploadStream = this.bucket.openUploadStream(filename, {
      contentType: mime,
    })

    return new Promise((resolve, reject) => {
      uploadStream.once('error', reject)
      uploadStream.once('finish', () => {
        resolve(uploadStream.id)
      })
      uploadStream.end(bytes)
    })
  }

  async read(id) {
    return this.bucket.openDownloadStream(id)
  }

  async remove(id) {
    try {
      await this.bucket.delete(id)
    } catch (error) {
      if (isMissingGridFsFile(error)) {
        return
      }
      throw error
    }
  }
}

function toUint8Array(streamOrBuffer) {
  if (streamOrBuffer instanceof Uint8Array) {
    return streamOrBuffer
  }

  throw new Error('GridFSAdapter.write expects a Uint8Array in v1')
}

function isMissingGridFsFile(error) {
  const message = String(error?.message ?? '')
  return message.includes('FileNotFound') || error?.code === 'ENOENT'
}
