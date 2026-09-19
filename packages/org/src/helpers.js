/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Client helpers: subscribe and DDP writes
 */
import { METHOD_INSERT, METHOD_REMOVE, METHOD_UPDATE, PUBLICATION_TREE } from './constants.js'
import { getMeteorApis } from './register.js'

export function subscribeTree(callbacks) {
  const { Meteor } = getMeteorApis()
  return Meteor.subscribe(PUBLICATION_TREE, callbacks)
}

export function insert(params) {
  const { Meteor } = getMeteorApis()
  return Meteor.callAsync(METHOD_INSERT, params)
}

export function update(params) {
  const { Meteor } = getMeteorApis()
  return Meteor.callAsync(METHOD_UPDATE, params)
}

export function remove(params) {
  const { Meteor } = getMeteorApis()
  return Meteor.callAsync(METHOD_REMOVE, params)
}
