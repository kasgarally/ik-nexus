/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Parent-type registry (defineOwner)
 *
 * Sub-apps supply canRead / canWrite for each parent document. This package
 * ORs assignee (byWhoUserId) for that action.
 */

const ownersByType = new Map()

export function defineOwner({ type, collection, canRead, canWrite }) {
  if (!type || typeof type !== 'string') {
    throw new Error('defineOwner requires a string type')
  }

  const canLookupParent = collection && typeof collection.findOneAsync === 'function'
  if (!canLookupParent) {
    throw new Error(`defineOwner(${type}) requires a Meteor collection`)
  }
  if (typeof canRead !== 'function') {
    throw new Error(`defineOwner(${type}) requires canRead({ userId, parent })`)
  }
  if (typeof canWrite !== 'function') {
    throw new Error(`defineOwner(${type}) requires canWrite({ userId, parent })`)
  }

  ownersByType.set(type, {
    type,
    collection,
    canRead,
    canWrite,
  })
}

export function getRegisteredOwner(ownerType) {
  return ownersByType.get(ownerType) ?? null
}

export function listOwnerTypes() {
  return [...ownersByType.keys()]
}

export async function loadParent(Meteor, ownerType, ownerId) {
  const owner = getRegisteredOwner(ownerType)
  if (!owner) {
    throw new Meteor.Error('unknown-owner-type', `Owner type "${ownerType}" is not registered`)
  }
  const parent = await owner.collection.findOneAsync(ownerId)
  if (!parent) {
    throw new Meteor.Error('parent-not-found', 'The parent document does not exist')
  }
  return { owner, parent }
}

export async function parentAllowsRead(userId, owner, parent) {
  return Boolean(await owner.canRead({ userId, parent }))
}

export async function parentAllowsWrite(userId, owner, parent) {
  return Boolean(await owner.canWrite({ userId, parent }))
}

export function isAssignee(actionDocument, userId) {
  return Boolean(userId && actionDocument?.byWhoUserId === userId)
}

export async function canReadAction(Meteor, userId, actionDocument) {
  if (!userId || !actionDocument) {
    return false
  }
  if (isAssignee(actionDocument, userId)) {
    return true
  }
  const { owner, parent } = await loadParent(Meteor, actionDocument.ownerType, actionDocument.ownerId)
  return parentAllowsRead(userId, owner, parent)
}

export async function canWriteAction(Meteor, userId, actionDocument) {
  if (!userId || !actionDocument) {
    return false
  }
  const { owner, parent } = await loadParent(Meteor, actionDocument.ownerType, actionDocument.ownerId)
  return parentAllowsWrite(userId, owner, parent)
}

export async function canWriteStatus(Meteor, userId, actionDocument) {
  if (await canWriteAction(Meteor, userId, actionDocument)) {
    return true
  }
  return isAssignee(actionDocument, userId)
}
