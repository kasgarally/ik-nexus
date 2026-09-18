/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Inject Meteor into @nexus/accounts
 */
import { Accounts } from 'meteor/accounts-base'
import { check, Match } from 'meteor/check'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/roles'
import { Accounts as NexusAccounts } from '@nexus/accounts'
import { Applog } from '@nexus/applog'

export function registerNexusAccounts() {
  NexusAccounts.registerWithMeteor({
    Meteor,
    Accounts,
    Roles,
    check,
    Match,
    record: Applog.record,
  })
}
