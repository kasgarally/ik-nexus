/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Client helpers: subscribe and DDP writes
 */
import {
  METHOD_ACTIONS_INSERT,
  METHOD_ACTIONS_REMOVE,
  METHOD_ACTIONS_REMOVE_FOR_OWNER,
  METHOD_ACTIONS_UPDATE,
  METHOD_STATUS_INSERT,
  METHOD_STATUS_REMOVE,
  METHOD_STATUS_UPDATE,
  PUBLICATION_ASSIGNED_TO_ME,
  PUBLICATION_FOR_OWNER,
  PUBLICATION_STATUS_FOR_ACTION,
} from './constants.js'
import { getMeteorApis } from './register.js'

export function subscribeForOwner(ownerType, ownerId, callbacks) {
  const { Meteor } = getMeteorApis()
  return Meteor.subscribe(PUBLICATION_FOR_OWNER, ownerType, ownerId, callbacks)
}

export function subscribeStatusForAction(actionId, callbacks) {
  const { Meteor } = getMeteorApis()
  return Meteor.subscribe(PUBLICATION_STATUS_FOR_ACTION, actionId, callbacks)
}

export function subscribeAssignedToMe(callbacks) {
  const { Meteor } = getMeteorApis()
  return Meteor.subscribe(PUBLICATION_ASSIGNED_TO_ME, callbacks)
}

export function insert(params) {
  const { Meteor } = getMeteorApis()
  return Meteor.callAsync(METHOD_ACTIONS_INSERT, params)
}

export function update(params) {
  const { Meteor } = getMeteorApis()
  return Meteor.callAsync(METHOD_ACTIONS_UPDATE, params)
}

export function remove(params) {
  const { Meteor } = getMeteorApis()
  return Meteor.callAsync(METHOD_ACTIONS_REMOVE, params)
}

export function removeForOwner(params) {
  const { Meteor } = getMeteorApis()
  return Meteor.callAsync(METHOD_ACTIONS_REMOVE_FOR_OWNER, params)
}

export function insertStatus(params) {
  const { Meteor } = getMeteorApis()
  return Meteor.callAsync(METHOD_STATUS_INSERT, params)
}

export function updateStatus(params) {
  const { Meteor } = getMeteorApis()
  return Meteor.callAsync(METHOD_STATUS_UPDATE, params)
}

export function removeStatus(params) {
  const { Meteor } = getMeteorApis()
  return Meteor.callAsync(METHOD_STATUS_REMOVE, params)
}
