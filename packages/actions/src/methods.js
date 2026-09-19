/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * DDP methods for nexus_actions and nexus_action_status
 */
import { Files } from '@nexus/files'
import {
  METHOD_ACTIONS_INSERT,
  METHOD_ACTIONS_REMOVE,
  METHOD_ACTIONS_REMOVE_FOR_OWNER,
  METHOD_ACTIONS_UPDATE,
  METHOD_STATUS_INSERT,
  METHOD_STATUS_REMOVE,
  METHOD_STATUS_UPDATE,
} from './constants.js'
import { buildTitle, mergeTitle, titleMatch } from './locales.js'
import {
  canWriteAction,
  canWriteStatus,
  loadParent,
  parentAllowsWrite,
} from './owners.js'

export function registerMethods({
  Meteor,
  check,
  Match,
  actionsCollection,
  statusCollection,
  locales,
}) {
  Meteor.methods({
    async [METHOD_ACTIONS_INSERT](params) {
      check(params, {
        ownerType: String,
        ownerId: String,
        title: titleMatch(Match, locales, { defaultRequired: true }),
        description: titleMatch(Match, locales, { defaultRequired: true }),
        byWhoUserId: Match.Maybe(Match.OneOf(String, null)),
        byWhoLabel: Match.Maybe(Match.OneOf(String, null)),
        byWhen: Date,
      })

      const userId = requireLoggedIn(Meteor, this.userId)
      const { owner, parent } = await loadParent(Meteor, params.ownerType, params.ownerId)
      await requireParentWrite(Meteor, userId, owner, parent)

      const assignee = await readAssignee(Meteor, params)
      const now = new Date()
      const document = {
        ownerType: params.ownerType,
        ownerId: params.ownerId,
        title: buildTitle(Meteor, params.title, locales, 'title'),
        description: buildTitle(Meteor, params.description, locales, 'description'),
        byWhoUserId: assignee.byWhoUserId,
        byWhoLabel: assignee.byWhoLabel,
        byWhen: params.byWhen,
        completed: false,
        completedAt: null,
        completedBy: null,
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
      }

      const insertedId = await actionsCollection.insertAsync(document)
      return { ...document, _id: insertedId }
    },

    async [METHOD_ACTIONS_UPDATE](params) {
      check(params, {
        id: String,
        title: Match.Maybe(titleMatch(Match, locales, { defaultRequired: false })),
        description: Match.Maybe(titleMatch(Match, locales, { defaultRequired: false })),
        byWhoUserId: Match.Maybe(Match.OneOf(String, null)),
        byWhoLabel: Match.Maybe(Match.OneOf(String, null)),
        byWhen: Match.Maybe(Date),
        completed: Match.Maybe(Boolean),
      })

      const userId = requireLoggedIn(Meteor, this.userId)
      const existing = await requireAction(Meteor, actionsCollection, params.id)
      if (!(await canWriteAction(Meteor, userId, existing))) {
        throw new Meteor.Error('not-authorized', 'You cannot update this action')
      }

      const fields = { updatedAt: new Date() }
      if (params.title !== undefined) {
        fields.title = mergeTitle(Meteor, existing.title, params.title, locales, 'title')
      }
      if (params.description !== undefined) {
        fields.description = mergeTitle(
          Meteor,
          existing.description,
          params.description,
          locales,
          'description',
        )
      }
      if (params.byWhoUserId !== undefined || params.byWhoLabel !== undefined) {
        const assignee = await readAssignee(Meteor, {
          byWhoUserId: params.byWhoUserId !== undefined ? params.byWhoUserId : existing.byWhoUserId,
          byWhoLabel: params.byWhoLabel !== undefined ? params.byWhoLabel : existing.byWhoLabel,
        })
        fields.byWhoUserId = assignee.byWhoUserId
        fields.byWhoLabel = assignee.byWhoLabel
      }
      if (params.byWhen !== undefined) {
        fields.byWhen = params.byWhen
      }
      if (params.completed !== undefined) {
        applyCompleted(fields, existing, params.completed, userId)
      }

      await actionsCollection.updateAsync(params.id, { $set: fields })
      return actionsCollection.findOneAsync(params.id)
    },

    async [METHOD_ACTIONS_REMOVE](params) {
      check(params, { id: String })

      const userId = requireLoggedIn(Meteor, this.userId)
      const existing = await requireAction(Meteor, actionsCollection, params.id)
      if (!(await canWriteAction(Meteor, userId, existing))) {
        throw new Meteor.Error('not-authorized', 'You cannot remove this action')
      }

      await removeActionTree(existing, actionsCollection, statusCollection)
      return { removed: true, id: params.id }
    },

    async [METHOD_ACTIONS_REMOVE_FOR_OWNER](params) {
      check(params, { ownerType: String, ownerId: String })

      const userId = requireLoggedIn(Meteor, this.userId)
      const { owner, parent } = await loadParent(Meteor, params.ownerType, params.ownerId)
      await requireParentWrite(Meteor, userId, owner, parent)

      const rows = await actionsCollection
        .find({ ownerType: params.ownerType, ownerId: params.ownerId })
        .fetchAsync()
      for (const row of rows) {
        await removeActionTree(row, actionsCollection, statusCollection)
      }
      return { removed: rows.length }
    },

    async [METHOD_STATUS_INSERT](params) {
      check(params, {
        actionId: String,
        asOf: Date,
        description: titleMatch(Match, locales, { defaultRequired: true }),
      })

      const userId = requireLoggedIn(Meteor, this.userId)
      const actionDocument = await requireAction(Meteor, actionsCollection, params.actionId)
      if (!(await canWriteStatus(Meteor, userId, actionDocument))) {
        throw new Meteor.Error('not-authorized', 'You cannot add a status on this action')
      }

      const now = new Date()
      const document = {
        actionId: params.actionId,
        asOf: params.asOf,
        description: buildTitle(Meteor, params.description, locales, 'description'),
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
      }
      const insertedId = await statusCollection.insertAsync(document)
      return { ...document, _id: insertedId }
    },

    async [METHOD_STATUS_UPDATE](params) {
      check(params, {
        id: String,
        asOf: Match.Maybe(Date),
        description: Match.Maybe(titleMatch(Match, locales, { defaultRequired: false })),
      })

      const userId = requireLoggedIn(Meteor, this.userId)
      const existing = await requireStatus(Meteor, statusCollection, params.id)
      const actionDocument = await requireAction(Meteor, actionsCollection, existing.actionId)
      if (!(await canWriteStatus(Meteor, userId, actionDocument))) {
        throw new Meteor.Error('not-authorized', 'You cannot update this status')
      }

      const fields = { updatedAt: new Date() }
      if (params.asOf !== undefined) {
        fields.asOf = params.asOf
      }
      if (params.description !== undefined) {
        fields.description = mergeTitle(
          Meteor,
          existing.description,
          params.description,
          locales,
          'description',
        )
      }
      await statusCollection.updateAsync(params.id, { $set: fields })
      return statusCollection.findOneAsync(params.id)
    },

    async [METHOD_STATUS_REMOVE](params) {
      check(params, { id: String })

      const userId = requireLoggedIn(Meteor, this.userId)
      const existing = await requireStatus(Meteor, statusCollection, params.id)
      const actionDocument = await requireAction(Meteor, actionsCollection, existing.actionId)
      if (!(await canWriteStatus(Meteor, userId, actionDocument))) {
        throw new Meteor.Error('not-authorized', 'You cannot remove this status')
      }

      await removeStatusFiles(existing, actionDocument.ownerType)
      await statusCollection.removeAsync(params.id)
      return { removed: true, id: params.id }
    },
  })
}

function requireLoggedIn(Meteor, userId) {
  if (!userId) {
    throw new Meteor.Error('not-logged-in', 'You must be signed in')
  }
  return userId
}

async function requireParentWrite(Meteor, userId, owner, parent) {
  if (await parentAllowsWrite(userId, owner, parent)) {
    return
  }
  throw new Meteor.Error('not-authorized', 'You cannot change actions on this parent')
}

async function requireAction(Meteor, actionsCollection, id) {
  const document = await actionsCollection.findOneAsync(id)
  if (!document) {
    throw new Meteor.Error('action-not-found', 'No nexus_actions document for that id')
  }
  return document
}

async function requireStatus(Meteor, statusCollection, id) {
  const document = await statusCollection.findOneAsync(id)
  if (!document) {
    throw new Meteor.Error('action-status-not-found', 'No nexus_action_status document for that id')
  }
  return document
}

async function readAssignee(Meteor, params) {
  const userId = typeof params.byWhoUserId === 'string' ? params.byWhoUserId.trim() : ''
  const label = typeof params.byWhoLabel === 'string' ? params.byWhoLabel.trim() : ''

  if (userId) {
    const user = await Meteor.users.findOneAsync(userId)
    if (!user) {
      throw new Meteor.Error('assignee-not-found', 'byWhoUserId is not a user in this app')
    }
    const snapshot = user.profile?.name || user.emails?.[0]?.address || userId
    return { byWhoUserId: userId, byWhoLabel: label || snapshot }
  }

  if (!label) {
    throw new Meteor.Error('invalid-assignee', 'Assign a user or enter an external name')
  }
  return { byWhoUserId: null, byWhoLabel: label }
}

function applyCompleted(fields, existing, completed, userId) {
  const next = Boolean(completed)
  fields.completed = next
  if (next && !existing.completed) {
    fields.completedAt = new Date()
    fields.completedBy = userId
    return
  }
  if (!next && existing.completed) {
    fields.completedAt = null
    fields.completedBy = null
  }
}

async function removeActionTree(actionDocument, actionsCollection, statusCollection) {
  const statuses = await statusCollection.find({ actionId: actionDocument._id }).fetchAsync()
  for (const status of statuses) {
    await removeStatusFiles(status, actionDocument.ownerType)
    await statusCollection.removeAsync(status._id)
  }
  await removeOwnedFiles(`action.${actionDocument.ownerType}`, actionDocument._id)
  await actionsCollection.removeAsync(actionDocument._id)
}

async function removeStatusFiles(status, ownerType) {
  await removeOwnedFiles(`actionStatus.${ownerType}`, status._id)
}

async function removeOwnedFiles(ownerType, ownerId) {
  const files = await Files.collection.find({ ownerType, ownerId }).fetchAsync()
  for (const file of files) {
    await Files.remove(file._id)
  }
}
