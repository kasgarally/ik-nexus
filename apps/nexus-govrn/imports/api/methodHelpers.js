/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Shared DDP gates for sub-app methods (login, role, SimpleSchema)
 */
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/roles'
import SimpleSchemaModule from 'meteor/aldeed:simple-schema'

// Rspack/Meteor may expose the class as default, named, or the module itself.
export const SimpleSchema = readSimpleSchema(SimpleSchemaModule)

export function requireLoggedIn(userId, message = 'You must be signed in') {
  if (!userId) {
    throw new Meteor.Error('not-logged-in', message)
  }
  return userId
}

export async function requireRole(userId, role, message) {
  const allowed = await Roles.userIsInRoleAsync(userId, role)
  if (!allowed) {
    throw new Meteor.Error('not-authorized', message || `Missing role ${role}`)
  }
}

export function denyClientWrites(collection) {
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

export async function validateDocument(schema, params) {
  if (typeof schema?.clean !== 'function' || typeof schema?.validate !== 'function') {
    throw new Meteor.Error(
      'schema-unavailable',
      'Document schema is missing clean/validate — SimpleSchema did not load',
    )
  }

  let cleaned
  try {
    cleaned = await schema.clean({ ...params }, {
      filter: true,
      autoConvert: true,
      removeEmptyStrings: false,
      getAutoValues: true,
      trimStrings: true,
    })
  } catch (error) {
    throwValidationError(error)
  }

  try {
    await schema.validate(cleaned)
  } catch (error) {
    throwValidationError(error)
  }

  return cleaned
}

function throwValidationError(error) {
  const first = Array.isArray(error.details) ? error.details[0] : null
  const message = first?.message || error.reason || error.message || 'Invalid document'
  throw new Meteor.Error('validation-error', message, error.details)
}

function readSimpleSchema(exported) {
  if (typeof exported === 'function') {
    return exported
  }
  if (typeof exported?.default === 'function') {
    return exported.default
  }
  if (typeof exported?.SimpleSchema === 'function') {
    return exported.SimpleSchema
  }
  throw new Error('SimpleSchema is not a constructor — check meteor/aldeed:simple-schema')
}
