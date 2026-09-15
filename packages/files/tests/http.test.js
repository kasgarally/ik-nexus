/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * HTTP GET /nexus-files/:fileId path parse and status codes
 */
import { describe, expect, it, vi } from 'vitest'
import { registerDownloadRoute } from '../src/http.js'
import { defineOwner } from '../src/owners.js'

function createResponse() {
  return {
    headersSent: false,
    statusCode: null,
    headers: null,
    body: '',
    writeHead(statusCode, headers) {
      this.statusCode = statusCode
      this.headers = headers
      this.headersSent = true
    },
    end(chunk) {
      if (chunk) {
        this.body += String(chunk)
      }
    },
  }
}

function createRoute({ filesCollection, storageAdapter } = {}) {
  let handler
  registerDownloadRoute({
    WebApp: {
      connectHandlers: {
        use(fn) {
          handler = fn
        },
      },
    },
    filesCollection: filesCollection ?? { findOneAsync: async () => null },
    storageAdapter: storageAdapter ?? { read: async () => ({ on() {}, pipe() {} }) },
  })
  return handler
}

describe('@nexus/files HTTP download route', () => {
  it('calls next when the path is not /nexus-files/:fileId', async () => {
    const handler = createRoute()
    const next = vi.fn()
    handler({ method: 'GET', url: '/other' }, createResponse(), next)
    expect(next).toHaveBeenCalledOnce()
  })

  it('calls next when the id contains a slash', async () => {
    const handler = createRoute()
    const next = vi.fn()
    handler({ method: 'GET', url: '/nexus-files/a/b' }, createResponse(), next)
    expect(next).toHaveBeenCalledOnce()
  })

  it('returns 404 when the metadata document is missing', async () => {
    const handler = createRoute()
    const res = createResponse()
    handler({ method: 'GET', url: '/nexus-files/missing-id' }, res, vi.fn())
    await vi.waitFor(() => expect(res.statusCode).toBe(404))
    expect(res.body).toContain('File not found')
  })

  it('returns 401 when the owner is not anonymous', async () => {
    defineOwner({
      type: 'http-auth-owner',
      collection: { findOneAsync: async () => ({ _id: 'parent' }) },
      allowAnonymous: false,
      roles: { upload: 'u', download: 'd', remove: 'r' },
    })
    const handler = createRoute({
      filesCollection: {
        findOneAsync: async () => ({
          _id: 'file-1',
          ownerType: 'http-auth-owner',
          name: 'secret.pdf',
          mime: 'application/pdf',
          size: 4,
        }),
      },
    })
    const res = createResponse()
    handler({ method: 'GET', url: '/nexus-files/file-1' }, res, vi.fn())
    await vi.waitFor(() => expect(res.statusCode).toBe(401))
  })

  it('returns 200 inline for an anonymous owner file', async () => {
    defineOwner({
      type: 'http-anon-owner',
      collection: { findOneAsync: async () => ({ _id: 'parent' }) },
      allowAnonymous: true,
      roles: { upload: 'u', download: 'd', remove: 'r' },
    })
    const chunks = []
    const handler = createRoute({
      filesCollection: {
        findOneAsync: async () => ({
          _id: 'file-2',
          ownerType: 'http-anon-owner',
          name: 'hello.txt',
          mime: 'text/plain',
          size: 5,
          gridFsId: '6aa917dddddddddddddddddd',
        }),
      },
      storageAdapter: {
        async read() {
          return {
            on() {},
            pipe(res) {
              chunks.push('hello')
              res.end('hello')
            },
          }
        },
      },
    })
    const res = createResponse()
    handler({ method: 'GET', url: '/nexus-files/file-2?inline=1' }, res, vi.fn())
    await vi.waitFor(() => expect(res.statusCode).toBe(200))
    expect(res.headers['Content-Type']).toBe('text/plain')
    expect(res.headers['Content-Disposition']).toContain('hello.txt')
    expect(res.body).toBe('hello')
    expect(chunks).toEqual(['hello'])
  })
})
