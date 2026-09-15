/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Client helpers: remove, download URL, subscribe
 */
import { DOWNLOAD_PATH_PREFIX, METHOD_REMOVE, PUBLICATION_FOR_OWNER } from './constants.js'
import { getMeteorApis } from './register.js'

export function remove(fileId) {
  const { Meteor } = getMeteorApis()
  return Meteor.callAsync(METHOD_REMOVE, { fileId })
}

export function downloadUrl(fileId) {
  return `${DOWNLOAD_PATH_PREFIX}/${encodeURIComponent(fileId)}`
}

export function subscribeForOwner(ownerType, ownerId, callbacks) {
  const { Meteor } = getMeteorApis()
  return Meteor.subscribe(PUBLICATION_FOR_OWNER, ownerType, ownerId, callbacks)
}
