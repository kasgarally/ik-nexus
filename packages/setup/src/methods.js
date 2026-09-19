/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * DDP setup.complete, setup.isComplete, and setup.update
 */
import {
  ADMIN_ROLES,
  ICON_MAX_BYTES,
  LOGO_MAX_BYTES,
  METHOD_COMPLETE,
  METHOD_IS_COMPLETE,
  METHOD_UPDATE,
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

    async [METHOD_UPDATE](params) {
      check(params, companyParamsShape(Match))
      await requireSetupAdmin(Meteor, Roles, this.userId)

      const existing = await setupCollection.findOneAsync(SETUP_DOC_ID)
      if (!existing) {
        throw new Meteor.Error('setup-not-complete', 'This application is not set up yet')
      }

      const company = readCompanyFields(Meteor, params)
      const $set = {
        ...company,
        updatedAt: new Date(),
      }
      const $unset = {}
      applyImageUpdate(Meteor, $set, $unset, 'logoDataUrl', params.logoDataUrl, LOGO_MAX_BYTES, 'logo')
      applyImageUpdate(Meteor, $set, $unset, 'iconDataUrl', params.iconDataUrl, ICON_MAX_BYTES, 'icon')

      // Built server-side from checked fields. Never pass a client modifier through.
      const modifier = { $set }
      if (Object.keys($unset).length > 0) {
        modifier.$unset = $unset
      }
      await setupCollection.updateAsync(SETUP_DOC_ID, modifier)
      return { ok: true }
    },

    async [METHOD_COMPLETE](params) {
      check(params, {
        ...companyParamsShape(Match),
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

      const company = readCompanyFields(Meteor, params)
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
        ...company,
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

function companyParamsShape(Match) {
  return {
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
  }
}

async function requireSetupAdmin(Meteor, Roles, userId) {
  if (!userId) {
    throw new Meteor.Error('not-logged-in', 'You must be signed in')
  }
  const allowed = await Roles.userIsInRoleAsync(userId, ADMIN_ROLES)
  if (!allowed) {
    throw new Meteor.Error('not-authorized', 'Only superadmin or admin can update company settings')
  }
}

function readCompanyFields(Meteor, params) {
  return {
    companyName: requireNonEmpty(Meteor, params.companyName, 'invalid-company', 'Company name is required'),
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
  }
}

function applyImageUpdate(Meteor, $set, $unset, field, value, maxBytes, fieldName) {
  if (value === undefined) {
    return
  }
  if (value === '' || value == null) {
    $unset[field] = 1
    return
  }
  $set[field] = readOptionalImageDataUrl(Meteor, value, maxBytes, fieldName)
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
