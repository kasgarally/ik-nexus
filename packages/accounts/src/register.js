/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Meteor API injection for @nexus/accounts
 *
 * Meteor 3 will not resolve meteor/* from this npm package. The app injects
 * Meteor, Accounts, Roles, check, and Match once at startup.
 */
import { ADMIN_ROLES } from '@nexus/setup'
import { allAssignableRoleNames } from './catalog.js'
import {
  readOauthCredentials,
  readPublicAccounts,
} from './authSettings.js'
import { registerMethods } from './methods.js'
import { registerPublications } from './publish.js'
import { addUserRoles, rolesForUserId } from './userAccounts.js'

const REQUIRED_ALWAYS = ['Meteor', 'Accounts', 'Roles', 'check', 'Match']

let meteorApis = null

export function registerWithMeteor(apis) {
  if (meteorApis) {
    throw new Error('Accounts.registerWithMeteor was already called')
  }

  assertRequiredApis(apis)
  meteorApis = apis

  configureClientAccountCreation(apis.Accounts)

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
  registerResetEmail(apis.Accounts, apis.Meteor)
  registerOauthNewUserGate(apis.Accounts, apis.Meteor)
  registerOauthCreateUser(apis.Accounts, apis.Meteor)
  registerOauthDefaultRoles(apis.Accounts, apis.Roles, apis.Meteor)
  apis.Meteor.startup(() => {
    void ensureRegisteredRoles(apis.Roles)
    void configureOauthServices(apis)
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

function configureClientAccountCreation(Accounts) {
  if (typeof Accounts.config !== 'function') {
    return
  }
  Accounts.config({ forbidClientAccountCreation: true })
}

function registerResetEmail(Accounts, Meteor) {
  if (Accounts.urls && typeof Accounts.urls === 'object') {
    Accounts.urls.resetPassword = (token) => Meteor.absoluteUrl(`reset-password/${token}`)
  }
  if (!Accounts.emailTemplates) {
    return
  }
  Accounts.emailTemplates.from = 'NEXUS <noreply@localhost>'
  Accounts.emailTemplates.resetPassword = {
    subject() {
      return 'Reset your password'
    },
    text(user, url) {
      const email = user?.emails?.[0]?.address || 'there'
      return `Hello ${email},\n\nReset your password:\n${url}\n\nIf you did not request this, ignore this email.\n`
    },
  }
}

function registerOauthNewUserGate(Accounts, Meteor) {
  if (typeof Accounts.validateNewUser !== 'function') {
    return
  }
  Accounts.validateNewUser((user) => {
    const oauth = isOauthUser(user)
    if (oauth && !readPublicAccounts(Meteor).selfRegister) {
      throw new Meteor.Error('self-register-disabled', 'Self-registration is disabled')
    }
    return true
  })
}

function registerOauthCreateUser(Accounts, Meteor) {
  if (typeof Accounts.onCreateUser !== 'function') {
    return
  }
  Accounts.onCreateUser((options, user) => {
    if (isOauthUser(user) && !readPublicAccounts(Meteor).selfRegister) {
      throw new Meteor.Error('self-register-disabled', 'Self-registration is disabled')
    }
    user.profile = options?.profile || user.profile || {}
    if (!user.profile.name) {
      user.profile.name = oauthDisplayName(user)
    }
    return user
  })
}

function oauthDisplayName(user) {
  return (
    user?.services?.google?.name ||
    user?.services?.facebook?.name ||
    user?.emails?.[0]?.address ||
    ''
  )
}

function registerOauthDefaultRoles(Accounts, Roles, Meteor) {
  if (typeof Accounts.onLogin !== 'function') {
    return
  }
  Accounts.onLogin((attempt) => {
    void assignOauthSelfRegisterRoles(Roles, Meteor, attempt?.user)
  })
}

async function assignOauthSelfRegisterRoles(Roles, Meteor, user) {
  if (!user?._id || !isOauthUser(user)) {
    return
  }
  const publicAccounts = readPublicAccounts(Meteor)
  if (!publicAccounts.selfRegister) {
    return
  }
  const existing = await rolesForUserId(Roles, user._id)
  if (Array.isArray(existing) && existing.length > 0) {
    return
  }
  await addUserRoles(Roles, user._id, publicAccounts.selfRegisterRoles)
}

function isOauthUser(user) {
  return Boolean(user?.services?.google || user?.services?.facebook)
}

async function configureOauthServices(apis) {
  const ServiceConfiguration = apis.ServiceConfiguration
  if (!ServiceConfiguration?.configurations) {
    return
  }
  const credentials = readOauthCredentials(apis.Meteor)
  if (credentials.google) {
    await upsertService(ServiceConfiguration, 'google', {
      clientId: credentials.google.clientId,
      secret: credentials.google.secret,
      loginStyle: 'popup',
    })
  }
  if (credentials.facebook) {
    await upsertService(ServiceConfiguration, 'facebook', {
      appId: credentials.facebook.appId,
      secret: credentials.facebook.secret,
      loginStyle: 'popup',
    })
  }
}

async function upsertService(ServiceConfiguration, service, fields) {
  const collection = ServiceConfiguration.configurations
  const selector = { service }
  const modifier = { $set: { service, ...fields } }
  if (typeof collection.upsertAsync === 'function') {
    await collection.upsertAsync(selector, modifier)
    return
  }
  collection.upsert(selector, modifier)
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
