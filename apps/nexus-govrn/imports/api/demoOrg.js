/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Local demo organisation tree when public.devSeedAdmin is true
 */
import { Meteor } from 'meteor/meteor'
import { Org } from '@nexus/org'
import { demoOrgNodes } from './demoSeedData.js'

export async function seedDemoOrg() {
  if (!Meteor.isServer) {
    return
  }

  if (Meteor.settings?.public?.devSeedAdmin !== true) {
    return
  }

  const existing = await Org.collection.findOneAsync({})
  if (existing) {
    return
  }

  const now = new Date()
  for (const node of demoOrgNodes) {
    await Org.collection.insertAsync({
      ...node,
      active: true,
      createdAt: now,
      updatedAt: now,
    })
  }
}