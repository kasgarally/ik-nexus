/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Meteor API injection and nexus_actions wiring
 *
 * Meteor 3 will not resolve meteor/* from this npm package. The app injects
 * Meteor, Mongo, check, Match, and normalized locales once at startup.
 */
import { ACTIONS_COLLECTION, STATUS_COLLECTION } from './constants.js'
import { registerMethods } from './methods.js'
import { registerPublications } from './publish.js'

const REQUIRED_ALWAYS = ['Meteor', 'Mongo', 'check', 'Match']

let meteorApis = null
let actionsCollection = null
let statusCollection = null

export function registerWithMeteor(apis) {
  if (meteorApis) {
    throw new Error('Actions.registerWithMeteor was already called')
  }

  assertRequiredApis(apis)
  assertLocales(apis.locales)
  meteorApis = apis
  actionsCollection = new apis.Mongo.Collection(ACTIONS_COLLECTION)
  statusCollection = new apis.Mongo.Collection(STATUS_COLLECTION)
  denyClientWrites(actionsCollection)
  denyClientWrites(statusCollection)

  if (!apis.Meteor.isServer) {
    return
  }

  registerMethods({
    Meteor: apis.Meteor,
    check: apis.check,
    Match: apis.Match,
    actionsCollection,
    statusCollection,
    locales: apis.locales,
  })
  registerPublications({
    Meteor: apis.Meteor,
    check: apis.check,
    actionsCollection,
    statusCollection,
  })

  apis.Meteor.startup(() => {
    void ensureIndexes(actionsCollection, statusCollection)
  })
}

export function getMeteorApis() {
  if (!meteorApis) {
    throw new Error('Call Actions.registerWithMeteor before using @nexus/actions')
  }
  return meteorApis
}

export function getActionsCollection() {
  if (!actionsCollection) {
    throw new Error('Call Actions.registerWithMeteor before reading nexus_actions')
  }
  return actionsCollection
}

export function getStatusCollection() {
  if (!statusCollection) {
    throw new Error('Call Actions.registerWithMeteor before reading nexus_action_status')
  }
  return statusCollection
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

function ensureIndexes(actions, statuses) {
  return Promise.all([
    actions.createIndexAsync({ ownerType: 1, ownerId: 1 }),
    actions.createIndexAsync({ byWhoUserId: 1 }),
    statuses.createIndexAsync({ actionId: 1 }),
    statuses.createIndexAsync({ asOf: 1 }),
  ])
}
