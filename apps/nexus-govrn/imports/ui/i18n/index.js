/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * App vue-i18n instance
 *
 * Product copy lives in ./en.js ./fr.js ./ar.js.
 * Core locale picker strings and $vuetify catalogs come from @nexus/ui.
 */
import { createNexusI18n } from '@nexus/ui'
import ar from './ar.js'
import en from './en.js'
import fr from './fr.js'

export const i18n = createNexusI18n({
  storageKey: 'nexus-govrn-locale',
  messages: { en, fr, ar },
})
