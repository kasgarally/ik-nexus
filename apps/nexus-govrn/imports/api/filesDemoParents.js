/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Demo parent documents for the files test page
 */
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'

export const FilesDemoParents = new Mongo.Collection('files_demo_parents')

export const DEMO_ONE_DOC_ID = 'files-demo-one-doc'
export const DEMO_ONE_AVATAR_ID = 'files-demo-one'
export const DEMO_MANY_DOC_ID = 'files-demo-many'
export const DEMO_MANY_IMAGES_ID = 'files-demo-many-images'

const demoParents = [
  { _id: DEMO_ONE_DOC_ID, kind: 'one-doc' },
  { _id: DEMO_ONE_AVATAR_ID, kind: 'one-avatar' },
  { _id: DEMO_MANY_DOC_ID, kind: 'many-doc' },
  { _id: DEMO_MANY_IMAGES_ID, kind: 'many-images' },
]

export async function seedFilesDemoParents() {
  if (!Meteor.isServer) {
    return
  }

  for (const parent of demoParents) {
    if (!(await FilesDemoParents.findOneAsync(parent._id))) {
      await FilesDemoParents.insertAsync(parent)
    }
  }
}
