/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Fixed collection name, publication, and redact defaults
 */
export const METADATA_COLLECTION = 'nexus_applog'
export const PUBLICATION_RECENT = 'applog.recent'
export const READ_ROLES = Object.freeze(['superadmin', 'admin'])
export const DEFAULT_RECENT_LIMIT = 50
export const MAX_RECENT_LIMIT = 200
export const MAX_DOCS_PER_WRITE = 100

export const ACTION_CREATE = 'create'
export const ACTION_UPDATE = 'update'
export const ACTION_REMOVE = 'remove'

export const ACTOR_USER = 'user'
export const ACTOR_ANONYMOUS = 'anonymous'
export const ACTOR_SYSTEM = 'SYSTEM'
export const ACTOR_SYSTEM_ID = 'SYSTEM'
export const ACTOR_AGENT = 'agent'

export const DEFAULT_REDACT_KEYS = Object.freeze([
  'password',
  'bcrypt',
  'token',
  'services',
  'resume',
])
