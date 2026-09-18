/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Login, admin role, last-superadmin, and password checks
 */
import { ADMIN_ROLES, MIN_PASSWORD_LENGTH } from '@nexus/setup'

export async function requireAccountAdmin(Meteor, Roles, userId) {
  if (!userId) {
    throw new Meteor.Error('not-logged-in', 'You must be signed in')
  }
  const allowed = await Roles.userIsInRoleAsync(userId, ADMIN_ROLES)
  if (!allowed) {
    throw new Meteor.Error('not-authorized', 'Only superadmin or admin can manage accounts')
  }
}

export function requireNonEmpty(Meteor, value, errorName, message) {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  if (!trimmed) {
    throw new Meteor.Error(errorName, message)
  }
  return trimmed
}

export function requirePassword(Meteor, password) {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    throw new Meteor.Error(
      'invalid-password',
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    )
  }
  return password
}

export function requireEmail(Meteor, email) {
  const trimmed = requireNonEmpty(Meteor, email, 'invalid-email', 'Email is required')
  if (!trimmed.includes('@')) {
    throw new Meteor.Error('invalid-email', 'A valid email is required')
  }
  return trimmed
}

export async function countSuperadmins(Meteor) {
  if (!Meteor.roleAssignment) {
    return 0
  }
  return Meteor.roleAssignment.find({ 'role._id': 'superadmin' }).countAsync()
}

export async function userHasSuperadmin(Roles, userId) {
  return Roles.userIsInRoleAsync(userId, 'superadmin')
}

export async function assertNotLastSuperadmin(Meteor, Roles, targetUserId, nextKeepsSuperadmin) {
  const isSuperadmin = await userHasSuperadmin(Roles, targetUserId)
  if (!isSuperadmin || nextKeepsSuperadmin) {
    return
  }
  const count = await countSuperadmins(Meteor)
  if (count <= 1) {
    throw new Meteor.Error('last-superadmin', 'Cannot remove or suspend the last superadmin')
  }
}

export function assertNotSelf(Meteor, callerId, targetId, action) {
  if (callerId === targetId) {
    throw new Meteor.Error('not-self', `You cannot ${action} your own account`)
  }
}

export function userEmail(user) {
  const address = user?.emails?.[0]?.address
  return typeof address === 'string' ? address : ''
}
