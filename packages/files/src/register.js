/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Meteor API injection and server wiring
 *
 * Meteor 3 will not resolve meteor/* from this npm package. The app injects
 * Meteor, Mongo, Roles, and the rest once at startup.
 */
import { GRIDFS_BUCKET, METADATA_COLLECTION } from './constants.js'
import { GridFSAdapter } from './gridfs.js'
import { registerDownloadRoute } from './http.js'
import { registerMethods } from './methods.js'
import { registerPublication } from './publish.js'

const REQUIRED_ALWAYS = ['Meteor', 'Mongo', 'check', 'Match', 'Random', 'Roles']
const REQUIRED_SERVER = ['MongoInternals', 'WebApp']

let meteorApis = null
let filesCollection = null
let storageAdapter = null

export function registerWithMeteor(apis) {
  if (meteorApis) {
    throw new Error('Files.registerWithMeteor was already called')
  }

  assertRequiredApis(apis)
  meteorApis = apis
  filesCollection = new apis.Mongo.Collection(METADATA_COLLECTION)

  if (!apis.Meteor.isServer) {
    return
  }

  storageAdapter = createGridFSAdapter(apis.MongoInternals)
  registerMethods({
    Meteor: apis.Meteor,
    check: apis.check,
    Match: apis.Match,
    Random: apis.Random,
    Roles: apis.Roles,
    filesCollection,
    storageAdapter,
  })
  registerPublication({
    Meteor: apis.Meteor,
    check: apis.check,
    Roles: apis.Roles,
    filesCollection,
  })
  registerDownloadRoute({
    WebApp: apis.WebApp,
    Meteor: apis.Meteor,
    Roles: apis.Roles,
    filesCollection,
    storageAdapter,
  })

  apis.Meteor.startup(() => {
    ensureIndexes(filesCollection)
  })
}

export function getMeteorApis() {
  if (!meteorApis) {
    throw new Error('Call Files.registerWithMeteor before using @nexus/files')
  }
  return meteorApis
}

export function getFilesCollection() {
  if (!filesCollection) {
    throw new Error('Call Files.registerWithMeteor before reading nexus_files')
  }
  return filesCollection
}

export function getStorageAdapter() {
  if (!storageAdapter) {
    throw new Error('The GridFS adapter is only available after server registerWithMeteor')
  }
  return storageAdapter
}

function assertRequiredApis(apis) {
  if (!apis || typeof apis !== 'object') {
    throw new Error('registerWithMeteor requires an object of Meteor APIs')
  }

  const required = [...REQUIRED_ALWAYS]
  if (apis.Meteor?.isServer) {
    required.push(...REQUIRED_SERVER)
  }

  const missing = required.filter((name) => apis[name] == null)
  if (missing.length > 0) {
    throw new Error(`registerWithMeteor is missing: ${missing.join(', ')}`)
  }
}

function createGridFSAdapter(MongoInternals) {
  const GridFSBucket = MongoInternals.NpmModule?.GridFSBucket
  const ObjectId = MongoInternals.NpmModule?.ObjectId
  const db = MongoInternals.defaultRemoteCollectionDriver().mongo.db
  return new GridFSAdapter({ db, GridFSBucket, ObjectId, bucketName: GRIDFS_BUCKET })
}

function ensureIndexes(collection) {
  return Promise.all([
    collection.createIndexAsync({ ownerType: 1, ownerId: 1 }),
    collection.createIndexAsync({ uploadedBy: 1 }),
    collection.createIndexAsync({ createdAt: -1 }),
  ])
}
