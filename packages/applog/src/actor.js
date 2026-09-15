/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Who performed the write (user, anonymous method, or system)
 */
import { ACTOR_ANONYMOUS, ACTOR_SYSTEM, ACTOR_USER } from './constants.js'

let systemContextDepth = 0

export async function runAsSystem(callback) {
  systemContextDepth += 1
  try {
    return await callback()
  } finally {
    systemContextDepth -= 1
  }
}

export function readCurrentActor(Meteor) {
  const actorId = typeof Meteor.userId === 'function' ? Meteor.userId() : null
  if (actorId) {
    return { actorId, actorKind: ACTOR_USER }
  }
  if (systemContextDepth > 0) {
    return { actorId: null, actorKind: ACTOR_SYSTEM }
  }
  return { actorId: null, actorKind: ACTOR_ANONYMOUS }
}
