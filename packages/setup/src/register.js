/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Meteor API injection and nexus_setup wiring
 *
 * Meteor 3 will not resolve meteor/* from this npm package. The app injects
 * Meteor, Mongo, check, Match, Roles, and Accounts once at startup.
 */
import { METADATA_COLLECTION } from './constants.js'
import { registerMethods } from './methods.js'
import { registerPublication } from './publish.js'

const REQUIRED_ALWAYS = ['Meteor', 'Mongo', 'check', 'Match', 'Roles', 'Accounts']

let meteorApis = null
let setupCollection = null

export function registerWithMeteor(apis) {
  if (meteorApis) {
    throw new Error('Setup.registerWithMeteor was already called')
  }

  assertRequiredApis(apis)
  meteorApis = apis
  setupCollection = new apis.Mongo.Collection(METADATA_COLLECTION)
  denyClientWrites(setupCollection)

  if (!apis.Meteor.isServer) {
    return
  }

  registerMethods({
    Meteor: apis.Meteor,
    check: apis.check,
    Match: apis.Match,
    Roles: apis.Roles,
    Accounts: apis.Accounts,
    setupCollection,
    runAsSystem: apis.runAsSystem,
  })
  registerPublication({
    Meteor: apis.Meteor,
    setupCollection,
  })

  apis.Meteor.startup(() => {
    void ensureIndexes(setupCollection)
  })
}

export function getMeteorApis() {
  if (!meteorApis) {
    throw new Error('Call Setup.registerWithMeteor before using @nexus/setup')
  }
  return meteorApis
}

export function getSetupCollection() {
  if (!setupCollection) {
    throw new Error('Call Setup.registerWithMeteor before reading nexus_setup')
  }
  return setupCollection
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
  return collection.createIndexAsync({ installedAt: 1 })
}
