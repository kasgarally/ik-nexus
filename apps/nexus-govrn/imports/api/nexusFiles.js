/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Inject Meteor into @nexus/files and register the demo owner
 *
 * MongoInternals and WebApp are server-only. The client registers without them.
 */
import { check, Match } from 'meteor/check'
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Random } from 'meteor/random'
import { Roles } from 'meteor/roles'
import { Files } from '@nexus/files'
import { FilesDemoParents } from './filesDemoParents.js'

export function registerNexusFiles(serverApis = {}) {
  Files.registerWithMeteor({
    Meteor,
    Mongo,
    check,
    Match,
    Random,
    Roles,
    ...serverApis,
  })

  Files.defineOwner({
    type: 'demo',
    collection: FilesDemoParents,
    allowAnonymous: true,
    roles: {
      upload: 'files.demo.upload',
      download: 'files.demo.download',
      remove: 'files.demo.remove',
    },
  })
}
