/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Layout registry
 */
import AuthLayout from './AuthLayout.vue'
import WebLayout from './WebLayout.vue'

export const layouts = {
  auth: AuthLayout,
  web: WebLayout,
}

export const defaultLayout = 'web'
