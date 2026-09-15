/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Subscribe and mutate nexus_lists rows for one listKey
 */
import { onUnmounted, ref, unref, watch } from 'vue'
import { Lists } from '@nexus/lists'

function readValue(value) {
  if (typeof value === 'function') {
    return value()
  }
  return unref(value)
}

function sortByOrder(rows) {
  return [...rows].sort((left, right) => {
    const leftOrder = Number.isFinite(left.sortOrder) ? left.sortOrder : 0
    const rightOrder = Number.isFinite(right.sortOrder) ? right.sortOrder : 0
    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder
    }
    return String(left.code || '').localeCompare(String(right.code || ''))
  })
}

export function useListItems({ listKey }) {
  const items = ref([])
  const ready = ref(false)
  const saving = ref(false)
  const errorMessage = ref('')

  let subscriptionHandle = null
  let observer = null

  async function refreshItems(key) {
    const cursor = Lists.collection.find({ listKey: key })
    const rows = await cursor.fetchAsync()
    items.value = sortByOrder(rows)
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
    const key = readValue(listKey)
    if (typeof key !== 'string' || !key) {
      return
    }

    const cursor = Lists.collection.find({ listKey: key })
    void refreshItems(key)
    observer = cursor.observe({
      added() {
        void refreshItems(key)
      },
      changed() {
        void refreshItems(key)
      },
      removed() {
        void refreshItems(key)
      },
    })

    subscriptionHandle = Lists.subscribeForKey(key, {
      onReady() {
        ready.value = true
        void refreshItems(key)
      },
    })
  }

  watch(
    () => readValue(listKey),
    () => {
      startWatching()
    },
    { immediate: true },
  )

  onUnmounted(stopWatching)

  async function insertItem(params) {
    errorMessage.value = ''
    saving.value = true
    try {
      return await Lists.insert({
        listKey: readValue(listKey),
        ...params,
      })
    } catch (error) {
      errorMessage.value = readErrorMessage(error)
      throw error
    } finally {
      saving.value = false
    }
  }

  async function updateItem(params) {
    errorMessage.value = ''
    saving.value = true
    try {
      return await Lists.update(params)
    } catch (error) {
      errorMessage.value = readErrorMessage(error)
      throw error
    } finally {
      saving.value = false
    }
  }

  async function removeItem(id) {
    errorMessage.value = ''
    saving.value = true
    try {
      return await Lists.remove({ id })
    } catch (error) {
      errorMessage.value = readErrorMessage(error)
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

function readErrorMessage(error) {
  return error.reason || error.message || String(error)
}
