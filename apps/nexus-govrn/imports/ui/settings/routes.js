/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Settings named-view routes — thin wrappers around @nexus/ui
 */
import ScrSettingsHeading from './ScrSettingsHeading.vue'
import VewAccount from './VewAccount.vue'
import VewAccounts from './VewAccounts.vue'
import VewSettings from './VewSettings.vue'

export const settingsRoutes = [
  {
    path: '/settings',
    name: 'settings',
    components: {
      heading: ScrSettingsHeading,
      default: VewSettings,
    },
    meta: { layout: 'web' },
  },
  {
    path: '/settings/accounts',
    name: 'settingsAccounts',
    components: {
      heading: ScrSettingsHeading,
      default: VewAccounts,
    },
    meta: { layout: 'web' },
  },
  {
    path: '/settings/accounts/:id',
    name: 'settingsAccount',
    components: {
      heading: ScrSettingsHeading,
      default: VewAccount,
    },
    meta: { layout: 'web' },
  },
]
