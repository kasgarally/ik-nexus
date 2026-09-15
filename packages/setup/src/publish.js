/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Public branding fields from nexus_setup
 */
import { PUBLICATION_PUBLIC, SETUP_DOC_ID } from './constants.js'

export function registerPublication({ Meteor, setupCollection }) {
  Meteor.publish(PUBLICATION_PUBLIC, function publishSetupPublic() {
    return setupCollection.find(
      { _id: SETUP_DOC_ID },
      { fields: { companyName: 1, logoDataUrl: 1, iconDataUrl: 1 } },
    )
  })
}
