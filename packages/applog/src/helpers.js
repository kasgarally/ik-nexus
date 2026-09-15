/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Client subscribe helper for applog.recent
 */
import { DEFAULT_RECENT_LIMIT, PUBLICATION_RECENT } from './constants.js'
import { getMeteorApis } from './register.js'

export function subscribeRecent({ limit = DEFAULT_RECENT_LIMIT, collection, docId } = {}) {
  const { Meteor } = getMeteorApis()
  return Meteor.subscribe(PUBLICATION_RECENT, { limit, collection, docId })
}
