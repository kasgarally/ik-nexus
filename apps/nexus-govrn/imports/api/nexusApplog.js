/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Inject Meteor into @nexus/applog and audit files, lists, and setup
 */
import { check, Match } from 'meteor/check'
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Roles } from 'meteor/roles'
import { Applog } from '@nexus/applog'
import { Files } from '@nexus/files'
import { Lists } from '@nexus/lists'
import { Setup } from '@nexus/setup'
import { FilesDemoParents } from './filesDemoParents.js'

export function registerNexusApplog() {
  Applog.registerWithMeteor({
    Meteor,
    Mongo,
    check,
    Match,
    Roles,
  })

  if (!Meteor.isServer) {
    return
  }

  Applog.registerCollection({
    name: 'nexus_files',
    collection: Files.collection,
  })
  Applog.registerCollection({
    name: 'files_demo_parents',
    collection: FilesDemoParents,
  })
  Applog.registerCollection({
    name: 'nexus_lists',
    collection: Lists.collection,
  })
  Applog.registerCollection({
    name: 'nexus_setup',
    collection: Setup.collection,
  })
}
