/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Public branding and admin company fields from nexus_setup
 */
import { ADMIN_ROLES, PUBLICATION_CURRENT, PUBLICATION_PUBLIC, SETUP_DOC_ID } from './constants.js'

const PUBLIC_FIELDS = {
  companyName: 1,
  logoDataUrl: 1,
  iconDataUrl: 1,
}

const ADMIN_FIELDS = {
  companyName: 1,
  legalName: 1,
  website: 1,
  phone: 1,
  email: 1,
  address: 1,
  logoDataUrl: 1,
  iconDataUrl: 1,
  installedAt: 1,
  updatedAt: 1,
}

export function registerPublication({ Meteor, Roles, setupCollection }) {
  Meteor.publish(PUBLICATION_PUBLIC, function publishSetupPublic() {
    return setupCollection.find({ _id: SETUP_DOC_ID }, { fields: PUBLIC_FIELDS })
  })

  Meteor.publish(PUBLICATION_CURRENT, async function publishSetupCurrent() {
    if (!this.userId) {
      return this.ready()
    }
    const allowed = await Roles.userIsInRoleAsync(this.userId, ADMIN_ROLES)
    if (!allowed) {
      return this.ready()
    }
    return setupCollection.find({ _id: SETUP_DOC_ID }, { fields: ADMIN_FIELDS })
  })
}
