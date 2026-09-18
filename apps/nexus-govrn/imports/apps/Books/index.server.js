/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Server scaffold for the Books sub-app
 */
import { Meteor } from 'meteor/meteor'
import { Applog } from '@nexus/applog'
import { Books } from './collections/books.js'
import { registerBookFileOwners } from './server/files.js'
import { registerBookRoleCatalog } from './roleCatalog.js'
import {
  ensureBookRoles,
  grantDemoBookWriters,
  registerBookRoleHooks,
} from './server/roles.js'

export function registerBooks() {
  registerBookRoleCatalog()
  registerBookFileOwners()
  Applog.registerCollection({
    name: 'books',
    collection: Books,
  })
  registerBookRoleHooks()

  Meteor.startup(async () => {
    await ensureBookRoles()
    await grantDemoBookWriters()
  })
}
