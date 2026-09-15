/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Local demo seed: first-run company record plus admin@localhost
 */
import { Accounts } from 'meteor/accounts-base'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/roles'
import { SETUP_DOC_ID, Setup } from '@nexus/setup'
import { demoAdmin, demoSetup } from './demoSeedData.js'

export const DEMO_ADMIN_EMAIL = demoAdmin.email
export const DEMO_ADMIN_PASSWORD = demoAdmin.password
export const DEMO_ADMIN_ROLES = demoAdmin.roles

export async function seedDemoAdmin() {
  if (!Meteor.isServer) {
    return
  }

  if (Meteor.settings?.public?.devSeedAdmin !== true) {
    return
  }

  for (const role of DEMO_ADMIN_ROLES) {
    await Roles.createRoleAsync(role, { unlessExists: true })
  }

  const userId = await ensureDemoAdminUser()
  await Roles.addUsersToRolesAsync(userId, DEMO_ADMIN_ROLES)
  await ensureDemoSetup(userId)
}

async function ensureDemoAdminUser() {
  const existing = await findUserByEmail(DEMO_ADMIN_EMAIL)
  if (existing) {
    return existing._id
  }

  return createPasswordUser({
    email: DEMO_ADMIN_EMAIL,
    password: DEMO_ADMIN_PASSWORD,
    name: demoAdmin.name,
  })
}

async function ensureDemoSetup(firstAdminUserId) {
  const existing = await Setup.collection.findOneAsync(SETUP_DOC_ID)
  if (existing) {
    return
  }

  const now = new Date()
  await Setup.collection.insertAsync({
    _id: SETUP_DOC_ID,
    companyName: demoSetup.companyName,
    legalName: demoSetup.legalName,
    website: demoSetup.website,
    phone: demoSetup.phone,
    email: demoSetup.email,
    address: { ...demoSetup.address },
    logoDataUrl: demoSetup.logoDataUrl,
    iconDataUrl: demoSetup.iconDataUrl,
    installedAt: now,
    meteorRelease: Meteor.release || null,
    nodeVersion: process.version,
    firstAdminUserId,
    createdAt: now,
    updatedAt: now,
  })
}

async function findUserByEmail(email) {
  if (typeof Accounts.findUserByEmailAsync === 'function') {
    return Accounts.findUserByEmailAsync(email)
  }
  if (typeof Accounts.findUserByEmail === 'function') {
    return Accounts.findUserByEmail(email)
  }
  return Meteor.users.findOneAsync({ 'emails.address': email })
}

async function createPasswordUser({ email, password, name }) {
  const options = {
    email,
    password,
    profile: { name },
  }

  if (typeof Accounts.createUserAsync === 'function') {
    return Accounts.createUserAsync(options)
  }

  // Rspack's meteor/accounts-base export is missing createUserAsync in this app.
  return Accounts.createUser(options)
}
