/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Storage adapter contract
 *
 * GridFS is the only v1 backend. A later Azure adapter can implement the
 * same three methods without renaming nexus_files.
 */

export class StorageAdapter {
  async write(_payload) {
    throw new Error('StorageAdapter.write must be implemented by a concrete adapter')
  }

  async read(_id) {
    throw new Error('StorageAdapter.read must be implemented by a concrete adapter')
  }

  async remove(_id) {
    throw new Error('StorageAdapter.remove must be implemented by a concrete adapter')
  }
}
