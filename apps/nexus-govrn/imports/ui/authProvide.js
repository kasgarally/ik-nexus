/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Injected auth helpers for @nexus/ui widgets
 */
import { Accounts } from '@nexus/accounts'
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '/imports/api/demoAdmin.js'

export function createAuthHelpers() {
  return {
    authOptions: () => Accounts.authOptions(),
    loginWithPassword: (params) => Accounts.loginWithPassword(params),
    forgotPassword: (email) => Accounts.forgotPassword(email),
    resetPassword: (token, password) => Accounts.resetPassword(token, password),
    selfRegister: (params) => Accounts.selfRegister(params),
    loginWithGoogle: () => Accounts.loginWithGoogle(),
    loginWithFacebook: () => Accounts.loginWithFacebook(),
    generate2faQr: (password, appName) => Accounts.generate2faQr(password, appName),
    enable2fa: (code) => Accounts.enable2fa(code),
    disable2fa: (code) => Accounts.disable2fa(code),
    has2fa: () => Accounts.has2fa(),
    demoCredentials() {
      return { email: DEMO_ADMIN_EMAIL, password: DEMO_ADMIN_PASSWORD }
    },
  }
}
