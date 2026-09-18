/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Server startup: demo data, files, lists, setup, and applog
 */
import { Meteor } from 'meteor/meteor'
import { MongoInternals } from 'meteor/mongo'
import { WebApp } from 'meteor/webapp'
import { Applog } from '@nexus/applog'
import { seedDemoAdmin } from '/imports/api/demoAdmin.js'
import { seedFilesDemoParents } from '/imports/api/filesDemoParents.js'
import { registerNexusApplog } from '/imports/api/nexusApplog.js'
import { registerNexusFiles } from '/imports/api/nexusFiles.js'
import { registerNexusLists } from '/imports/api/nexusLists.js'
import { registerNexusSetup } from '/imports/api/nexusSetup.js'
import { registerBooks } from '/imports/apps/Books/index.server.js'
import '/imports/api/publishUserRoles.js'

registerNexusFiles({ MongoInternals, WebApp })
registerNexusLists()
registerNexusSetup()
registerNexusApplog()

Meteor.startup(async () => {
  await Applog.runAsSystem(async () => {
    await seedFilesDemoParents()
    await seedDemoAdmin()
  })
})

// After the seed startup is queued so book roles land on the demo admin.
registerBooks()
