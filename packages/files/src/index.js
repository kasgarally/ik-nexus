/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * @nexus/files public exports
 */
import { defineOwner } from './owners.js'
import { getFilesCollection, registerWithMeteor } from './register.js'
import { upload } from './upload.js'

export {
  ALLOWED_MIME_TYPES,
  DEFAULT_CHUNK_BYTES,
  DEFAULT_MAX_BYTES,
  GRIDFS_BUCKET,
  METADATA_COLLECTION,
  METHOD_FINISH,
  METHOD_PUSH_CHUNK,
  METHOD_REMOVE,
  METHOD_START,
  PUBLICATION_FOR_OWNER,
  STORAGE_KIND,
} from './constants.js'

export { defineOwner, registerWithMeteor, upload }

export const Files = {
  registerWithMeteor,
  defineOwner,
  upload,
  get collection() {
    return getFilesCollection()
  },
}
