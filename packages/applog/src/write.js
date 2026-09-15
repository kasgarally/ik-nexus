/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Insert one audit row; never throw into the business write
 */
import { getApplogCollection, getMeteorApis } from './register.js'
import { readCurrentActor } from './actor.js'

export async function writeAuditRow({
  action,
  collection,
  docId,
  fields = [],
  document,
  actorKind: actorKindOverride,
}) {
  const { Meteor } = getMeteorApis()
  const actor = readCurrentActor(Meteor)
  const row = {
    createdAt: new Date(),
    actorId: actor.actorId,
    actorKind: actorKindOverride || actor.actorKind,
    action,
    collection,
    docId: docId == null ? null : String(docId),
    fields,
  }

  if (document !== undefined) {
    row.document = document
  }

  try {
    await getApplogCollection().insertAsync(row)
  } catch (error) {
    console.error('@nexus/applog failed to write an audit row', error)
  }
}
