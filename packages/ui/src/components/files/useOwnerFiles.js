/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Subscribe and mutate files for one parent document
 */
import { onUnmounted, ref, unref, watch } from 'vue'
import { Files } from '@nexus/files'

function readValue(value) {
  if (typeof value === 'function') {
    return value()
  }
  return unref(value)
}

export function useOwnerFiles({ ownerType, ownerId }) {
  const documents = ref([])
  const ready = ref(false)
  const uploading = ref(false)
  const errorMessage = ref('')

  let subscriptionHandle = null
  let observer = null

  function refreshDocuments(type, id) {
    documents.value = Files.collection.find({ ownerType: type, ownerId: id }).fetch()
  }

  function stopWatching() {
    observer?.stop()
    observer = null
    subscriptionHandle?.stop()
    subscriptionHandle = null
    ready.value = false
    documents.value = []
  }

  function startWatching() {
    stopWatching()
    const type = readValue(ownerType)
    const id = readValue(ownerId)
    if (typeof type !== 'string' || typeof id !== 'string' || !type || !id) {
      return
    }

    const cursor = Files.collection.find({ ownerType: type, ownerId: id })
    documents.value = cursor.fetch()
    observer = cursor.observe({
      added() {
        refreshDocuments(type, id)
      },
      changed() {
        refreshDocuments(type, id)
      },
      removed() {
        refreshDocuments(type, id)
      },
    })

    subscriptionHandle = Files.subscribeForOwner(type, id, {
      onReady() {
        ready.value = true
        refreshDocuments(type, id)
      },
    })
  }

  watch(
    () => [readValue(ownerType), readValue(ownerId)],
    () => {
      startWatching()
    },
    { immediate: true },
  )

  onUnmounted(stopWatching)

  async function uploadFile(file) {
    errorMessage.value = ''
    uploading.value = true
    try {
      return await Files.upload({
        ownerType: readValue(ownerType),
        ownerId: readValue(ownerId),
        file,
      })
    } catch (error) {
      errorMessage.value = readErrorMessage(error)
      throw error
    } finally {
      uploading.value = false
    }
  }

  async function replaceFile(file) {
    const previousIds = documents.value.map((doc) => doc._id)
    const uploaded = await uploadFile(file)
    for (const fileId of previousIds) {
      if (fileId !== uploaded._id) {
        await removeFile(fileId)
      }
    }
    return uploaded
  }

  async function removeFile(fileId) {
    errorMessage.value = ''
    try {
      await Files.remove(fileId)
    } catch (error) {
      errorMessage.value = readErrorMessage(error)
      throw error
    }
  }

  function fileDownloadUrl(fileId) {
    return Files.downloadUrl(fileId)
  }

  return {
    documents,
    ready,
    uploading,
    errorMessage,
    uploadFile,
    replaceFile,
    removeFile,
    fileDownloadUrl,
  }
}

function readErrorMessage(error) {
  return error.reason || error.message || String(error)
}
