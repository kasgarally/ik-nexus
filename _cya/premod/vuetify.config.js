/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Vuetify createVuetify options
 *
 * Edit this file to overwrite framework defaults (theme, icons, breakpoints, locale, component props).
 */

import { useI18n } from 'vue-i18n'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import * as labsComponents from 'vuetify/labs/components'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n'
import { i18n } from './i18n/index.js'

export const vuetifyConfig = {
  ssr: false,

  components: {
    ...components,
    ...labsComponents,
  },

  directives,

  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },

  theme: {
    defaultTheme: 'light',
    variations: {
      colors: ['primary', 'secondary'],
      lighten: 2,
      darken: 2,
    },
    transition: false,
    utilities: true,
    themes: {
      light: {
        dark: false,
        colors: {
          background: '#FFFFFF',
          surface: '#FFFFFF',
          'surface-bright': '#FFFFFF',
          'surface-light': '#EEEEEE',
          'surface-variant': '#424242',
          'on-surface-variant': '#EEEEEE',
          primary: '#1867C0',
          'primary-darken-1': '#1F5592',
          secondary: '#48A9A6',
          'secondary-darken-1': '#018786',
          error: '#B00020',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
        },
        variables: {
          'border-color': '#000000',
          'border-opacity': 0.12,
          'shadow-color': '#000000',
          'high-emphasis-opacity': 0.87,
          'medium-emphasis-opacity': 0.6,
          'disabled-opacity': 0.38,
          'idle-opacity': 0.04,
          'hover-opacity': 0.04,
          'focus-opacity': 0.12,
          'selected-opacity': 0.08,
          'activated-opacity': 0.12,
          'pressed-opacity': 0.12,
          'dragged-opacity': 0.08,
        },
      },
      dark: {
        dark: true,
        colors: {
          background: '#121212',
          surface: '#212121',
          'surface-bright': '#CCBFD6',
          'surface-light': '#424242',
          'surface-variant': '#C8C8C8',
          'on-surface-variant': '#000000',
          primary: '#2196F3',
          'primary-darken-1': '#277CC1',
          secondary: '#54B6B2',
          'secondary-darken-1': '#48A9A6',
          error: '#CF6679',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
        },
        variables: {
          'border-color': '#FFFFFF',
          'border-opacity': 0.12,
          'shadow-color': '#000000',
          'high-emphasis-opacity': 1,
          'medium-emphasis-opacity': 0.7,
          'disabled-opacity': 0.5,
          'idle-opacity': 0.1,
          'hover-opacity': 0.04,
          'focus-opacity': 0.12,
          'selected-opacity': 0.08,
          'activated-opacity': 0.12,
          'pressed-opacity': 0.16,
          'dragged-opacity': 0.08,
        },
      },
    },
  },

  display: {
    mobileBreakpoint: 'lg',
    thresholds: {
      xs: 0,
      sm: 600,
      md: 840,
      lg: 1145,
      xl: 1545,
      xxl: 2138,
    },
  },

  locale: {
    adapter: createVueI18nAdapter({ i18n, useI18n }),
    rtl: { ar: true },
  },

  date: {},

  goTo: {},

  defaults: {
    global: {
      ripple: true,
    },
    VAppBar: {
      flat: true,
      color: 'surface',
    },
    VBtn: {
      variant: 'flat',
      rounded: 'lg',
    },
    VCard: {
      rounded: 'lg',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VNavigationDrawer: {
      width: 280,
    },
    VContainer: {
      fluid: false,
    },
  },
}
