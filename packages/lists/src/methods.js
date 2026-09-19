/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * DDP insert / update / remove for nexus_lists
 *
 * listKey and code are immutable after insert. Only superadmin/admin write.
 * Title maps accept exactly the registered data locales.
 */
import { METHOD_INSERT, METHOD_REMOVE, METHOD_UPDATE, WRITE_ROLES } from './constants.js'

export function registerMethods({ Meteor, check, Match, Roles, listsCollection, locales }) {
  Meteor.methods({
    async [METHOD_INSERT](params) {
      check(params, {
        listKey: String,
        code: String,
        title: titleMatch(Match, locales, { defaultRequired: true }),
        sortOrder: Match.Maybe(Number),
        active: Match.Maybe(Boolean),
        meta: Match.Maybe(Object),
      })

      await requireWriteRole(Meteor, Roles, this.userId)

      const listKey = requireNonEmpty(Meteor, params.listKey, 'invalid-list-key', 'listKey is required')
      const code = requireNonEmpty(Meteor, params.code, 'invalid-code', 'code is required')
      const title = buildTitle(Meteor, params.title, locales)
      requirePlainMeta(Meteor, params.meta)

      const now = new Date()
      const document = {
        listKey,
        code,
        title,
        sortOrder: readSortOrder(Meteor, params.sortOrder),
        active: params.active !== false,
        createdAt: now,
        updatedAt: now,
      }

      if (params.meta !== undefined) {
        document.meta = params.meta
      }

      try {
        const insertedId = await listsCollection.insertAsync(document)
        return { ...document, _id: insertedId }
      } catch (error) {
        throwDuplicateOrRethrow(Meteor, error, listKey, code)
      }
    },

    async [METHOD_UPDATE](params) {
      check(params, {
        id: String,
        title: Match.Maybe(titleMatch(Match, locales, { defaultRequired: false })),
        sortOrder: Match.Maybe(Number),
        active: Match.Maybe(Boolean),
        meta: Match.Maybe(Object),
      })

      await requireWriteRole(Meteor, Roles, this.userId)

      const existing = await listsCollection.findOneAsync(params.id)
      if (!existing) {
        throw new Meteor.Error('list-item-not-found', 'No nexus_lists document for that id')
      }

      requirePlainMeta(Meteor, params.meta)

      const fields = { updatedAt: new Date() }
      if (params.title !== undefined) {
        fields.title = mergeTitle(Meteor, existing.title, params.title, locales)
      }
      if (params.sortOrder !== undefined) {
        fields.sortOrder = readSortOrder(Meteor, params.sortOrder)
      }
      if (params.active !== undefined) {
        fields.active = Boolean(params.active)
      }
      if (params.meta !== undefined) {
        fields.meta = params.meta
      }

      await listsCollection.updateAsync(params.id, { $set: fields })
      return listsCollection.findOneAsync(params.id)
    },

    async [METHOD_REMOVE](params) {
      check(params, { id: String })

      await requireWriteRole(Meteor, Roles, this.userId)

      const existing = await listsCollection.findOneAsync(params.id)
      if (!existing) {
        throw new Meteor.Error('list-item-not-found', 'No nexus_lists document for that id')
      }

      await listsCollection.removeAsync(params.id)
      return { removed: true, id: params.id }
    },
  })
}

function titleMatch(Match, locales, { defaultRequired }) {
  const pattern = {}
  for (const code of locales.data) {
    pattern[code] =
      defaultRequired && code === locales.defaultData ? String : Match.Maybe(String)
  }
  return pattern
}

async function requireWriteRole(Meteor, Roles, userId) {
  if (!userId) {
    throw new Meteor.Error('not-logged-in', 'You must be logged in to change nexus_lists')
  }

  const allowed = await Roles.userIsInRoleAsync(userId, WRITE_ROLES)
  if (!allowed) {
    throw new Meteor.Error('not-authorized', 'Only superadmin or admin can change nexus_lists')
  }
}

function requireNonEmpty(Meteor, value, errorName, message) {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  if (!trimmed) {
    throw new Meteor.Error(errorName, message)
  }
  return trimmed
}

function optionalLocale(value) {
  if (typeof value !== 'string') {
    return undefined
  }
  const trimmed = value.trim()
  return trimmed || undefined
}

function buildTitle(Meteor, title, locales) {
  const { data, defaultData } = locales
  const required = requireNonEmpty(
    Meteor,
    title[defaultData],
    'invalid-title',
    `title.${defaultData} is required`,
  )
  const next = { [defaultData]: required }

  for (const code of data) {
    if (code === defaultData) {
      continue
    }
    const value = optionalLocale(title[code])
    if (value) {
      next[code] = value
    }
  }
  return next
}

function mergeTitle(Meteor, current, patch, locales) {
  const { data, defaultData } = locales
  const merged = {}

  for (const code of data) {
    if (typeof current?.[code] === 'string' && current[code].trim()) {
      merged[code] = current[code].trim()
    }
  }

  for (const code of data) {
    if (patch[code] === undefined) {
      continue
    }
    if (code === defaultData) {
      merged[code] = requireNonEmpty(
        Meteor,
        patch[code],
        'invalid-title',
        `title.${defaultData} cannot be empty`,
      )
      continue
    }
    const value = optionalLocale(patch[code])
    if (value) {
      merged[code] = value
    } else {
      delete merged[code]
    }
  }

  if (!merged[defaultData]) {
    throw new Meteor.Error('invalid-title', `title.${defaultData} is required`)
  }
  return merged
}

function readSortOrder(Meteor, sortOrder) {
  if (sortOrder === undefined || sortOrder === null) {
    return 0
  }
  if (!Number.isFinite(sortOrder)) {
    throw new Meteor.Error('invalid-sort-order', 'sortOrder must be a finite number')
  }
  return sortOrder
}

function requirePlainMeta(Meteor, meta) {
  if (meta === undefined) {
    return
  }
  if (!isPlainObject(meta)) {
    throw new Meteor.Error('invalid-meta', 'meta must be a plain object')
  }
}

function isPlainObject(value) {
  if (value === null || typeof value !== 'object') {
    return false
  }
  if (Array.isArray(value)) {
    return false
  }
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function throwDuplicateOrRethrow(Meteor, error, listKey, code) {
  const message = String(error?.message || '')
  const isDuplicate =
    error?.code === 11000 ||
    error?.codeName === 'DuplicateKey' ||
    message.includes('E11000') ||
    message.includes('duplicate key')

  if (isDuplicate) {
    throw new Meteor.Error(
      'duplicate-code',
      `code "${code}" already exists on listKey "${listKey}"`,
    )
  }
  throw error
}
