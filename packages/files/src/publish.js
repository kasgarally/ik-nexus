/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * DDP publication for file metadata
 *
 * Publishes nexus_files rows only. GridFS chunks never go over DDP.
 */
import { PUBLICATION_FOR_OWNER } from './constants.js'
import { canAccessOwner } from './methods.js'
import { getRegisteredOwner } from './owners.js'

export function registerPublication({ Meteor, check, Roles, filesCollection }) {
  Meteor.publish(PUBLICATION_FOR_OWNER, async function publishFilesForOwner(ownerType, ownerId) {
    check(ownerType, String)
    check(ownerId, String)

    const owner = getRegisteredOwner(ownerType)
    if (!owner) {
      return this.ready()
    }

    if (!owner.allowAnonymous) {
      if (!this.userId) {
        return this.ready()
      }
      const canDownload = await canAccessOwner(Roles, this.userId, owner, {
        action: 'download',
        ownerId,
      })
      if (!canDownload) {
        return this.ready()
      }
    }

    return filesCollection.find({ ownerType, ownerId })
  })
}
