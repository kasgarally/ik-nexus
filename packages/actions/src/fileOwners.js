/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Register nexus_files owners for an action parent type
 *
 * Role strings are registry placeholders. authorize is the real gate:
 * parent canRead/canWrite or the action assignee.
 */
import { Files } from '@nexus/files'
import { canReadAction, canWriteStatus } from './owners.js'
import { getActionsCollection, getMeteorApis, getStatusCollection } from './register.js'

export function registerFileOwners(type) {
  const actionsCollection = getActionsCollection()
  const statusCollection = getStatusCollection()

  Files.defineOwner({
    type: `action.${type}`,
    collection: actionsCollection,
    roles: {
      upload: `files.action.${type}.upload`,
      download: `files.action.${type}.download`,
      remove: `files.action.${type}.remove`,
    },
    authorize({ userId, ownerId, action }) {
      return authorizeActionFiles({ userId, actionId: ownerId, fileAction: action })
    },
  })

  Files.defineOwner({
    type: `actionStatus.${type}`,
    collection: statusCollection,
    roles: {
      upload: `files.actionStatus.${type}.upload`,
      download: `files.actionStatus.${type}.download`,
      remove: `files.actionStatus.${type}.remove`,
    },
    async authorize({ userId, ownerId, action }) {
      const status = await statusCollection.findOneAsync(ownerId)
      if (!status) {
        return false
      }
      return authorizeActionFiles({ userId, actionId: status.actionId, fileAction: action })
    },
  })
}

async function authorizeActionFiles({ userId, actionId, fileAction }) {
  const { Meteor } = getMeteorApis()
  const actionDocument = await getActionsCollection().findOneAsync(actionId)
  if (!actionDocument) {
    return false
  }
  if (fileAction === 'download') {
    return canReadAction(Meteor, userId, actionDocument)
  }
  return canWriteStatus(Meteor, userId, actionDocument)
}
