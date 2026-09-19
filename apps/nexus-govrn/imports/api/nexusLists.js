/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Inject Meteor into @nexus/lists
 */
import { check, Match } from 'meteor/check'
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Roles } from 'meteor/roles'
import { Lists } from '@nexus/lists'
import { appLocales } from '/imports/api/appLocales.js'

export function registerNexusLists() {
  Lists.registerWithMeteor({
    Meteor,
    Mongo,
    check,
    Match,
    Roles,
    locales: appLocales,
  })
}
