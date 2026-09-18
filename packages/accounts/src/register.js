/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Meteor API injection for @nexus/accounts
 *
 * Meteor 3 will not resolve meteor/* from this npm package. The app injects
 * Meteor, Accounts, Roles, check, and Match once at startup.
 */
import { ADMIN_ROLES } from '@nexus/setup'
import { allAssignableRoleNames } from './catalog.js'
import { registerMethods } from './methods.js'
import { registerPublications } from './publish.js'

const REQUIRED_ALWAYS = ['Meteor', 'Accounts', 'Roles', 'check', 'Match']

let meteorApis = null

export function registerWithMeteor(apis) {
  if (meteorApis) {
    throw new Error('Accounts.registerWithMeteor was already called')
  }

  assertRequiredApis(apis)
  meteorApis = apis

  if (!apis.Meteor.isServer) {
    return
  }

  registerMethods({
    Meteor: apis.Meteor,
    check: apis.check,
    Match: apis.Match,
    Roles: apis.Roles,
    Accounts: apis.Accounts,
    record: apis.record,
  })
  registerPublications({
    Meteor: apis.Meteor,
    Roles: apis.Roles,
  })
  registerSuspendLoginHook(apis.Accounts)
  apis.Meteor.startup(() => {
    void ensureRegisteredRoles(apis.Roles)
  })
}

export function getMeteorApis() {
  if (!meteorApis) {
    throw new Error('Call Accounts.registerWithMeteor before using @nexus/accounts')
  }
  return meteorApis
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

async function ensureRegisteredRoles(Roles) {
  const names = new Set([...ADMIN_ROLES, ...allAssignableRoleNames()])
  for (const role of names) {
    await Roles.createRoleAsync(role, { unlessExists: true })
  }
}

function registerSuspendLoginHook(Accounts) {
  if (typeof Accounts.validateLoginAttempt !== 'function') {
    return
  }
  Accounts.validateLoginAttempt((attempt) => {
    if (!attempt.allowed) {
      return false
    }
    if (attempt.user?.suspendedAt) {
      const Meteor = meteorApis.Meteor
      throw new Meteor.Error('account-suspended', 'This account is suspended')
    }
    return true
  })
}
