/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Fixed collection names, DDP names, and upload limits
 *
 * Names are opinionated like meteor-roles: every app uses the same
 * nexus_files / nexus_fs collections so storage is never renamed per product.
 */

export const METADATA_COLLECTION = 'nexus_files'
export const GRIDFS_BUCKET = 'nexus_fs'
export const STORAGE_KIND = 'gridfs'

export const DEFAULT_MAX_BYTES = 25 * 1024 * 1024
export const DEFAULT_CHUNK_BYTES = 256 * 1024

export const ALLOWED_MIME_TYPES = Object.freeze([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'text/plain',
  'text/csv',
])

export const METHOD_START = 'nexusFiles.start'
export const METHOD_PUSH_CHUNK = 'nexusFiles.pushChunk'
export const METHOD_FINISH = 'nexusFiles.finish'
export const METHOD_REMOVE = 'nexusFiles.remove'
export const PUBLICATION_FOR_OWNER = 'nexusFiles.forOwner'
