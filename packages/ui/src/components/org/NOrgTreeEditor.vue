<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Nested list plus modal form for nexus_org
-->
<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import NModal from '../dialogs/NModal.vue'
import NOrgNodeForm from './NOrgNodeForm.vue'
import NOrgTreeNode from './NOrgTreeNode.vue'
import { useOrgTree } from './useOrgTree.js'

defineProps({
  disabled: { type: Boolean, default: false },
})

const { t } = useI18n()
const formOpen = ref(false)
const editing = ref(null)
const createParentId = ref(null)

const { items, roots, saving, errorMessage, descendantIdsOf, insertItem, updateItem, removeItem } =
  useOrgTree()

const dialogTitle = computed(() => (editing.value?._id ? t('org.edit') : t('org.add')))

const blockedParentIds = computed(() => {
  if (!editing.value?._id) {
    return []
  }
  return [editing.value._id, ...descendantIdsOf(editing.value._id)]
})

function openCreate(parentId) {
  editing.value = null
  createParentId.value = parentId || null
  formOpen.value = true
}

function openEdit(node) {
  editing.value = node
  createParentId.value = node.parentId || null
  formOpen.value = true
}

function closeForm() {
  formOpen.value = false
  editing.value = null
  createParentId.value = null
}

async function onSubmit(payload) {
  try {
    if (editing.value?._id) {
      await updateItem({
        id: editing.value._id,
        ...payload,
      })
    } else {
      await insertItem(payload)
    }
    closeForm()
  } catch {
    // errorMessage is set by useOrgTree
  }
}

async function onRemove(node) {
  try {
    await removeItem(node._id)
  } catch {
    // errorMessage is set by useOrgTree
  }
}
</script>

<template>
  <div>
    <div class="d-flex justify-end mb-4">
      <v-btn
        color="primary"
        :disabled="disabled || saving"
        prepend-icon="mdi-plus"
        @click="openCreate(null)"
      >
        {{ t('org.addRoot') }}
      </v-btn>
    </div>

    <v-alert v-if="errorMessage" type="error" class="mb-4" closable @click:close="errorMessage = ''">
      {{ errorMessage }}
    </v-alert>

    <v-alert v-if="!roots.length" type="info" variant="tonal" density="compact">
      {{ t('org.empty') }}
    </v-alert>

    <v-list v-else>
      <n-org-tree-node
        v-for="node in roots"
        :key="node._id"
        :node="node"
        :disabled="disabled"
        :saving="saving"
        @add-child="openCreate($event._id)"
        @edit="openEdit"
        @remove="onRemove"
      />
    </v-list>

    <n-modal v-model="formOpen" :title="dialogTitle" :max-width="560">
      <n-org-node-form
        :creating="!editing"
        :item="editing"
        :parent-id="createParentId"
        :nodes="items"
        :blocked-parent-ids="blockedParentIds"
        :disabled="disabled || saving"
        @submit="onSubmit"
        @cancel="closeForm"
      />
    </n-modal>
  </div>
</template>
