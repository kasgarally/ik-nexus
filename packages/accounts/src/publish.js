/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Admin-only users and role-assignment publications
 */
import { PUBLICATION_DIRECTORY, PUBLICATION_ROLE_ASSIGNMENTS, PUBLICATION_USERS } from './constants.js'
import { requireAccountAdmin } from './gates.js'

const USER_FIELDS = {
  emails: 1,
  'profile.name': 1,
  createdAt: 1,
  suspendedAt: 1,
}

const DIRECTORY_FIELDS = {
  emails: 1,
  'profile.name': 1,
  'profile.orgNodeId': 1,
}

export function registerPublications({ Meteor, Roles }) {
  Meteor.publish(PUBLICATION_USERS, async function publishAccountUsers() {
    try {
      await requireAccountAdmin(Meteor, Roles, this.userId)
    } catch {
      return this.ready()
    }
    return Meteor.users.find({}, { fields: USER_FIELDS })
  })

  Meteor.publish(PUBLICATION_DIRECTORY, function publishAccountDirectory() {
    if (!this.userId) {
      return this.ready()
    }
    return Meteor.users.find(
      { $or: [{ suspendedAt: null }, { suspendedAt: { $exists: false } }] },
      { fields: DIRECTORY_FIELDS },
    )
  })

  Meteor.publish(PUBLICATION_ROLE_ASSIGNMENTS, async function publishAccountRoleAssignments() {
    try {
      await requireAccountAdmin(Meteor, Roles, this.userId)
    } catch {
      return this.ready()
    }
    if (!Meteor.roleAssignment) {
      return this.ready()
    }
    return Meteor.roleAssignment.find({})
  })
}
