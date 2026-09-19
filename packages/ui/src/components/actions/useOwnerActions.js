/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Subscribe and mutate nexus_actions for one parent
 */
import { onUnmounted, ref, unref, watch } from 'vue'
import { Actions } from '@nexus/actions'

function readValue(value) {
  if (typeof value === 'function') {
    return value()
  }
  return unref(value)
}

function sortActions(rows) {
  return [...rows].sort((left, right) => {
    const leftWhen = left.byWhen ? new Date(left.byWhen).getTime() : 0
    const rightWhen = right.byWhen ? new Date(right.byWhen).getTime() : 0
    if (leftWhen !== rightWhen) {
      return leftWhen - rightWhen
    }
    const leftCreated = left.createdAt ? new Date(left.createdAt).getTime() : 0
    const rightCreated = right.createdAt ? new Date(right.createdAt).getTime() : 0
    return leftCreated - rightCreated
  })
}

export function useOwnerActions({ ownerType, ownerId }) {
  const items = ref([])
  const ready = ref(false)
  const saving = ref(false)
  const errorMessage = ref('')

  let subscriptionHandle = null
  let observer = null

  async function refreshItems(type, id) {
    const rows = await Actions.collection.find({ ownerType: type, ownerId: id }).fetchAsync()
    items.value = sortActions(rows)
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
    const type = readValue(ownerType)
    const id = readValue(ownerId)
    if (!type || !id) {
      return
    }

    const cursor = Actions.collection.find({ ownerType: type, ownerId: id })
    void refreshItems(type, id)
    observer = cursor.observe({
      added() {
        void refreshItems(type, id)
      },
      changed() {
        void refreshItems(type, id)
      },
      removed() {
        void refreshItems(type, id)
      },
    })

    subscriptionHandle = Actions.subscribeForOwner(type, id, {
      onReady() {
        ready.value = true
        void refreshItems(type, id)
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

  async function insertItem(params) {
    return runWrite(() =>
      Actions.insert({
        ownerType: readValue(ownerType),
        ownerId: readValue(ownerId),
        ...params,
      }),
    )
  }

  async function updateItem(params) {
    return runWrite(() => Actions.update(params))
  }

  async function removeItem(id) {
    return runWrite(() => Actions.remove({ id }))
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
