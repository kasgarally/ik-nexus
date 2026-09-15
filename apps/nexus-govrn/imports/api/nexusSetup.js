/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Inject Meteor into @nexus/setup
 */
import { Accounts } from 'meteor/accounts-base'
import { check, Match } from 'meteor/check'
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { Roles } from 'meteor/roles'
import { Applog } from '@nexus/applog'
import { Setup } from '@nexus/setup'

export function registerNexusSetup() {
  Setup.registerWithMeteor({
    Meteor,
    Mongo,
    check,
    Match,
    Roles,
    Accounts,
    runAsSystem: Applog.runAsSystem,
  })
}
