/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * @nexus/lists public exports
 */
import { insert, remove, subscribeForKey, update } from './helpers.js'
import { getListsCollection, registerWithMeteor } from './register.js'
import { title } from './title.js'

export {
  METADATA_COLLECTION,
  METHOD_INSERT,
  METHOD_REMOVE,
  METHOD_UPDATE,
  PUBLICATION_FOR_KEY,
  WRITE_ROLES,
} from './constants.js'

export { insert, registerWithMeteor, remove, subscribeForKey, title, update }

export const Lists = {
  registerWithMeteor,
  subscribeForKey,
  insert,
  update,
  remove,
  title,
  get collection() {
    return getListsCollection()
  },
}
