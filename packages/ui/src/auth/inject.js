/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Injected password / OAuth / TOTP helpers for auth widgets
 */
import { inject } from 'vue'

export const NEXUS_AUTH_KEY = 'nexusAuth'

export function useNexusAuth() {
  const auth = inject(NEXUS_AUTH_KEY, null)
  if (!auth) {
    throw new Error('Provide NEXUS_AUTH_KEY before mounting auth widgets')
  }
  return auth
}

export function safeNextPath(value) {
  if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')) {
    return value
  }
  return '/'
}

export function authErrorText(error) {
  return error?.reason || error?.message || String(error || '')
}
