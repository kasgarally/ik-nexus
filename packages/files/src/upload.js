/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Client chunked upload helper (no Vue)
 *
 * Future @nexus/ui widgets will call this. It only speaks DDP methods.
 */
import { DEFAULT_CHUNK_BYTES, METHOD_FINISH, METHOD_PUSH_CHUNK, METHOD_START } from './constants.js'
import { getMeteorApis } from './register.js'

export async function upload({
  ownerType,
  ownerId,
  file,
  name,
  mime,
  chunkBytes = DEFAULT_CHUNK_BYTES,
}) {
  const { Meteor } = getMeteorApis()
  const payload = await readUploadPayload({ file, name, mime })

  const { uploadId } = await Meteor.callAsync(METHOD_START, {
    ownerType,
    ownerId,
    name: payload.name,
    mime: payload.mime,
    size: payload.size,
  })

  for (let offset = 0; offset < payload.bytes.byteLength; offset += chunkBytes) {
    const end = Math.min(offset + chunkBytes, payload.bytes.byteLength)
    const chunk = payload.bytes.subarray(offset, end)
    await Meteor.callAsync(METHOD_PUSH_CHUNK, { uploadId, chunk })
  }

  return Meteor.callAsync(METHOD_FINISH, { uploadId })
}

async function readUploadPayload({ file, name, mime }) {
  if (isBrowserFile(file)) {
    const buffer = await file.arrayBuffer()
    return {
      name: name || file.name,
      mime: mime || file.type,
      size: file.size,
      bytes: new Uint8Array(buffer),
    }
  }

  if (file instanceof Uint8Array) {
    if (!name || !mime) {
      throw new Error('Files.upload requires name and mime when file is a Uint8Array')
    }
    return {
      name,
      mime,
      size: file.byteLength,
      bytes: file,
    }
  }

  throw new Error('Files.upload expects a File or a Uint8Array')
}

function isBrowserFile(file) {
  return typeof File !== 'undefined' && file instanceof File
}
