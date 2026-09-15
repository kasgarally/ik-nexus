/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Meteor API injection and append-only nexus_applog
 *
 * Meteor 3 will not resolve meteor/* from this npm package. The app injects
 * Meteor, Mongo, check, Match, and Roles once at startup.
 */
import { METADATA_COLLECTION } from './constants.js'
import { registerPublication } from './publish.js'

const REQUIRED_ALWAYS = ['Meteor', 'Mongo', 'check', 'Match', 'Roles']

let meteorApis = null
let applogCollection = null

export function registerWithMeteor(apis) {
  if (meteorApis) {
    throw new Error('Applog.registerWithMeteor was already called')
  }

  assertRequiredApis(apis)
  meteorApis = apis
  applogCollection = new apis.Mongo.Collection(METADATA_COLLECTION)
  denyClientWrites(applogCollection)

  if (!apis.Meteor.isServer) {
    return
  }

  registerPublication({
    Meteor: apis.Meteor,
    check: apis.check,
    Match: apis.Match,
    Roles: apis.Roles,
    applogCollection,
  })

  apis.Meteor.startup(() => {
    ensureIndexes(applogCollection)
  })
}

export function getMeteorApis() {
  if (!meteorApis) {
    throw new Error('Call Applog.registerWithMeteor before using @nexus/applog')
  }
  return meteorApis
}

export function getApplogCollection() {
  if (!applogCollection) {
    throw new Error('Call Applog.registerWithMeteor before reading nexus_applog')
  }
  return applogCollection
}

function assertRequiredApis(apis) {
  if (!apis || typeof apis !== 'object') {
    throw new Error('registerWithMeteor requires an object of Meteor APIs')
  }

  const missing = REQUIRED_ALWAYS.filter((name) => apis[name] == null)
  if (missing.length > 0) {
    throw new Error(`registerWithMeteor is missing: ${missing.join(', ')}`)
  }
}

function denyClientWrites(collection) {
  if (typeof collection.deny !== 'function') {
    return
  }

  collection.deny({
    insert() {
      return true
    },
    update() {
      return true
    },
    remove() {
      return true
    },
  })
}

function ensureIndexes(collection) {
  return Promise.all([
    collection.createIndexAsync({ collection: 1, docId: 1, createdAt: -1 }),
    collection.createIndexAsync({ actorId: 1, createdAt: -1 }),
    collection.createIndexAsync({ createdAt: -1 }),
  ])
}
