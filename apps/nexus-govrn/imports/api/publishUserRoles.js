/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Publish the signed-in user's role assignments (display checks only)
 *
 * meteor-roles stores assignments in a separate collection. Without this
 * publication, Roles.userIsInRoleAsync is always false on the client.
 */
import { Meteor } from 'meteor/meteor'

Meteor.publish(null, function publishOwnRoleAssignments() {
  if (!this.userId) {
    return this.ready()
  }

  return Meteor.roleAssignment.find({ 'user._id': this.userId })
})
