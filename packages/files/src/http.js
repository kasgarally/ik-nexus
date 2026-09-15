/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * HTTP GET so a new tab can stream a GridFS file
 *
 * WebApp is injected. This package never imports meteor/webapp.
 */
import { DOWNLOAD_PATH_PREFIX } from './constants.js'
import { getRegisteredOwner } from './owners.js'

export function registerDownloadRoute({ WebApp, filesCollection, storageAdapter }) {
  WebApp.connectHandlers.use((req, res, next) => {
    const fileId = readDownloadFileId(req)
    if (!fileId) {
      next()
      return
    }

    streamDownload({
      fileId,
      method: req.method,
      res,
      filesCollection,
      storageAdapter,
    }).catch((error) => {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
        res.end('Failed to read file')
      }
      console.error('@nexus/files download failed', error)
    })
  })
}

function readDownloadFileId(req) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return null
  }

  const pathOnly = String(req.url || '').split('?')[0]
  const prefix = `${DOWNLOAD_PATH_PREFIX}/`
  if (!pathOnly.startsWith(prefix)) {
    return null
  }

  const fileId = decodeURIComponent(pathOnly.slice(prefix.length))
  if (!fileId || fileId.includes('/')) {
    return null
  }

  return fileId
}

async function streamDownload({ fileId, method, res, filesCollection, storageAdapter }) {
  const fileDocument = await findDocument(filesCollection, fileId)
  if (!fileDocument) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('File not found')
    return
  }

  const owner = getRegisteredOwner(fileDocument.ownerType)
  // Authenticated HTTP download comes later with accounts. Anonymous owners are open.
  if (!owner?.allowAnonymous) {
    res.writeHead(401, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Authentication required')
    return
  }

  const headers = {
    'Content-Type': fileDocument.mime || 'application/octet-stream',
    'Content-Disposition': `inline; filename="${safeContentFilename(fileDocument.name)}"`,
    'Content-Length': String(fileDocument.size),
  }

  if (method === 'HEAD') {
    res.writeHead(200, headers)
    res.end()
    return
  }

  let downloadStream
  try {
    downloadStream = await storageAdapter.read(fileDocument.gridFsId)
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('File blob is missing')
    console.error('@nexus/files invalid gridFsId', error)
    return
  }

  res.writeHead(200, headers)
  downloadStream.on('error', (error) => {
    if (!res.headersSent) {
      const missing = String(error?.message ?? '').includes('FileNotFound')
      res.writeHead(missing ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' })
    }
    res.end()
    console.error('@nexus/files GridFS stream failed', error)
  })
  downloadStream.pipe(res)
}

function safeContentFilename(name) {
  return String(name || 'file').replace(/[\r\n"]/g, '_')
}

async function findDocument(collection, id) {
  return collection.findOneAsync(id)
}
