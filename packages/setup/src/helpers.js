/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Client helpers: complete, status, public subscribe, login
 */
import { METHOD_COMPLETE, METHOD_IS_COMPLETE, PUBLICATION_PUBLIC } from './constants.js'
import { getMeteorApis } from './register.js'

export function isComplete() {
  const { Meteor } = getMeteorApis()
  return Meteor.callAsync(METHOD_IS_COMPLETE)
}

export function complete(params) {
  const { Meteor } = getMeteorApis()
  return Meteor.callAsync(METHOD_COMPLETE, params)
}

export function subscribePublic(callbacks) {
  const { Meteor } = getMeteorApis()
  return Meteor.subscribe(PUBLICATION_PUBLIC, callbacks)
}

export function loginWithPassword(email, password) {
  const { Meteor } = getMeteorApis()
  if (typeof Meteor.loginWithPasswordAsync === 'function') {
    return Meteor.loginWithPasswordAsync(email, password)
  }

  return new Promise((resolve, reject) => {
    Meteor.loginWithPassword(email, password, (error) => {
      if (error) {
        reject(error)
        return
      }
      resolve()
    })
  })
}
