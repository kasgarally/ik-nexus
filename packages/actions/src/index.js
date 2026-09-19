/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * @nexus/actions public exports
 */
import { registerFileOwners } from './fileOwners.js'
import {
  insert,
  insertStatus,
  remove,
  removeForOwner,
  removeStatus,
  subscribeAssignedToMe,
  subscribeForOwner,
  subscribeStatusForAction,
  update,
  updateStatus,
} from './helpers.js'
import { defineOwner as registerOwner } from './owners.js'
import { ownerIdsAssignedTo as readAssignedOwnerIds } from './publish.js'
import {
  getActionsCollection,
  getStatusCollection,
  registerWithMeteor,
} from './register.js'

export function defineOwner(params) {
  registerOwner(params)
  registerFileOwners(params.type)
}

export async function ownerIdsAssignedTo(userId, ownerType) {
  return readAssignedOwnerIds(userId, ownerType, getActionsCollection())
}

export {
  ACTIONS_COLLECTION,
  METHOD_ACTIONS_INSERT,
  METHOD_ACTIONS_REMOVE,
  METHOD_ACTIONS_REMOVE_FOR_OWNER,
  METHOD_ACTIONS_UPDATE,
  METHOD_STATUS_INSERT,
  METHOD_STATUS_REMOVE,
  METHOD_STATUS_UPDATE,
  PUBLICATION_ASSIGNED_TO_ME,
  PUBLICATION_FOR_OWNER,
  PUBLICATION_STATUS_FOR_ACTION,
  STATUS_COLLECTION,
} from './constants.js'

export {
  insert,
  insertStatus,
  registerWithMeteor,
  remove,
  removeForOwner,
  removeStatus,
  subscribeAssignedToMe,
  subscribeForOwner,
  subscribeStatusForAction,
  update,
  updateStatus,
}

export const Actions = {
  registerWithMeteor,
  defineOwner,
  insert,
  update,
  remove,
  removeForOwner,
  subscribeForOwner,
  subscribeAssignedToMe,
  ownerIdsAssignedTo,
  get collection() {
    return getActionsCollection()
  },
}

export const ActionStatus = {
  insert: insertStatus,
  update: updateStatus,
  remove: removeStatus,
  subscribeForAction: subscribeStatusForAction,
  get collection() {
    return getStatusCollection()
  },
}
