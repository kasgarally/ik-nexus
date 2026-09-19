/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * @nexus/org public exports
 */
import { insert, remove, subscribeTree, update } from './helpers.js'
import { getMeteorApis, getOrgCollection, registerWithMeteor } from './register.js'
import {
  requireActiveNodeIn,
  walkAncestorIds,
  walkDescendantIds,
  walkIsUnder,
} from './tree.js'
import { title } from './title.js'

export async function descendantIds(nodeId) {
  return walkDescendantIds(getOrgCollection(), nodeId)
}

export async function ancestorIds(nodeId) {
  return walkAncestorIds(getOrgCollection(), nodeId)
}

export async function isUnder(nodeId, ancestorId) {
  return walkIsUnder(getOrgCollection(), nodeId, ancestorId)
}

export async function requireActiveNode(nodeId) {
  const { Meteor } = getMeteorApis()
  return requireActiveNodeIn(Meteor, getOrgCollection(), nodeId)
}

export {
  METADATA_COLLECTION,
  METHOD_INSERT,
  METHOD_REMOVE,
  METHOD_UPDATE,
  PUBLICATION_TREE,
  WRITE_ROLES,
} from './constants.js'

export {
  insert,
  registerWithMeteor,
  remove,
  subscribeTree,
  title,
  update,
}

export const Org = {
  registerWithMeteor,
  subscribeTree,
  insert,
  update,
  remove,
  title,
  descendantIds,
  ancestorIds,
  isUnder,
  requireActiveNode,
  get collection() {
    return getOrgCollection()
  },
}
