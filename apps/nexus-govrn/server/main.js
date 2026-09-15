/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Server startup: demo data and @nexus/files
 */
import { Meteor } from 'meteor/meteor'
import { MongoInternals } from 'meteor/mongo'
import { WebApp } from 'meteor/webapp'
import { seedFilesDemoParents } from '/imports/api/filesDemoParents.js'
import { LinksCollection } from '/imports/api/links'
import { registerNexusFiles } from '/imports/api/nexusFiles.js'

registerNexusFiles({ MongoInternals, WebApp })

async function insertLink({ title, url }) {
  await LinksCollection.insertAsync({ title, url, createdAt: new Date() })
}

Meteor.startup(async () => {
  await seedFilesDemoParents()

  // If the Links collection is empty, add some data.
  if ((await LinksCollection.find().countAsync()) === 0) {
    await insertLink({
      title: 'Do the Tutorial',
      url: 'https://vuejs.org/guide/quick-start.html',
    })

    await insertLink({
      title: 'Follow the Guide',
      url: 'https://guide.meteor.com',
    })

    await insertLink({
      title: 'Read the Docs',
      url: 'https://docs.meteor.com',
    })

    await insertLink({
      title: 'Discussions',
      url: 'https://forums.meteor.com',
    })
  }
})
