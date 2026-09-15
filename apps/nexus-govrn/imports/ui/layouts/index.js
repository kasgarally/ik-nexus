/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Layout registry
 */
import AuthLayout from './AuthLayout.vue'
import SetupLayout from './SetupLayout.vue'
import WebLayout from './WebLayout.vue'

export const layouts = {
  auth: AuthLayout,
  setup: SetupLayout,
  web: WebLayout,
}

export const defaultLayout = 'web'
