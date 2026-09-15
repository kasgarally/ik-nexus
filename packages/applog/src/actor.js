/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Who performed the write (user, SYSTEM, agent, or anonymous)
 *
 * Nested runAs / runAsSystem / runAsAgent frames override Meteor.userId().
 * SYSTEM is not a user: actorId and actorKind are both the sentinel SYSTEM.
 * Agents later pass a real agent document _id with actorKind agent.
 */
import {
  ACTOR_AGENT,
  ACTOR_ANONYMOUS,
  ACTOR_SYSTEM,
  ACTOR_SYSTEM_ID,
  ACTOR_USER,
} from './constants.js'

const actorStack = []

export async function runAs(actor, callback) {
  actorStack.push(normalizeActor(actor))
  try {
    return await callback()
  } finally {
    actorStack.pop()
  }
}

export async function runAsSystem(callback) {
  return runAs({ actorId: ACTOR_SYSTEM_ID, actorKind: ACTOR_SYSTEM }, callback)
}

export async function runAsAgent(agentId, callback) {
  const id = typeof agentId === 'string' ? agentId.trim() : ''
  if (!id) {
    throw new Error('Applog.runAsAgent requires a non-empty agent id')
  }
  return runAs({ actorId: id, actorKind: ACTOR_AGENT }, callback)
}

export function readCurrentActor(Meteor) {
  const override = actorStack[actorStack.length - 1]
  if (override) {
    return { actorId: override.actorId, actorKind: override.actorKind }
  }

  const actorId = readUserIdIfAllowed(Meteor)
  if (actorId) {
    return { actorId, actorKind: ACTOR_USER }
  }
  return { actorId: null, actorKind: ACTOR_ANONYMOUS }
}

function normalizeActor(actor) {
  if (!actor || typeof actor !== 'object') {
    throw new Error('Applog.runAs requires { actorId, actorKind }')
  }

  const actorKind = typeof actor.actorKind === 'string' ? actor.actorKind.trim() : ''
  if (!actorKind) {
    throw new Error('Applog.runAs requires actorKind')
  }

  if (actorKind === ACTOR_SYSTEM) {
    return { actorId: ACTOR_SYSTEM_ID, actorKind: ACTOR_SYSTEM }
  }

  if (actorKind === ACTOR_AGENT || actorKind === ACTOR_USER) {
    const actorId = typeof actor.actorId === 'string' ? actor.actorId.trim() : ''
    if (!actorId) {
      throw new Error(`Applog.runAs ${actorKind} requires a non-empty actorId`)
    }
    return { actorId, actorKind }
  }

  return {
    actorId: actor.actorId == null || actor.actorId === '' ? null : String(actor.actorId),
    actorKind,
  }
}

function readUserIdIfAllowed(Meteor) {
  if (typeof Meteor.userId !== 'function') {
    return null
  }

  try {
    return Meteor.userId()
  } catch {
    // Accounts throws outside methods, publications, and HTTP handlers.
    return null
  }
}
