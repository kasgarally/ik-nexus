/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Server scaffold for the Books sub-app
 */
import { Meteor } from 'meteor/meteor'
import { Applog } from '@nexus/applog'
import { Books } from './collection.js'
import { registerBookFileOwners } from './server/files.js'
import { ensureBookIndexes } from './server/indexes.js'
import { registerBookMethods } from './server/methods.js'
import { registerBookPublications } from './server/publications.js'
import { ensureBookRoles, registerBookRoleHooks } from './server/roles.js'

export function registerBooks() {
  registerBookFileOwners()
  Applog.registerCollection({
    name: 'books',
    collection: Books,
  })
  registerBookMethods()
  registerBookPublications()
  registerBookRoleHooks()

  Meteor.startup(async () => {
    await ensureBookIndexes()
    await ensureBookRoles()
  })
}
