/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Server startup: demo data, files, lists, setup, and applog
 */
import { Meteor } from 'meteor/meteor'
import { MongoInternals } from 'meteor/mongo'
import { WebApp } from 'meteor/webapp'
import { Applog } from '@nexus/applog'
import { seedDemoAdmin } from '/imports/api/demoAdmin.js'
import { seedDemoOrg } from '/imports/api/demoOrg.js'
import { seedDemoUsers } from '/imports/api/demoUsers.js'
import { seedFilesDemoParents } from '/imports/api/filesDemoParents.js'
import { registerNexusAccounts } from '/imports/api/nexusAccounts.js'
import { registerNexusActions } from '/imports/api/nexusActions.js'
import { registerNexusApplog } from '/imports/api/nexusApplog.js'
import { registerNexusFiles } from '/imports/api/nexusFiles.js'
import { registerNexusLists } from '/imports/api/nexusLists.js'
import { registerNexusOrg } from '/imports/api/nexusOrg.js'
import { registerNexusSetup } from '/imports/api/nexusSetup.js'
import { registerBooks } from '/imports/apps/Books/index.server.js'
import '/imports/api/localesTranslate.js'
import '/imports/api/publishUserRoles.js'

registerNexusFiles({ MongoInternals, WebApp })
registerNexusLists()
registerNexusSetup()
registerNexusAccounts()
registerNexusOrg()
registerNexusActions()
registerNexusApplog()

Meteor.startup(async () => {
  await Applog.runAsSystem(async () => {
    await seedFilesDemoParents()
    await seedDemoAdmin()
    await seedDemoUsers()
    await seedDemoOrg()
  })
})

// After the seed startup is queued so book roles land on the demo admin.
registerBooks()
