/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Subscribe and mutate the nexus_org tree
 */
import { onUnmounted, ref } from 'vue'
import { Org } from '@nexus/org'

function sortNodes(rows) {
  return [...rows].sort((left, right) => {
    const leftOrder = Number.isFinite(left.sortOrder) ? left.sortOrder : 0
    const rightOrder = Number.isFinite(right.sortOrder) ? right.sortOrder : 0
    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder
    }
    return String(left.title?.en || '').localeCompare(String(right.title?.en || ''))
  })
}

function nestNodes(rows) {
  const byParent = new Map()
  for (const row of rows) {
    const key = row.parentId || ''
    const siblings = byParent.get(key) || []
    siblings.push(row)
    byParent.set(key, siblings)
  }

  function walk(parentId) {
    const children = sortNodes(byParent.get(parentId || '') || [])
    return children.map((node) => ({
      ...node,
      children: walk(node._id),
    }))
  }

  return walk(null)
}

function collectDescendantIds(node) {
  const ids = []
  for (const child of node.children || []) {
    ids.push(child._id, ...collectDescendantIds(child))
  }
  return ids
}

export function useOrgTree() {
  const items = ref([])
  const roots = ref([])
  const ready = ref(false)
  const saving = ref(false)
  const errorMessage = ref('')

  let subscriptionHandle = null
  let observer = null

  async function refreshItems() {
    const rows = await Org.collection.find({}).fetchAsync()
    items.value = sortNodes(rows)
    roots.value = nestNodes(rows)
  }

  function stopWatching() {
    observer?.stop()
    observer = null
    subscriptionHandle?.stop()
    subscriptionHandle = null
    ready.value = false
    items.value = []
    roots.value = []
  }

  const cursor = Org.collection.find({})
  void refreshItems()
  observer = cursor.observe({
    added() {
      void refreshItems()
    },
    changed() {
      void refreshItems()
    },
    removed() {
      void refreshItems()
    },
  })

  subscriptionHandle = Org.subscribeTree({
    onReady() {
      ready.value = true
      void refreshItems()
    },
  })

  onUnmounted(stopWatching)

  function descendantIdsOf(nodeId) {
    if (!nodeId) {
      return []
    }
    const match = findNested(roots.value, nodeId)
    return match ? collectDescendantIds(match) : []
  }

  async function insertItem(params) {
    return runWrite(() => Org.insert(params))
  }

  async function updateItem(params) {
    return runWrite(() => Org.update(params))
  }

  async function removeItem(id) {
    return runWrite(() => Org.remove({ id }))
  }

  async function runWrite(work) {
    errorMessage.value = ''
    saving.value = true
    try {
      const result = await work()
      await refreshItems()
      return result
    } catch (error) {
      errorMessage.value = error.reason || error.message || String(error)
      throw error
    } finally {
      saving.value = false
    }
  }

  return {
    items,
    roots,
    ready,
    saving,
    errorMessage,
    descendantIdsOf,
    insertItem,
    updateItem,
    removeItem,
  }
}

function findNested(nodes, nodeId) {
  for (const node of nodes) {
    if (node._id === nodeId) {
      return node
    }
    const nested = findNested(node.children || [], nodeId)
    if (nested) {
      return nested
    }
  }
  return null
}
