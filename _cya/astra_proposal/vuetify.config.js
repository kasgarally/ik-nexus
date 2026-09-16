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
          'on-background': '#182230',
          'on-surface': '#182230',
          'text-muted': '#526176',
          outline: '#DCE3ED',
          'on-primary': '#FFFFFF',
          'on-secondary': '#FFFFFF',
          'on-error': '#FFFFFF',
          'on-warning': '#FFFFFF',
          'on-success': '#FFFFFF',
          'on-info': '#FFFFFF',
          background: '#F5F7FA',
          surface: '#FFFFFF',
          'surface-bright': '#FFFFFF',
          'surface-light': '#EEF2F6',
          'surface-variant': '#424242',
          'on-surface-variant': '#EEEEEE',
          primary: '#2457C5',
          'primary-darken-1': '#1F5592',
          secondary: '#087F8C',
          'secondary-darken-1': '#018786',
          error: '#B42318',
          info: '#175CD3',
          success: '#067647',
          warning: '#B54708',
        },
        variables: {
          'border-color': '#000000',
          'border-opacity': 0.12,
          'shadow-color': '#000000',
          'high-emphasis-opacity': 1,
          'medium-emphasis-opacity': 0.75,
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
          'on-background': '#E6EAF0',
          'on-surface': '#E6EAF0',
          'text-muted': '#AAB8CA',
          outline: '#344054',
          'on-primary': '#101828',
          'on-secondary': '#101828',
          'on-error': '#101828',
          'on-warning': '#101828',
          'on-success': '#101828',
          'on-info': '#101828',
          background: '#101828',
          surface: '#182230',
          'surface-bright': '#243247',
          'surface-light': '#424242',
          'surface-variant': '#C8C8C8',
          'on-surface-variant': '#000000',
          primary: '#91B5FF',
          'primary-darken-1': '#277CC1',
          secondary: '#64CDD2',
          'secondary-darken-1': '#087F8C',
          error: '#FDA29B',
          info: '#84CAFF',
          success: '#75E0A7',
          warning: '#FEC84B',
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
      elevation: 0,
      style: 'text-transform: none; letter-spacing: normal;',
      variant: 'flat',
      rounded: 'lg',
    },
    VCard: {
      elevation: 0,
      border: true,
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
      width: 232,
    },
    VContainer: {
      fluid: false,
    },
  },
}
