/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Owner-type registry (defineOwner)
 *
 * Each Meteor app registers parent collections (risks, incidents, …) and
 * the meteor-roles strings that gate upload / download / remove.
 */

const ownersByType = new Map()

export function defineOwner({ type, collection, roles, allowAnonymous = false }) {
  if (!type || typeof type !== 'string') {
    throw new Error('defineOwner requires a string type')
  }

  const canLookupParent =
    collection &&
    (typeof collection.findOne === 'function' || typeof collection.findOneAsync === 'function')

  if (!canLookupParent) {
    throw new Error(`defineOwner(${type}) requires a Meteor collection`)
  }

  if (!roles?.upload || !roles?.download || !roles?.remove) {
    throw new Error(`defineOwner(${type}) requires roles.upload, roles.download, and roles.remove`)
  }

  ownersByType.set(type, {
    type,
    collection,
    roles,
    allowAnonymous: Boolean(allowAnonymous),
  })
}

export function getRegisteredOwner(ownerType) {
  return ownersByType.get(ownerType) ?? null
}

export function listOwnerTypes() {
  return [...ownersByType.keys()]
}
