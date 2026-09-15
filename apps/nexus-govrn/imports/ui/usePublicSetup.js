/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Subscribe to public branding from nexus_setup
 */
import { onUnmounted, ref } from 'vue'
import { SETUP_DOC_ID, Setup } from '@nexus/setup'

export function usePublicSetup() {
  const companyName = ref('')
  const iconDataUrl = ref('')
  const logoDataUrl = ref('')
  const ready = ref(false)

  async function refresh() {
    const document = await Setup.collection.findOneAsync(SETUP_DOC_ID)
    companyName.value = document?.companyName || ''
    iconDataUrl.value = document?.iconDataUrl || ''
    logoDataUrl.value = document?.logoDataUrl || ''
  }

  const cursor = Setup.collection.find({ _id: SETUP_DOC_ID })
  const observer = cursor.observe({
    added() {
      void refresh()
    },
    changed() {
      void refresh()
    },
    removed() {
      void refresh()
    },
  })

  const handle = Setup.subscribePublic({
    onReady() {
      ready.value = true
      void refresh()
    },
  })

  onUnmounted(() => {
    observer.stop()
    handle.stop()
  })

  return {
    companyName,
    iconDataUrl,
    logoDataUrl,
    ready,
  }
}
