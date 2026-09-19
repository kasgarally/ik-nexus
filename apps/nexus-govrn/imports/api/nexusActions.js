/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Inject Meteor into @nexus/actions
 *
 * No defineOwner this round. Risks later registers type "risk".
 */
import { check, Match } from 'meteor/check'
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Actions } from '@nexus/actions'
import { appLocales } from '/imports/api/appLocales.js'

export function registerNexusActions() {
  Actions.registerWithMeteor({
    Meteor,
    Mongo,
    check,
    Match,
    locales: appLocales,
  })
}
