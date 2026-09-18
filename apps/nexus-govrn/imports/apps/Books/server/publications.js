/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * books.list and books.one — signed-in readers only
 */
import { check } from 'meteor/check'
import { Meteor } from 'meteor/meteor'
import { Books } from '../collection.js'

export function registerBookPublications() {
  Meteor.publish('books.list', function publishBooksList() {
    if (!this.userId) {
      return this.ready()
    }

    return Books.find({}, { sort: { createdAt: -1 } })
  })

  Meteor.publish('books.one', function publishBookOne(bookId) {
    check(bookId, String)

    if (!this.userId) {
      return this.ready()
    }

    return Books.find({ _id: bookId })
  })
}
