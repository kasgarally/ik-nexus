/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Local demo extra users when public.devSeedUsers is true
 */
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/roles'
import { SETUP_DOC_ID, Setup } from '@nexus/setup'
import { createPasswordUser, findUserByEmail } from './demoAdmin.js'
import { DEMO_USER_PASSWORD, demoUsers } from './demoSeedData.js'

export async function seedDemoUsers() {
  if (!Meteor.isServer) {
    return
  }

  if (Meteor.settings?.public?.devSeedUsers !== true) {
    return
  }

  // Extra users only after first-run (or demo admin) has written nexus_setup.
  const setup = await Setup.collection.findOneAsync(SETUP_DOC_ID)
  if (!setup) {
    return
  }

  for (const account of demoUsers) {
    for (const role of account.roles) {
      await Roles.createRoleAsync(role, { unlessExists: true })
    }

    const existing = await findUserByEmail(account.email)
    const userId = existing
      ? existing._id
      : await createPasswordUser({
          email: account.email,
          password: DEMO_USER_PASSWORD,
          name: account.name,
        })
    await Roles.addUsersToRolesAsync(userId, account.roles)
  }
}
