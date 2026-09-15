/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Wrap collection writes so create/update/remove are audited
 */
import { ACTION_CREATE, ACTION_REMOVE, ACTION_UPDATE } from './constants.js'
import { diffChangedFields } from './diff.js'
import { findDocumentsForSelector, findOneById } from './documents.js'
import { buildRedactKeySet, redactDocument } from './redact.js'
import { getMeteorApis } from './register.js'
import { writeAuditRow } from './write.js'

const registeredByName = new Map()
const wrappedCollections = new WeakSet()

export function registerCollection({ name, collection, redactKeys = [] }) {
  if (!name || typeof name !== 'string') {
    throw new Error('registerCollection requires a string name')
  }
  if (!collection || typeof collection.findOneAsync !== 'function') {
    throw new Error(`registerCollection(${name}) requires a Meteor collection with findOneAsync`)
  }
  if (registeredByName.has(name)) {
    throw new Error(`registerCollection(${name}) was already called`)
  }
  if (wrappedCollections.has(collection)) {
    throw new Error(`registerCollection(${name}) — this collection is already wrapped`)
  }

  const redactKeySet = buildRedactKeySet(redactKeys)
  const { Meteor } = getMeteorApis()
  registeredByName.set(name, { name, collection, redactKeySet })

  if (!Meteor.isServer) {
    return
  }

  wrapCollectionWrites(collection, name, redactKeySet)
  wrappedCollections.add(collection)
}

export function getRegisteredCollection(name) {
  return registeredByName.get(name) ?? null
}

function wrapCollectionWrites(collection, collectionName, redactKeySet) {
  wrapMethod(collection, 'insertAsync', (original, args) =>
    afterInsert(original, args, collection, collectionName, redactKeySet),
  )
  wrapMethod(collection, 'updateAsync', (original, args) =>
    afterUpdate(original, args, collection, collectionName, redactKeySet),
  )
  wrapMethod(collection, 'removeAsync', (original, args) =>
    afterRemove(original, args, collection, collectionName, redactKeySet),
  )
}

function wrapMethod(collection, methodName, around) {
  const original = collection[methodName]
  if (typeof original !== 'function') {
    throw new Error(`registerCollection expected ${methodName} on the collection`)
  }

  collection[methodName] = function wrappedWrite(...args) {
    return around(original.bind(collection), args)
  }
}

async function afterInsert(original, args, collection, collectionName, redactKeySet) {
  const insertedId = await original(...args)
  const document = (await findOneById(collection, insertedId)) || args[0] || {}
  await writeAuditRow({
    action: ACTION_CREATE,
    collection: collectionName,
    docId: insertedId || document._id,
    document: redactDocument(document, redactKeySet),
  })
  return insertedId
}

async function afterUpdate(original, args, collection, collectionName, redactKeySet) {
  const selector = args[0]
  const beforeDocuments = await findDocumentsForSelector(collection, selector)
  const result = await original(...args)

  for (const before of beforeDocuments) {
    const after = await findOneById(collection, before._id)
    const fields = diffChangedFields(before, after, redactKeySet)
    if (fields.length === 0) {
      continue
    }
    await writeAuditRow({
      action: ACTION_UPDATE,
      collection: collectionName,
      docId: before._id,
      fields,
    })
  }

  return result
}

async function afterRemove(original, args, collection, collectionName, redactKeySet) {
  const selector = args[0]
  const beforeDocuments = await findDocumentsForSelector(collection, selector)
  const result = await original(...args)

  for (const before of beforeDocuments) {
    await writeAuditRow({
      action: ACTION_REMOVE,
      collection: collectionName,
      docId: before._id,
      document: redactDocument(before, redactKeySet),
    })
  }

  return result
}
