/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Books collection — isomorphic; client writes denied
 */
import { Mongo } from 'meteor/mongo'

export const Books = new Mongo.Collection('books')

// Methods are the only write path. Vue v-if is not security.
if (typeof Books.deny === 'function') {
  Books.deny({
    insert() {
      return true
    },
    update() {
      return true
    },
    remove() {
      return true
    },
  })
}
