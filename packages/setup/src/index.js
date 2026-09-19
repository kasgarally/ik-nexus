/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * @nexus/setup public exports
 */
import { complete, isComplete, loginWithPassword, subscribeCurrent, subscribePublic, update } from './helpers.js'
import { getSetupCollection, registerWithMeteor } from './register.js'

export {
  ADMIN_ROLES,
  ICON_MAX_BYTES,
  LOGO_MAX_BYTES,
  METADATA_COLLECTION,
  METHOD_COMPLETE,
  METHOD_IS_COMPLETE,
  METHOD_UPDATE,
  MIN_PASSWORD_LENGTH,
  PUBLICATION_CURRENT,
  PUBLICATION_PUBLIC,
  SETUP_DOC_ID,
} from './constants.js'

export { complete, isComplete, loginWithPassword, registerWithMeteor, subscribeCurrent, subscribePublic, update }

export const Setup = {
  registerWithMeteor,
  complete,
  isComplete,
  update,
  loginWithPassword,
  subscribePublic,
  subscribeCurrent,
  get collection() {
    return getSetupCollection()
  },
}
