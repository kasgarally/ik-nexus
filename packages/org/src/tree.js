/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Ancestor and descendant walks on nexus_org
 */

const WALK_LIMIT = 500

export async function walkDescendantIds(collection, nodeId) {
  const found = []
  let frontier = [nodeId]

  while (frontier.length > 0 && found.length < WALK_LIMIT) {
    const children = await collection.find({ parentId: { $in: frontier } }).fetchAsync()
    frontier = []
    for (const child of children) {
      if (found.includes(child._id)) {
        continue
      }
      found.push(child._id)
      frontier.push(child._id)
    }
  }

  return found
}

export async function walkAncestorIds(collection, nodeId) {
  const found = []
  let currentId = nodeId

  for (let step = 0; step < WALK_LIMIT; step += 1) {
    const node = await collection.findOneAsync(currentId)
    if (!node?.parentId) {
      break
    }
    if (found.includes(node.parentId) || node.parentId === nodeId) {
      break
    }
    found.push(node.parentId)
    currentId = node.parentId
  }

  return found
}

export async function walkIsUnder(collection, nodeId, ancestorId) {
  if (!nodeId || !ancestorId) {
    return false
  }
  if (nodeId === ancestorId) {
    return true
  }
  const ancestors = await walkAncestorIds(collection, nodeId)
  return ancestors.includes(ancestorId)
}

export async function requireActiveNodeIn(Meteor, collection, nodeId) {
  if (nodeId === null || nodeId === undefined || nodeId === '') {
    return null
  }
  if (typeof nodeId !== 'string') {
    throw new Meteor.Error('invalid-org-node', 'orgNodeId must be a string or null')
  }
  const node = await collection.findOneAsync(nodeId)
  if (!node) {
    throw new Meteor.Error('org-node-not-found', 'No nexus_org document for that id')
  }
  if (node.active === false) {
    throw new Meteor.Error('org-node-inactive', 'That org node is inactive')
  }
  return node
}
