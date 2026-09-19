/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * DDP publication of the org tree for logged-in users
 */
import { PUBLICATION_TREE } from './constants.js'

export function registerPublication({ Meteor, orgCollection }) {
  Meteor.publish(PUBLICATION_TREE, function publishOrgTree() {
    if (!this.userId) {
      return this.ready()
    }

    return orgCollection.find({}, { sort: { sortOrder: 1 } })
  })
}
