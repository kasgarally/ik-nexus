/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Subscribe and mutate nexus_action_status for one action
 */
import { onUnmounted, ref, unref, watch } from 'vue'
import { ActionStatus } from '@nexus/actions'

function readValue(value) {
  if (typeof value === 'function') {
    return value()
  }
  return unref(value)
}

function sortByAsOfDesc(rows) {
  return [...rows].sort((left, right) => {
    const leftAt = left.asOf ? new Date(left.asOf).getTime() : 0
    const rightAt = right.asOf ? new Date(right.asOf).getTime() : 0
    return rightAt - leftAt
  })
}

export function useActionStatuses({ actionId }) {
  const items = ref([])
  const ready = ref(false)
  const saving = ref(false)
  const errorMessage = ref('')

  let subscriptionHandle = null
  let observer = null

  async function refreshItems(id) {
    const rows = await ActionStatus.collection.find({ actionId: id }).fetchAsync()
    items.value = sortByAsOfDesc(rows)
  }

  function stopWatching() {
    observer?.stop()
    observer = null
    subscriptionHandle?.stop()
    subscriptionHandle = null
    ready.value = false
    items.value = []
  }

  function startWatching() {
    stopWatching()
    const id = readValue(actionId)
    if (!id) {
      return
    }

    const cursor = ActionStatus.collection.find({ actionId: id })
    void refreshItems(id)
    observer = cursor.observe({
      added() {
        void refreshItems(id)
      },
      changed() {
        void refreshItems(id)
      },
      removed() {
        void refreshItems(id)
      },
    })

    subscriptionHandle = ActionStatus.subscribeForAction(id, {
      onReady() {
        ready.value = true
        void refreshItems(id)
      },
    })
  }

  watch(
    () => readValue(actionId),
    () => {
      startWatching()
    },
    { immediate: true },
  )

  onUnmounted(stopWatching)

  async function insertItem(params) {
    return runWrite(() =>
      ActionStatus.insert({
        actionId: readValue(actionId),
        ...params,
      }),
    )
  }

  async function updateItem(params) {
    return runWrite(() => ActionStatus.update(params))
  }

  async function removeItem(id) {
    return runWrite(() => ActionStatus.remove({ id }))
  }

  async function runWrite(work) {
    errorMessage.value = ''
    saving.value = true
    try {
      return await work()
    } catch (error) {
      errorMessage.value = error.reason || error.message || String(error)
      throw error
    } finally {
      saving.value = false
    }
  }

  return {
    items,
    ready,
    saving,
    errorMessage,
    insertItem,
    updateItem,
    removeItem,
  }
}
