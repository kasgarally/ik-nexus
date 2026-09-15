/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Meteor API injection and server wiring
 *
 * Meteor 3 will not resolve meteor/* from this npm package. The app injects
 * Meteor, Mongo, Roles, and the rest once at startup.
 */
import { GRIDFS_BUCKET, METADATA_COLLECTION } from './constants.js'
import { GridFSAdapter } from './gridfs.js'
import { registerMethods } from './methods.js'
import { registerPublication } from './publish.js'

const REQUIRED_APIS = [
  'Meteor',
  'Mongo',
  'MongoInternals',
  'check',
  'Match',
  'Random',
  'Roles',
]

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

  const missing = REQUIRED_APIS.filter((name) => apis[name] == null)
  if (missing.length > 0) {
    throw new Error(`registerWithMeteor is missing: ${missing.join(', ')}`)
  }
}

function createGridFSAdapter(MongoInternals) {
  const GridFSBucket = MongoInternals.NpmModule?.GridFSBucket
  const db = MongoInternals.defaultRemoteCollectionDriver().mongo.db
  return new GridFSAdapter({ db, GridFSBucket, bucketName: GRIDFS_BUCKET })
}

function ensureIndexes(collection) {
  const rawCollection = collection.rawCollection()
  return Promise.all([
    rawCollection.createIndex({ ownerType: 1, ownerId: 1 }),
    rawCollection.createIndex({ uploadedBy: 1 }),
    rawCollection.createIndex({ createdAt: -1 }),
  ])
}
