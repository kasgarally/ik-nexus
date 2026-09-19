/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Client wrappers for password, reset, OAuth, and TOTP
 */
import { getMeteorApis } from './register.js'

export function loginWithPassword({ email, password, code }) {
  const { Meteor } = getMeteorApis()
  if (code) {
    return loginWithPasswordAnd2fa(Meteor, email, password, code)
  }
  return loginWithPasswordOnly(Meteor, email, password)
}

export function forgotPassword(email) {
  const { Accounts } = getMeteorApis()
  if (typeof Accounts.forgotPasswordAsync === 'function') {
    return Accounts.forgotPasswordAsync({ email })
  }
  return withCallback((done) => Accounts.forgotPassword({ email }, done))
}

export function resetPassword(token, password) {
  const { Accounts } = getMeteorApis()
  if (typeof Accounts.resetPasswordAsync === 'function') {
    return Accounts.resetPasswordAsync(token, password)
  }
  return withCallback((done) => Accounts.resetPassword(token, password, done))
}

export function loginWithGoogle() {
  const { Meteor } = getMeteorApis()
  if (typeof Meteor.loginWithGoogle !== 'function') {
    return Promise.reject(new Error('Google sign-in is not available'))
  }
  return withCallback((done) => Meteor.loginWithGoogle({}, done))
}

export function loginWithFacebook() {
  const { Meteor } = getMeteorApis()
  if (typeof Meteor.loginWithFacebook !== 'function') {
    return Promise.reject(new Error('Facebook sign-in is not available'))
  }
  return withCallback((done) => Meteor.loginWithFacebook({}, done))
}

export async function generate2faQr(password, appName = 'NEXUS') {
  const { Meteor, Accounts } = getMeteorApis()
  if (password) {
    const user = await currentUser(Meteor)
    const email = user?.emails?.[0]?.address
    if (email) {
      await loginWithPasswordOnly(Meteor, email, password)
    }
  }
  return withCallback((done) => {
    Accounts.generate2faActivationQrCode(appName, (error, result) => {
      done(error, result)
    })
  })
}

export function enable2fa(code) {
  const { Accounts } = getMeteorApis()
  return withCallback((done) => Accounts.enableUser2fa(code, done))
}

export function disable2fa() {
  const { Accounts } = getMeteorApis()
  return withCallback((done) => Accounts.disableUser2fa(done))
}

export function has2fa() {
  const { Accounts } = getMeteorApis()
  return withCallback((done) => {
    Accounts.has2faEnabled((error, enabled) => {
      done(error, Boolean(enabled))
    })
  })
}

function loginWithPasswordOnly(Meteor, email, password) {
  if (typeof Meteor.loginWithPasswordAsync === 'function') {
    return Meteor.loginWithPasswordAsync(email, password)
  }
  return withCallback((done) => Meteor.loginWithPassword(email, password, done))
}

function loginWithPasswordAnd2fa(Meteor, email, password, code) {
  if (typeof Meteor.loginWithPasswordAnd2faCodeAsync === 'function') {
    return Meteor.loginWithPasswordAnd2faCodeAsync(email, password, code)
  }
  if (typeof Meteor.loginWithPasswordAnd2faCode !== 'function') {
    return Promise.reject(new Error('Two-factor login is not available'))
  }
  return withCallback((done) => {
    Meteor.loginWithPasswordAnd2faCode(email, password, code, done)
  })
}

async function currentUser(Meteor) {
  if (typeof Meteor.userAsync === 'function') {
    return Meteor.userAsync()
  }
  return Meteor.user()
}

function withCallback(run) {
  return new Promise((resolve, reject) => {
    run((error, result) => {
      if (error) {
        reject(error)
        return
      }
      resolve(result)
    })
  })
}
