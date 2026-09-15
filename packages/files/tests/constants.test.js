/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * MIME allowlists and download path stay stable
 */
import { describe, expect, it } from 'vitest'
import {
  ALLOWED_MIME_TYPES,
  DOCUMENT_MIME_TYPES,
  DOWNLOAD_PATH_PREFIX,
  IMAGE_MIME_TYPES,
  METADATA_COLLECTION,
  GRIDFS_BUCKET,
} from '../src/constants.js'

describe('@nexus/files constants', () => {
  it('uses the opinionated nexus_files and nexus_fs names', () => {
    expect(METADATA_COLLECTION).toBe('nexus_files')
    expect(GRIDFS_BUCKET).toBe('nexus_fs')
  })

  it('exposes HTTP downloads under /nexus-files', () => {
    expect(DOWNLOAD_PATH_PREFIX).toBe('/nexus-files')
  })

  it('includes png jpeg gif and webp in the image allowlist', () => {
    expect(IMAGE_MIME_TYPES).toEqual([
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/webp',
    ])
  })

  it('includes pdf office txt and csv in the document allowlist', () => {
    expect(DOCUMENT_MIME_TYPES).toContain('application/pdf')
    expect(DOCUMENT_MIME_TYPES).toContain('text/plain')
    expect(DOCUMENT_MIME_TYPES).toContain('text/csv')
  })

  it('joins documents and images into ALLOWED_MIME_TYPES', () => {
    for (const mime of IMAGE_MIME_TYPES) {
      expect(ALLOWED_MIME_TYPES).toContain(mime)
    }
    for (const mime of DOCUMENT_MIME_TYPES) {
      expect(ALLOWED_MIME_TYPES).toContain(mime)
    }
  })
})
