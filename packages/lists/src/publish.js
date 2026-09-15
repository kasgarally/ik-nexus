/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * DDP publication of one listKey for logged-in users
 */
import { PUBLICATION_FOR_KEY } from './constants.js'

export function registerPublication({ Meteor, check, listsCollection }) {
  Meteor.publish(PUBLICATION_FOR_KEY, function publishListsForKey(listKey) {
    check(listKey, String)

    if (!this.userId) {
      return this.ready()
    }

    return listsCollection.find({ listKey }, { sort: { sortOrder: 1 } })
  })
}
