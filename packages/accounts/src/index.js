/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * @nexus/accounts public exports
 */
import { allAssignableRoleNames, listRoleCatalog, registerRoleCatalog } from './catalog.js'
import {
  getRoleAssignmentCollection,
  getUsersCollection,
  insertUser,
  removeUser,
  rolesForUser,
  setPassword,
  setRoles,
  setSuspended,
  subscribeRoleAssignments,
  subscribeUsers,
  updateUser,
} from './helpers.js'
import { getMeteorApis, registerWithMeteor } from './register.js'

export {
  METHOD_ROLES_SET,
  METHOD_USERS_INSERT,
  METHOD_USERS_REMOVE,
  METHOD_USERS_SET_PASSWORD,
  METHOD_USERS_SET_SUSPENDED,
  METHOD_USERS_UPDATE,
  PLATFORM_CATALOG_KEY,
  PUBLICATION_ROLE_ASSIGNMENTS,
  PUBLICATION_USERS,
  USERS_COLLECTION,
} from './constants.js'

export {
  allAssignableRoleNames,
  getMeteorApis,
  getRoleAssignmentCollection,
  getUsersCollection,
  insertUser,
  listRoleCatalog,
  registerRoleCatalog,
  registerWithMeteor,
  removeUser,
  rolesForUser,
  setPassword,
  setRoles,
  setSuspended,
  subscribeRoleAssignments,
  subscribeUsers,
  updateUser,
}

export const Accounts = {
  registerWithMeteor,
  registerRoleCatalog,
  listRoleCatalog,
  allAssignableRoleNames,
  subscribeUsers,
  subscribeRoleAssignments,
  insertUser,
  updateUser,
  removeUser,
  setPassword,
  setRoles,
  setSuspended,
  rolesForUser,
  get users() {
    return getUsersCollection()
  },
  get roleAssignment() {
    return getRoleAssignmentCollection()
  },
}
