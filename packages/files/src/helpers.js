/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Client helpers: remove, download URL, subscribe, cookie sync
 */
import { DOWNLOAD_PATH_PREFIX, METHOD_REMOVE, PUBLICATION_FOR_OWNER } from './constants.js'
import { LOGIN_COOKIE_NAME, LOGIN_STORAGE_KEY } from './httpAuth.js'
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

/**
 * Mirror the DDP login token into a cookie so GET /nexus-files/:id
 * can authenticate <img> and window.open on the same origin.
 */
export function syncDownloadCookie() {
  if (typeof document === 'undefined') {
    return
  }

  const { Meteor } = getMeteorApis()
  const token = Meteor._localStorage?.getItem?.(LOGIN_STORAGE_KEY) || ''
  const secure = typeof location !== 'undefined' && location.protocol === 'https:'
  const securePart = secure ? '; Secure' : ''

  if (token) {
    document.cookie = `${LOGIN_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; SameSite=Lax${securePart}`
    return
  }

  document.cookie = `${LOGIN_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax${securePart}`
}
