/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * @nexus/files public exports
 */
import { downloadUrl, remove, subscribeForOwner } from './helpers.js'
import { defineOwner } from './owners.js'
import { getFilesCollection, registerWithMeteor } from './register.js'
import { upload } from './upload.js'

export {
  ALLOWED_MIME_TYPES,
  DOCUMENT_MIME_TYPES,
  IMAGE_MIME_TYPES,
  DEFAULT_CHUNK_BYTES,
  DEFAULT_MAX_BYTES,
  DOWNLOAD_PATH_PREFIX,
  GRIDFS_BUCKET,
  METADATA_COLLECTION,
  METHOD_FINISH,
  METHOD_PUSH_CHUNK,
  METHOD_REMOVE,
  METHOD_START,
  PUBLICATION_FOR_OWNER,
  STORAGE_KIND,
} from './constants.js'

export { defineOwner, downloadUrl, registerWithMeteor, remove, subscribeForOwner, upload }

export const Files = {
  registerWithMeteor,
  defineOwner,
  upload,
  remove,
  downloadUrl,
  subscribeForOwner,
  get collection() {
    return getFilesCollection()
  },
}
