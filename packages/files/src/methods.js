/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * DDP upload methods (start / pushChunk / finish / remove)
 *
 * Sessions live in memory so a server restart aborts in-flight uploads.
 * Roles and parent existence are both required before any GridFS write.
 */
import {
  ALLOWED_MIME_TYPES,
  DEFAULT_MAX_BYTES,
  METHOD_FINISH,
  METHOD_PUSH_CHUNK,
  METHOD_REMOVE,
  METHOD_START,
  STORAGE_KIND,
} from './constants.js'
import { getRegisteredOwner } from './owners.js'

const uploadSessions = new Map()

export function registerMethods({
  Meteor,
  check,
  Match,
  Random,
  Roles,
  filesCollection,
  storageAdapter,
}) {
  Meteor.methods({
    async [METHOD_START](params) {
      check(params, {
        ownerType: String,
        ownerId: String,
        name: String,
        mime: String,
        size: Number,
      })

      const owner = requireRegisteredOwner(Meteor, params.ownerType)
      const userId = requireCaller(Meteor, this.userId, owner)
      await requireOwnerRole(Meteor, Roles, userId, owner, owner.roles.upload)
      await requireParentExists(Meteor, owner.collection, params.ownerId)
      rejectInvalidFile(Meteor, params)

      const uploadId = Random.id()
      uploadSessions.set(uploadId, {
        uploadId,
        userId,
        ownerType: params.ownerType,
        ownerId: params.ownerId,
        name: params.name.trim(),
        mime: params.mime,
        size: params.size,
        receivedBytes: 0,
        chunks: [],
      })

      return { uploadId }
    },

    async [METHOD_PUSH_CHUNK](params) {
      check(params, {
        uploadId: String,
        chunk: Match.Any,
      })

      const session = requireSessionOwner(Meteor, params.uploadId, this.userId)
      const chunkBytes = toChunkBytes(Meteor, params.chunk)

      session.chunks.push(chunkBytes)
      session.receivedBytes += chunkBytes.byteLength

      if (session.receivedBytes > session.size) {
        uploadSessions.delete(session.uploadId)
        throw new Meteor.Error('file-too-large', 'Received more bytes than nexusFiles.start declared')
      }
    },

    async [METHOD_FINISH](params) {
      check(params, { uploadId: String })

      const session = requireSessionOwner(Meteor, params.uploadId, this.userId)

      if (session.receivedBytes !== session.size) {
        uploadSessions.delete(session.uploadId)
        throw new Meteor.Error(
          'upload-incomplete',
          `Received ${session.receivedBytes} bytes but expected ${session.size}`,
        )
      }

      const combinedBytes = concatChunks(session.chunks, session.size)
      uploadSessions.delete(session.uploadId)

      const gridFsId = await storageAdapter.write({
        filename: session.name,
        mime: session.mime,
        streamOrBuffer: combinedBytes,
      })

      const fileId = Random.id()
      const document = {
        _id: fileId,
        ownerType: session.ownerType,
        ownerId: session.ownerId,
        name: session.name,
        mime: session.mime,
        size: session.size,
        storage: STORAGE_KIND,
        gridFsId,
        uploadedBy: session.userId ?? null,
        createdAt: new Date(),
      }

      await insertDocument(filesCollection, document)
      return document
    },

    async [METHOD_REMOVE](params) {
      check(params, { fileId: String })

      const fileDocument = await findDocument(filesCollection, params.fileId)
      if (!fileDocument) {
        throw new Meteor.Error('file-not-found', 'No nexus_files document for that id')
      }

      const owner = requireRegisteredOwner(Meteor, fileDocument.ownerType)
      const userId = requireCaller(Meteor, this.userId, owner)
      await requireOwnerRole(Meteor, Roles, userId, owner, owner.roles.remove)

      // Blob first so a failed metadata delete can be retried without leaving a live file.
      await storageAdapter.remove(fileDocument.gridFsId)
      await removeDocument(filesCollection, params.fileId)
      return { removed: true, fileId: params.fileId }
    },
  })
}

export async function userHasRole(Roles, userId, role) {
  return Roles.userIsInRoleAsync(userId, role)
}

function requireCaller(Meteor, userId, owner) {
  if (owner.allowAnonymous) {
    return userId ?? null
  }
  if (!userId) {
    throw new Meteor.Error('not-logged-in', 'You must be logged in to use nexusFiles')
  }
  return userId
}

function requireRegisteredOwner(Meteor, ownerType) {
  const owner = getRegisteredOwner(ownerType)
  if (!owner) {
    throw new Meteor.Error('unknown-owner-type', `Owner type "${ownerType}" is not registered`)
  }
  return owner
}

async function requireOwnerRole(Meteor, Roles, userId, owner, role) {
  if (owner.allowAnonymous) {
    return
  }
  const allowed = await userHasRole(Roles, userId, role)
  if (!allowed) {
    throw new Meteor.Error('not-authorized', `Missing role ${role}`)
  }
}

async function requireParentExists(Meteor, collection, ownerId) {
  const parent = await findDocument(collection, ownerId)
  if (!parent) {
    throw new Meteor.Error('parent-not-found', 'Upload is only allowed after the parent document exists')
  }
}

function rejectInvalidFile(Meteor, { name, mime, size }) {
  if (!name || !name.trim()) {
    throw new Meteor.Error('invalid-name', 'File name is required')
  }
  if (!mime) {
    throw new Meteor.Error('invalid-mime', 'Empty MIME type is not allowed')
  }
  if (!ALLOWED_MIME_TYPES.includes(mime)) {
    throw new Meteor.Error('invalid-mime', `MIME type ${mime} is not on the allowlist`)
  }
  if (!Number.isFinite(size) || size <= 0) {
    throw new Meteor.Error('empty-file', 'File size must be greater than zero')
  }
  if (size > DEFAULT_MAX_BYTES) {
    throw new Meteor.Error('file-too-large', `File exceeds the ${DEFAULT_MAX_BYTES} byte limit`)
  }
}

function requireSessionOwner(Meteor, uploadId, userId) {
  const session = uploadSessions.get(uploadId)
  if (!session) {
    throw new Meteor.Error('unknown-upload', 'No in-memory upload session for this uploadId')
  }

  // Anonymous sessions are bound to uploadId only. Logged-in sessions stay user-bound.
  if (session.userId == null) {
    return session
  }
  if (session.userId !== userId) {
    throw new Meteor.Error('unknown-upload', 'No in-memory upload session for this user')
  }
  return session
}

function toChunkBytes(Meteor, chunk) {
  if (chunk instanceof Uint8Array) {
    return chunk
  }
  if (chunk && typeof chunk.byteLength === 'number' && chunk.buffer) {
    return new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength)
  }
  throw new Meteor.Error('invalid-chunk', 'Chunk must be binary data')
}

function concatChunks(chunks, totalSize) {
  const combined = new Uint8Array(totalSize)
  let offset = 0
  for (const chunk of chunks) {
    combined.set(chunk, offset)
    offset += chunk.byteLength
  }
  return combined
}

async function findDocument(collection, id) {
  return collection.findOneAsync(id)
}

async function insertDocument(collection, document) {
  return collection.insertAsync(document)
}

async function removeDocument(collection, id) {
  return collection.removeAsync(id)
}
