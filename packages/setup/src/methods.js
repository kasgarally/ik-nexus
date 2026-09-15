/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * DDP setup.complete and setup.isComplete
 */
import {
  ADMIN_ROLES,
  ICON_MAX_BYTES,
  LOGO_MAX_BYTES,
  METHOD_COMPLETE,
  METHOD_IS_COMPLETE,
  MIN_PASSWORD_LENGTH,
  SETUP_DOC_ID,
} from './constants.js'
import { readOptionalImageDataUrl } from './images.js'

export function registerMethods({
  Meteor,
  check,
  Match,
  Roles,
  Accounts,
  setupCollection,
  runAsSystem,
}) {
  Meteor.methods({
    async [METHOD_IS_COMPLETE]() {
      const existing = await setupCollection.findOneAsync(SETUP_DOC_ID)
      return { complete: Boolean(existing) }
    },

    async [METHOD_COMPLETE](params) {
      check(params, {
        companyName: String,
        legalName: Match.Maybe(String),
        website: Match.Maybe(String),
        phone: Match.Maybe(String),
        email: Match.Maybe(String),
        address: Match.Maybe({
          line1: Match.Maybe(String),
          line2: Match.Maybe(String),
          city: Match.Maybe(String),
          region: Match.Maybe(String),
          postalCode: Match.Maybe(String),
          country: Match.Maybe(String),
        }),
        logoDataUrl: Match.Maybe(String),
        iconDataUrl: Match.Maybe(String),
        admin: {
          name: String,
          email: String,
          password: String,
        },
      })

      const existing = await setupCollection.findOneAsync(SETUP_DOC_ID)
      if (existing) {
        throw new Meteor.Error('setup-already-complete', 'This application is already set up')
      }

      const companyName = requireNonEmpty(Meteor, params.companyName, 'invalid-company', 'Company name is required')
      const adminName = requireNonEmpty(Meteor, params.admin.name, 'invalid-admin-name', 'Admin name is required')
      const adminEmail = requireNonEmpty(Meteor, params.admin.email, 'invalid-admin-email', 'Admin email is required')
      const password = params.admin.password || ''
      if (password.length < MIN_PASSWORD_LENGTH) {
        throw new Meteor.Error(
          'invalid-password',
          `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
        )
      }

      const logoDataUrl = readOptionalImageDataUrl(Meteor, params.logoDataUrl, LOGO_MAX_BYTES, 'logo')
      const iconDataUrl = readOptionalImageDataUrl(Meteor, params.iconDataUrl, ICON_MAX_BYTES, 'icon')

      for (const role of ADMIN_ROLES) {
        await Roles.createRoleAsync(role, { unlessExists: true })
      }

      const firstAdminUserId = await createPasswordUser(Accounts, {
        email: adminEmail,
        password,
        name: adminName,
      })
      await Roles.addUsersToRolesAsync(firstAdminUserId, ADMIN_ROLES)

      const now = new Date()
      const document = {
        _id: SETUP_DOC_ID,
        companyName,
        legalName: optionalText(params.legalName),
        website: optionalText(params.website),
        phone: optionalText(params.phone),
        email: optionalText(params.email),
        address: {
          line1: optionalText(params.address?.line1),
          line2: optionalText(params.address?.line2),
          city: optionalText(params.address?.city),
          region: optionalText(params.address?.region),
          postalCode: optionalText(params.address?.postalCode),
          country: optionalText(params.address?.country),
        },
        installedAt: now,
        meteorRelease: Meteor.release || null,
        nodeVersion: typeof process !== 'undefined' ? process.version : null,
        firstAdminUserId,
        createdAt: now,
        updatedAt: now,
      }

      if (logoDataUrl) {
        document.logoDataUrl = logoDataUrl
      }
      if (iconDataUrl) {
        document.iconDataUrl = iconDataUrl
      }

      try {
        // First-run has no logged-in user. Applog records SYSTEM / SYSTEM.
        await asSystem(runAsSystem, () => setupCollection.insertAsync(document))
      } catch (error) {
        throwDuplicateOrRethrow(Meteor, error)
      }

      return { ok: true }
    },
  })
}

function asSystem(runAsSystem, work) {
  if (typeof runAsSystem === 'function') {
    return runAsSystem(work)
  }
  return work()
}

function requireNonEmpty(Meteor, value, errorName, message) {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  if (!trimmed) {
    throw new Meteor.Error(errorName, message)
  }
  return trimmed
}

function optionalText(value) {
  if (typeof value !== 'string') {
    return ''
  }
  return value.trim()
}

async function createPasswordUser(Accounts, { email, password, name }) {
  const options = {
    email,
    password,
    profile: { name },
  }

  if (typeof Accounts.createUserAsync === 'function') {
    return Accounts.createUserAsync(options)
  }

  return Accounts.createUser(options)
}

function throwDuplicateOrRethrow(Meteor, error) {
  const message = String(error?.message || '')
  const isDuplicate =
    error?.code === 11000 ||
    error?.codeName === 'DuplicateKey' ||
    message.includes('E11000') ||
    message.includes('duplicate key')

  if (isDuplicate) {
    throw new Meteor.Error('setup-already-complete', 'This application is already set up')
  }
  throw error
}
