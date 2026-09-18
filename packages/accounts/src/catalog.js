/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * In-memory role catalogs registered by each sub-app
 */
import { ADMIN_ROLES } from '@nexus/setup'
import { PLATFORM_CATALOG_KEY } from './constants.js'

const catalogs = new Map()

registerRoleCatalog({
  key: PLATFORM_CATALOG_KEY,
  roles: [
    { name: 'superadmin', group: PLATFORM_CATALOG_KEY },
    { name: 'admin', group: PLATFORM_CATALOG_KEY },
  ],
})

export function registerRoleCatalog(catalog) {
  if (!catalog || typeof catalog.key !== 'string' || !catalog.key.trim()) {
    throw new Error('registerRoleCatalog requires a non-empty key')
  }
  if (!Array.isArray(catalog.roles)) {
    throw new Error('registerRoleCatalog requires a roles array')
  }

  const key = catalog.key.trim()
  const roles = catalog.roles.map((role, index) => {
    if (!role || typeof role.name !== 'string' || !role.name.trim()) {
      throw new Error(`registerRoleCatalog roles[${index}] needs a name`)
    }
    return {
      name: role.name.trim(),
      group: typeof role.group === 'string' && role.group.trim() ? role.group.trim() : key,
    }
  })

  catalogs.set(key, { key, roles })
}

export function listRoleCatalog() {
  return [...catalogs.values()].map((catalog) => ({
    key: catalog.key,
    roles: catalog.roles.map((role) => ({ ...role })),
  }))
}

export function allAssignableRoleNames() {
  const names = new Set(ADMIN_ROLES)
  for (const catalog of catalogs.values()) {
    for (const role of catalog.roles) {
      names.add(role.name)
    }
  }
  return [...names]
}

export function isAssignableRole(name) {
  return allAssignableRoleNames().includes(name)
}
