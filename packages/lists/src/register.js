/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Meteor API injection and nexus_lists wiring
 *
 * Meteor 3 will not resolve meteor/* from this npm package. The app injects
 * Meteor, Mongo, check, Match, Roles, and normalized locales once at startup.
 */
import { METADATA_COLLECTION } from './constants.js'
import { registerMethods } from './methods.js'
import { registerPublication } from './publish.js'

const REQUIRED_ALWAYS = ['Meteor', 'Mongo', 'check', 'Match', 'Roles']

let meteorApis = null
let listsCollection = null

export function registerWithMeteor(apis) {
  if (meteorApis) {
    throw new Error('Lists.registerWithMeteor was already called')
  }

  assertRequiredApis(apis)
  assertLocales(apis.locales)
  meteorApis = apis
  listsCollection = new apis.Mongo.Collection(METADATA_COLLECTION)
  denyClientWrites(listsCollection)

  if (!apis.Meteor.isServer) {
    return
  }

  registerMethods({
    Meteor: apis.Meteor,
    check: apis.check,
    Match: apis.Match,
    Roles: apis.Roles,
    listsCollection,
    locales: apis.locales,
  })
  registerPublication({
    Meteor: apis.Meteor,
    check: apis.check,
    listsCollection,
  })

  apis.Meteor.startup(() => {
    void ensureIndexes(listsCollection)
  })
}

export function getMeteorApis() {
  if (!meteorApis) {
    throw new Error('Call Lists.registerWithMeteor before using @nexus/lists')
  }
  return meteorApis
}

export function getListsCollection() {
  if (!listsCollection) {
    throw new Error('Call Lists.registerWithMeteor before reading nexus_lists')
  }
  return listsCollection
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

function assertLocales(locales) {
  if (!locales || typeof locales !== 'object' || Array.isArray(locales)) {
    throw new Error('registerWithMeteor requires locales (defaultUi, ui, defaultData, data)')
  }
  if (!Array.isArray(locales.data) || locales.data.length === 0) {
    throw new Error('registerWithMeteor locales.data must be a non-empty array')
  }
  if (typeof locales.defaultData !== 'string' || !locales.data.includes(locales.defaultData)) {
    throw new Error('registerWithMeteor locales.defaultData must appear in locales.data')
  }
  // Same rule as normalizeLocales: English is the required stored key.
  if (locales.defaultData !== 'en') {
    throw new Error('registerWithMeteor locales.defaultData must be en')
  }
  if (!locales.data.includes('en')) {
    throw new Error('registerWithMeteor locales.data must include en')
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
    collection.createIndexAsync({ listKey: 1, code: 1 }, { unique: true }),
    collection.createIndexAsync({ listKey: 1, sortOrder: 1 }),
  ])
}
