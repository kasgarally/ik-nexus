/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Meteor API injection and nexus_org wiring
 *
 * Meteor 3 will not resolve meteor/* from this npm package. The app injects
 * Meteor, Mongo, check, Match, Roles, and normalized locales once at startup.
 */
import { METADATA_COLLECTION } from './constants.js'
import { registerMethods } from './methods.js'
import { registerPublication } from './publish.js'

const REQUIRED_ALWAYS = ['Meteor', 'Mongo', 'check', 'Match', 'Roles']

let meteorApis = null
let orgCollection = null

export function registerWithMeteor(apis) {
  if (meteorApis) {
    throw new Error('Org.registerWithMeteor was already called')
  }

  assertRequiredApis(apis)
  assertLocales(apis.locales)
  meteorApis = apis
  orgCollection = new apis.Mongo.Collection(METADATA_COLLECTION)
  denyClientWrites(orgCollection)

  if (!apis.Meteor.isServer) {
    return
  }

  registerMethods({
    Meteor: apis.Meteor,
    check: apis.check,
    Match: apis.Match,
    Roles: apis.Roles,
    orgCollection,
    locales: apis.locales,
  })
  registerPublication({
    Meteor: apis.Meteor,
    orgCollection,
  })

  apis.Meteor.startup(() => {
    void ensureIndexes(orgCollection)
  })
}

export function getMeteorApis() {
  if (!meteorApis) {
    throw new Error('Call Org.registerWithMeteor before using @nexus/org')
  }
  return meteorApis
}

export function getOrgCollection() {
  if (!orgCollection) {
    throw new Error('Call Org.registerWithMeteor before reading nexus_org')
  }
  return orgCollection
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
    collection.createIndexAsync({ parentId: 1, sortOrder: 1 }),
    collection.createIndexAsync({ type: 1 }),
  ])
}
