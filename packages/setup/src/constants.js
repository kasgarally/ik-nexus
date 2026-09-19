/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Fixed collection name, singleton id, DDP names, and size limits
 */
export const METADATA_COLLECTION = 'nexus_setup'
export const SETUP_DOC_ID = 'current'
export const METHOD_COMPLETE = 'setup.complete'
export const METHOD_IS_COMPLETE = 'setup.isComplete'
export const METHOD_UPDATE = 'setup.update'
export const PUBLICATION_PUBLIC = 'setup.public'
export const PUBLICATION_CURRENT = 'setup.current'
export const ADMIN_ROLES = Object.freeze(['superadmin', 'admin'])
export const LOGO_MAX_BYTES = 400 * 1024
export const ICON_MAX_BYTES = 100 * 1024
export const MIN_PASSWORD_LENGTH = 8
