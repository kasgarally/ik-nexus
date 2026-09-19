/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * DDP publications for actions and statuses
 */
import {
  PUBLICATION_ASSIGNED_TO_ME,
  PUBLICATION_FOR_OWNER,
  PUBLICATION_STATUS_FOR_ACTION,
} from './constants.js'
import { canReadAction, getRegisteredOwner, parentAllowsRead } from './owners.js'

export function registerPublications({ Meteor, check, actionsCollection, statusCollection }) {
  Meteor.publish(PUBLICATION_FOR_OWNER, async function publishActionsForOwner(ownerType, ownerId) {
    check(ownerType, String)
    check(ownerId, String)

    if (!this.userId) {
      return this.ready()
    }

    const owner = getRegisteredOwner(ownerType)
    if (!owner) {
      return this.ready()
    }

    const parent = await owner.collection.findOneAsync(ownerId)
    if (!parent) {
      return this.ready()
    }

    if (await parentAllowsRead(this.userId, owner, parent)) {
      return actionsCollection.find({ ownerType, ownerId })
    }

    return actionsCollection.find({
      ownerType,
      ownerId,
      byWhoUserId: this.userId,
    })
  })

  Meteor.publish(PUBLICATION_STATUS_FOR_ACTION, async function publishStatusForAction(actionId) {
    check(actionId, String)

    if (!this.userId) {
      return this.ready()
    }

    const actionDocument = await actionsCollection.findOneAsync(actionId)
    if (!actionDocument) {
      return this.ready()
    }

    if (!(await canReadAction(Meteor, this.userId, actionDocument))) {
      return this.ready()
    }

    return statusCollection.find({ actionId })
  })

  Meteor.publish(PUBLICATION_ASSIGNED_TO_ME, async function publishAssignedToMe() {
    if (!this.userId) {
      return this.ready()
    }

    const assigned = await actionsCollection.find({ byWhoUserId: this.userId }).fetchAsync()
    const actionIds = assigned.map((row) => row._id)

    return [
      actionsCollection.find({ byWhoUserId: this.userId }),
      statusCollection.find({ actionId: { $in: actionIds } }),
    ]
  })
}

export async function ownerIdsAssignedTo(userId, ownerType, actionsCollection) {
  if (!userId || !ownerType) {
    return []
  }
  const rows = await actionsCollection
    .find({ ownerType, byWhoUserId: userId }, { fields: { ownerId: 1 } })
    .fetchAsync()
  return [...new Set(rows.map((row) => row.ownerId))]
}
