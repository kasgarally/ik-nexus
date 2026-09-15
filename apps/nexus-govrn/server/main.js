/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Server startup: demo data, @nexus/files, @nexus/lists, and @nexus/applog
 */
import { Meteor } from 'meteor/meteor'
import { MongoInternals } from 'meteor/mongo'
import { WebApp } from 'meteor/webapp'
import { Applog } from '@nexus/applog'
import { seedFilesDemoParents } from '/imports/api/filesDemoParents.js'
import { registerNexusApplog } from '/imports/api/nexusApplog.js'
import { registerNexusFiles } from '/imports/api/nexusFiles.js'
import { registerNexusLists } from '/imports/api/nexusLists.js'

registerNexusFiles({ MongoInternals, WebApp })
registerNexusLists()
registerNexusApplog()

Meteor.startup(async () => {
  await Applog.runAsSystem(() => seedFilesDemoParents())
})
