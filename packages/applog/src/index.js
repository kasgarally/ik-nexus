/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * @nexus/applog public exports
 */
import { runAsSystem } from './actor.js'
import { registerCollection } from './collections.js'
import { subscribeRecent } from './helpers.js'
import { record } from './record.js'
import { getApplogCollection, registerWithMeteor } from './register.js'

export {
  ACTION_CREATE,
  ACTION_REMOVE,
  ACTION_UPDATE,
  ACTOR_ANONYMOUS,
  ACTOR_SYSTEM,
  ACTOR_USER,
  DEFAULT_REDACT_KEYS,
  METADATA_COLLECTION,
  PUBLICATION_RECENT,
  READ_ROLES,
} from './constants.js'

export { record, registerCollection, registerWithMeteor, runAsSystem, subscribeRecent }

export const Applog = {
  registerWithMeteor,
  registerCollection,
  record,
  runAsSystem,
  subscribeRecent,
  get collection() {
    return getApplogCollection()
  },
}
