/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Subscribe and update the nexus_setup singleton
 */
import { SETUP_DOC_ID, Setup } from '@nexus/setup'
import { onUnmounted, ref } from 'vue'

export function useSetupCurrent() {
  const document = ref(null)
  const ready = ref(false)
  const saving = ref(false)
  const errorMessage = ref('')

  let subscriptionHandle = null
  let observer = null

  async function refreshDocument() {
    const row = await Setup.collection.findOneAsync(SETUP_DOC_ID)
    document.value = row || null
  }

  function stopWatching() {
    observer?.stop()
    observer = null
    subscriptionHandle?.stop()
    subscriptionHandle = null
    ready.value = false
    document.value = null
  }

  const cursor = Setup.collection.find({ _id: SETUP_DOC_ID })
  void refreshDocument()
  observer = cursor.observe({
    added() {
      void refreshDocument()
    },
    changed() {
      void refreshDocument()
    },
    removed() {
      void refreshDocument()
    },
  })

  subscriptionHandle = Setup.subscribeCurrent({
    onReady() {
      ready.value = true
      void refreshDocument()
    },
  })

  onUnmounted(stopWatching)

  async function update(params) {
    errorMessage.value = ''
    saving.value = true
    try {
      const result = await Setup.update(params)
      await refreshDocument()
      return result
    } catch (error) {
      errorMessage.value = error.reason || error.message || String(error)
      throw error
    } finally {
      saving.value = false
    }
  }

  return {
    document,
    ready,
    saving,
    errorMessage,
    update,
  }
}
