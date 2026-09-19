/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Client helpers for account admin DDP
 */
import {
  METHOD_AUTH_OPTIONS,
  METHOD_ROLES_SET,
  METHOD_SELF_REGISTER,
  METHOD_USERS_INSERT,
  METHOD_USERS_REMOVE,
  METHOD_USERS_SET_PASSWORD,
  METHOD_USERS_SET_SUSPENDED,
  METHOD_USERS_UPDATE,
  PUBLICATION_ROLE_ASSIGNMENTS,
  PUBLICATION_USERS,
} from './constants.js'
import { getMeteorApis } from './register.js'

export function subscribeUsers(callbacks) {
  const { Meteor } = getMeteorApis()
  return Meteor.subscribe(PUBLICATION_USERS, callbacks)
}

export function subscribeRoleAssignments(callbacks) {
  const { Meteor } = getMeteorApis()
  return Meteor.subscribe(PUBLICATION_ROLE_ASSIGNMENTS, callbacks)
}

export function insertUser(params) {
  const { Meteor } = getMeteorApis()
  return Meteor.callAsync(METHOD_USERS_INSERT, params)
}

export function updateUser(params) {
  const { Meteor } = getMeteorApis()
  return Meteor.callAsync(METHOD_USERS_UPDATE, params)
}

export function removeUser(params) {
  const { Meteor } = getMeteorApis()
  return Meteor.callAsync(METHOD_USERS_REMOVE, params)
}

export function setPassword(params) {
  const { Meteor } = getMeteorApis()
  return Meteor.callAsync(METHOD_USERS_SET_PASSWORD, params)
}

export function setSuspended(params) {
  const { Meteor } = getMeteorApis()
  return Meteor.callAsync(METHOD_USERS_SET_SUSPENDED, params)
}

export function setRoles(params) {
  const { Meteor } = getMeteorApis()
  return Meteor.callAsync(METHOD_ROLES_SET, params)
}

export function authOptions() {
  const { Meteor } = getMeteorApis()
  return Meteor.callAsync(METHOD_AUTH_OPTIONS)
}

export function selfRegister(params) {
  const { Meteor } = getMeteorApis()
  return Meteor.callAsync(METHOD_SELF_REGISTER, params)
}

export function getUsersCollection() {
  const { Meteor } = getMeteorApis()
  return Meteor.users
}

export function getRoleAssignmentCollection() {
  const { Meteor } = getMeteorApis()
  return Meteor.roleAssignment
}

export async function rolesForUser(userId) {
  const collection = getRoleAssignmentCollection()
  if (!collection || !userId) {
    return []
  }
  const rows = await collection.find({ 'user._id': userId }).fetchAsync()
  return rows.map((row) => row.role?._id).filter(Boolean)
}
