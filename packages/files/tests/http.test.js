/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * HTTP GET /nexus-files/:fileId path parse and status codes
 */
import { createHash } from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'
import { registerDownloadRoute } from '../src/http.js'
import { hashLoginToken, LOGIN_COOKIE_NAME } from '../src/httpAuth.js'
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

function createRoute({ filesCollection, storageAdapter, Meteor, Roles } = {}) {
  let handler
  registerDownloadRoute({
    WebApp: {
      connectHandlers: {
        use(fn) {
          handler = fn
        },
      },
    },
    Meteor: Meteor ?? { users: { findOneAsync: async () => null } },
    Roles: Roles ?? { userIsInRoleAsync: async () => false },
    filesCollection: filesCollection ?? { findOneAsync: async () => null },
    storageAdapter: storageAdapter ?? { read: async () => ({ on() {}, pipe() {} }) },
  })
  return handler
}

function cookieForToken(token) {
  return `${LOGIN_COOKIE_NAME}=${encodeURIComponent(token)}`
}

function signedInMeteor(userId, token) {
  const hashedToken = hashLoginToken(token)
  return {
    users: {
      findOneAsync: async (selector) => {
        if (selector['services.resume.loginTokens.hashedToken'] === hashedToken) {
          return { _id: userId }
        }
        return null
      },
    },
  }
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

  it('returns 401 when a product owner has no resume cookie', async () => {
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
    handler({ method: 'GET', url: '/nexus-files/file-1', headers: {} }, res, vi.fn())
    await vi.waitFor(() => expect(res.statusCode).toBe(401))
  })

  it('returns 403 when the caller lacks the download role', async () => {
    defineOwner({
      type: 'http-auth-forbidden',
      collection: { findOneAsync: async () => ({ _id: 'parent' }) },
      allowAnonymous: false,
      roles: { upload: 'u', download: 'files.secret.download', remove: 'r' },
    })
    const token = 'resume-token-forbidden'
    const handler = createRoute({
      Meteor: signedInMeteor('user-1', token),
      Roles: { userIsInRoleAsync: async () => false },
      filesCollection: {
        findOneAsync: async () => ({
          _id: 'file-forbidden',
          ownerType: 'http-auth-forbidden',
          name: 'secret.pdf',
          mime: 'application/pdf',
          size: 4,
        }),
      },
    })
    const res = createResponse()
    handler(
      { method: 'GET', url: '/nexus-files/file-forbidden', headers: { cookie: cookieForToken(token) } },
      res,
      vi.fn(),
    )
    await vi.waitFor(() => expect(res.statusCode).toBe(403))
  })

  it('returns 200 when the caller has the download role', async () => {
    defineOwner({
      type: 'http-auth-allowed',
      collection: { findOneAsync: async () => ({ _id: 'parent' }) },
      allowAnonymous: false,
      roles: { upload: 'u', download: 'files.books.download', remove: 'r' },
    })
    const token = 'resume-token-ok'
    const handler = createRoute({
      Meteor: signedInMeteor('user-2', token),
      Roles: {
        userIsInRoleAsync: async (userId, role) => userId === 'user-2' && role === 'files.books.download',
      },
      filesCollection: {
        findOneAsync: async () => ({
          _id: 'file-ok',
          ownerType: 'http-auth-allowed',
          name: 'cover.png',
          mime: 'image/png',
          size: 4,
          gridFsId: '6aa917dddddddddddddddddd',
        }),
      },
      storageAdapter: {
        async read() {
          return {
            on() {},
            pipe(res) {
              res.end('png')
            },
          }
        },
      },
    })
    const res = createResponse()
    handler(
      { method: 'GET', url: '/nexus-files/file-ok', headers: { cookie: cookieForToken(token) } },
      res,
      vi.fn(),
    )
    await vi.waitFor(() => expect(res.statusCode).toBe(200))
    expect(res.headers['Content-Type']).toBe('image/png')
    expect(res.body).toBe('png')
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

describe('@nexus/files login token hash', () => {
  it('hashes the resume token the same way accounts-base does', () => {
    const token = 'plain-login-token'
    const expected = createHash('sha256').update(token).digest('base64')
    expect(hashLoginToken(token)).toBe(expected)
  })
})
