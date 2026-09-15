/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * GovRN GridFS HTTP and DDP upload against a real Meteor server
 */
import assert from 'node:assert/strict'
import { Meteor } from 'meteor/meteor'
import { MongoInternals } from 'meteor/mongo'
import { WebApp } from 'meteor/webapp'
import { registerNexusFiles } from '/imports/api/nexusFiles.js'
import {
  DEMO_MANY_IMAGES_ID,
  DEMO_MANY_DOC_ID,
  DEMO_ONE_AVATAR_ID,
  DEMO_ONE_DOC_ID,
  FilesDemoParents,
  seedFilesDemoParents,
} from '/imports/api/filesDemoParents.js'

const METHOD_START = 'nexusFiles.start'
const METHOD_PUSH_CHUNK = 'nexusFiles.pushChunk'
const METHOD_FINISH = 'nexusFiles.finish'
const METHOD_REMOVE = 'nexusFiles.remove'

function filesUrl(fileId) {
  const address = WebApp.httpServer.address()
  const port = typeof address === 'object' && address ? address.port : 3000
  return `http://127.0.0.1:${port}/nexus-files/${encodeURIComponent(fileId)}`
}

async function ensureFilesRuntime() {
  try {
    registerNexusFiles({ MongoInternals, WebApp })
  } catch (error) {
    if (!String(error.message).includes('already called')) {
      throw error
    }
  }
  await seedFilesDemoParents()
}

describe('GovRN files runtime', function () {
  this.timeout(30000)

  before(async function () {
    await new Promise((resolve) => Meteor.startup(resolve))
    await ensureFilesRuntime()
  })

  it('seeds every demo parent used by /files-test', async function () {
    const ids = [DEMO_ONE_DOC_ID, DEMO_ONE_AVATAR_ID, DEMO_MANY_DOC_ID, DEMO_MANY_IMAGES_ID]
    for (const parentId of ids) {
      const parent = await FilesDemoParents.findOneAsync(parentId)
      assert.ok(parent, `expected demo parent ${parentId}`)
    }
  })

  it('accepts an anonymous nexusFiles.start for the demo owner', async function () {
    const payload = Buffer.from('probe')
    const started = await Meteor.callAsync(METHOD_START, {
      ownerType: 'demo',
      ownerId: DEMO_MANY_IMAGES_ID,
      name: 'probe.txt',
      mime: 'text/plain',
      size: payload.byteLength,
    })
    assert.ok(started.uploadId, 'start must return an uploadId')
  })

  it('returns 404 for a missing /nexus-files id', async function () {
    const response = await fetch(filesUrl('does-not-exist'))
    const body = await response.text()
    assert.equal(response.status, 404)
    assert.match(body, /File not found/)
  })

  it('uploads through DDP then serves the same bytes over HTTP GET', async function () {
    const payload = Buffer.from('hello nexus runtime')
    const started = await Meteor.callAsync(METHOD_START, {
      ownerType: 'demo',
      ownerId: DEMO_MANY_IMAGES_ID,
      name: 'runtime-probe.txt',
      mime: 'text/plain',
      size: payload.byteLength,
    })

    await Meteor.callAsync(METHOD_PUSH_CHUNK, {
      uploadId: started.uploadId,
      chunk: payload,
    })

    const document = await Meteor.callAsync(METHOD_FINISH, { uploadId: started.uploadId })
    assert.ok(document._id)
    assert.equal(document.size, payload.byteLength)
    assert.match(document.gridFsId, /^[a-fA-F0-9]{24}$/)

    const response = await fetch(filesUrl(document._id))
    const body = await response.text()
    assert.equal(response.status, 200)
    assert.equal(body, 'hello nexus runtime')
    assert.match(response.headers.get('content-type') || '', /text\/plain/)

    await Meteor.callAsync(METHOD_REMOVE, { fileId: document._id })
  })
})
