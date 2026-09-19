/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * DDP insert / update / remove for nexus_org
 *
 * Only superadmin/admin write. parentId must stay acyclic. Remove refuses
 * children and users whose profile.orgNodeId is this node or a descendant.
 */
import { METHOD_INSERT, METHOD_REMOVE, METHOD_UPDATE, WRITE_ROLES } from './constants.js'
import { buildTitle, mergeTitle, requireNonEmpty, titleMatch } from './locales.js'
import { walkAncestorIds, walkDescendantIds } from './tree.js'

export function registerMethods({ Meteor, check, Match, Roles, orgCollection, locales }) {
  Meteor.methods({
    async [METHOD_INSERT](params) {
      check(params, {
        parentId: Match.Maybe(Match.OneOf(String, null)),
        type: String,
        title: titleMatch(Match, locales, { defaultRequired: true }),
        sortOrder: Match.Maybe(Number),
        active: Match.Maybe(Boolean),
      })

      await requireWriteRole(Meteor, Roles, this.userId)

      const type = requireNonEmpty(Meteor, params.type, 'invalid-type', 'type is required')
      const title = buildTitle(Meteor, params.title, locales)
      const parentId = await readParentId(Meteor, orgCollection, params.parentId)

      const now = new Date()
      const document = {
        parentId,
        type,
        title,
        sortOrder: readSortOrder(Meteor, params.sortOrder),
        active: params.active !== false,
        createdAt: now,
        updatedAt: now,
      }

      const insertedId = await orgCollection.insertAsync(document)
      return { ...document, _id: insertedId }
    },

    async [METHOD_UPDATE](params) {
      check(params, {
        id: String,
        parentId: Match.Maybe(Match.OneOf(String, null)),
        type: Match.Maybe(String),
        title: Match.Maybe(titleMatch(Match, locales, { defaultRequired: false })),
        sortOrder: Match.Maybe(Number),
        active: Match.Maybe(Boolean),
      })

      await requireWriteRole(Meteor, Roles, this.userId)

      const existing = await orgCollection.findOneAsync(params.id)
      if (!existing) {
        throw new Meteor.Error('org-node-not-found', 'No nexus_org document for that id')
      }

      const fields = { updatedAt: new Date() }
      if (params.parentId !== undefined) {
        fields.parentId = await readParentId(Meteor, orgCollection, params.parentId, params.id)
      }
      if (params.type !== undefined) {
        fields.type = requireNonEmpty(Meteor, params.type, 'invalid-type', 'type is required')
      }
      if (params.title !== undefined) {
        fields.title = mergeTitle(Meteor, existing.title, params.title, locales)
      }
      if (params.sortOrder !== undefined) {
        fields.sortOrder = readSortOrder(Meteor, params.sortOrder)
      }
      if (params.active !== undefined) {
        fields.active = Boolean(params.active)
      }

      await orgCollection.updateAsync(params.id, { $set: fields })
      return orgCollection.findOneAsync(params.id)
    },

    async [METHOD_REMOVE](params) {
      check(params, { id: String })

      await requireWriteRole(Meteor, Roles, this.userId)

      const existing = await orgCollection.findOneAsync(params.id)
      if (!existing) {
        throw new Meteor.Error('org-node-not-found', 'No nexus_org document for that id')
      }

      const child = await orgCollection.findOneAsync({ parentId: params.id })
      if (child) {
        throw new Meteor.Error('org-has-children', 'Remove child nodes before removing this org node')
      }

      const blockedIds = [params.id, ...(await walkDescendantIds(orgCollection, params.id))]
      const assignedUser = await Meteor.users.findOneAsync({
        'profile.orgNodeId': { $in: blockedIds },
      })
      if (assignedUser) {
        throw new Meteor.Error(
          'org-has-users',
          'Clear profile.orgNodeId on assigned users before removing this org node',
        )
      }

      await orgCollection.removeAsync(params.id)
      return { removed: true, id: params.id }
    },
  })
}

async function requireWriteRole(Meteor, Roles, userId) {
  if (!userId) {
    throw new Meteor.Error('not-logged-in', 'You must be logged in to change nexus_org')
  }

  const allowed = await Roles.userIsInRoleAsync(userId, WRITE_ROLES)
  if (!allowed) {
    throw new Meteor.Error('not-authorized', 'Only superadmin or admin can change nexus_org')
  }
}

async function readParentId(Meteor, orgCollection, parentId, movingId) {
  if (parentId === undefined || parentId === null || parentId === '') {
    return null
  }

  if (movingId && parentId === movingId) {
    throw new Meteor.Error('org-cycle', 'An org node cannot be its own parent')
  }

  const parent = await orgCollection.findOneAsync(parentId)
  if (!parent) {
    throw new Meteor.Error('org-parent-not-found', 'parentId must be an existing nexus_org id')
  }

  if (movingId) {
    const ancestors = await walkAncestorIds(orgCollection, parentId)
    if (ancestors.includes(movingId)) {
      throw new Meteor.Error('org-cycle', 'Cannot move an org node under one of its descendants')
    }
  }

  return parentId
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
