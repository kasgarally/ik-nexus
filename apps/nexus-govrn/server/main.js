/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Server startup: demo data and @nexus/files
 */
import { Meteor } from 'meteor/meteor'
import { MongoInternals } from 'meteor/mongo'
import { WebApp } from 'meteor/webapp'
import { seedFilesDemoParents } from '/imports/api/filesDemoParents.js'
import { registerNexusFiles } from '/imports/api/nexusFiles.js'

registerNexusFiles({ MongoInternals, WebApp })


Meteor.startup(async () => {
  await seedFilesDemoParents()

})
