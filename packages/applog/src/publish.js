/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Recent audit rows for superadmin only (full log visibility)
 */
import {
  DEFAULT_RECENT_LIMIT,
  MAX_RECENT_LIMIT,
  PUBLICATION_RECENT,
  READ_ROLES,
} from './constants.js'

export function registerPublication({ Meteor, check, Match, Roles, applogCollection }) {
  Meteor.publish(PUBLICATION_RECENT, async function publishRecentApplog(params = {}) {
    check(params, {
      limit: Match.Maybe(Number),
      collection: Match.Maybe(String),
      docId: Match.Maybe(String),
    })

    if (!this.userId) {
      return this.ready()
    }

    const allowed = await userHasReadRole(Roles, this.userId)
    if (!allowed) {
      return this.ready()
    }

    const limit = clampLimit(params.limit)
    const filter = {}
    if (params.collection) {
      filter.collection = params.collection
    }
    if (params.docId) {
      filter.docId = params.docId
    }

    return applogCollection.find(filter, { sort: { createdAt: -1 }, limit })
  })
}

async function userHasReadRole(Roles, userId) {
  return Roles.userIsInRoleAsync(userId, READ_ROLES)
}

function clampLimit(limit) {
  if (!Number.isFinite(limit) || limit <= 0) {
    return DEFAULT_RECENT_LIMIT
  }
  return Math.min(Math.floor(limit), MAX_RECENT_LIMIT)
}
