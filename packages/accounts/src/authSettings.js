/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Read public.accounts and server-only oauth from Meteor.settings
 */
import { ADMIN_ROLES } from '@nexus/setup'
import { DEFAULT_SELF_REGISTER_ROLES } from './constants.js'
import { isAssignableRole } from './catalog.js'

export function readPublicAccounts(Meteor) {
  const raw = Meteor.settings?.public?.accounts
  const heroImage =
    raw && typeof raw.heroImage === 'string' ? raw.heroImage.trim() : ''
  return {
    selfRegister: Boolean(raw?.selfRegister),
    selfRegisterRoles: readSelfRegisterRoles(Meteor, raw?.selfRegisterRoles),
    heroImage,
    prefillDemo: Boolean(Meteor.settings?.public?.devSeedAdmin),
  }
}

export function readConfiguredProviders(Meteor) {
  const oauth = Meteor.settings?.oauth
  return {
    google: hasPair(oauth?.google?.clientId, oauth?.google?.secret),
    facebook: hasPair(oauth?.facebook?.appId, oauth?.facebook?.secret),
  }
}

export function readOauthCredentials(Meteor) {
  const oauth = Meteor.settings?.oauth
  const google = oauth?.google
  const facebook = oauth?.facebook
  return {
    google: hasPair(google?.clientId, google?.secret)
      ? { clientId: String(google.clientId).trim(), secret: String(google.secret).trim() }
      : null,
    facebook: hasPair(facebook?.appId, facebook?.secret)
      ? { appId: String(facebook.appId).trim(), secret: String(facebook.secret).trim() }
      : null,
  }
}

function readSelfRegisterRoles(Meteor, raw) {
  const names = Array.isArray(raw) && raw.length > 0 ? raw : DEFAULT_SELF_REGISTER_ROLES
  const unique = []
  for (const item of names) {
    if (typeof item !== 'string' || !item.trim()) {
      continue
    }
    const name = item.trim()
    if (ADMIN_ROLES.includes(name)) {
      throw new Meteor.Error(
        'invalid-self-register-role',
        `selfRegisterRoles cannot include ${name}`,
      )
    }
    if (!isAssignableRole(name)) {
      throw new Meteor.Error(
        'invalid-self-register-role',
        `Role ${name} is not in a registered catalog`,
      )
    }
    if (!unique.includes(name)) {
      unique.push(name)
    }
  }
  if (unique.length === 0) {
    throw new Meteor.Error(
      'invalid-self-register-role',
      'selfRegisterRoles must list at least one catalog role',
    )
  }
  return unique
}

function hasPair(id, secret) {
  return typeof id === 'string' && id.trim() && typeof secret === 'string' && secret.trim()
}
