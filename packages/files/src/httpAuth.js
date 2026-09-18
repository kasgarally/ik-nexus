/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Resume-token lookup so HTTP downloads can identify the caller
 *
 * Meteor stores the hashed login token on the user. The raw token is
 * mirrored in a SameSite cookie so <img> and window.open send it.
 */
import { createHash } from 'node:crypto'

export const LOGIN_COOKIE_NAME = 'meteor_login_token'
export const LOGIN_STORAGE_KEY = 'Meteor.loginToken'

export function hashLoginToken(loginToken) {
  return createHash('sha256').update(loginToken).digest('base64')
}

export function readMeteorLoginToken(req) {
  const cookieHeader = req?.headers?.cookie
  if (!cookieHeader) {
    return null
  }

  const parts = String(cookieHeader).split(';')
  for (const part of parts) {
    const trimmed = part.trim()
    const equalsAt = trimmed.indexOf('=')
    if (equalsAt === -1) {
      continue
    }

    const name = trimmed.slice(0, equalsAt).trim()
    if (name !== LOGIN_COOKIE_NAME) {
      continue
    }

    const raw = trimmed.slice(equalsAt + 1).trim()
    if (!raw) {
      return null
    }

    try {
      return decodeURIComponent(raw)
    } catch {
      return raw
    }
  }

  return null
}

export async function userIdFromRequest(req, Meteor) {
  const loginToken = readMeteorLoginToken(req)
  if (!loginToken) {
    return null
  }

  const hashedToken = hashLoginToken(loginToken)
  const user = await Meteor.users.findOneAsync(
    { 'services.resume.loginTokens.hashedToken': hashedToken },
    { fields: { _id: 1 } },
  )
  return user?._id ?? null
}
