/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Inject Meteor into @nexus/org
 */
import { check, Match } from 'meteor/check'
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Roles } from 'meteor/roles'
import { Org } from '@nexus/org'
import { appLocales } from '/imports/api/appLocales.js'

export function registerNexusOrg() {
  Org.registerWithMeteor({
    Meteor,
    Mongo,
    check,
    Match,
    Roles,
    locales: appLocales,
  })
}
