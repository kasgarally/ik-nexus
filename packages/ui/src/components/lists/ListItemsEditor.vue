<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Table plus modal form for one listKey
-->
<script setup>
import { computed, ref, toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { Lists } from '@nexus/lists'
import ListItemForm from './ListItemForm.vue'
import { useListItems } from './useListItems.js'

const props = defineProps({
  listKey: { type: String, required: true },
  disabled: { type: Boolean, default: false },
})

const { t, locale } = useI18n()
const formOpen = ref(false)
const deleteOpen = ref(false)
const editing = ref(null)
const pendingDelete = ref(null)

const { items, saving, errorMessage, insertItem, updateItem, removeItem } = useListItems({
  listKey: toRef(props, 'listKey'),
})

const headers = computed(() => [
  { title: t('lists.code'), key: 'code' },
  { title: t('lists.title'), key: 'label' },
  { title: t('lists.sortOrder'), key: 'sortOrder' },
  { title: t('lists.active'), key: 'active' },
  { title: t('lists.actions'), key: 'actions', sortable: false },
])

const tableItems = computed(() =>
  items.value.map((item) => ({
    ...item,
    label: Lists.title(item, locale.value),
  })),
)

const dialogTitle = computed(() => (editing.value ? t('lists.editItem') : t('lists.addItem')))

function openCreate() {
  editing.value = null
  formOpen.value = true
}

function openEdit(item) {
  editing.value = item
  formOpen.value = true
}

function closeForm() {
  formOpen.value = false
  editing.value = null
}

function askDelete(item) {
  pendingDelete.value = item
  deleteOpen.value = true
}

function cancelDelete() {
  deleteOpen.value = false
  pendingDelete.value = null
}

async function onSubmit(payload) {
  try {
    if (editing.value?._id) {
      await updateItem({
        id: editing.value._id,
        title: payload.title,
        sortOrder: payload.sortOrder,
        active: payload.active,
      })
    } else {
      await insertItem(payload)
    }
    closeForm()
  } catch {
    // errorMessage is set by useListItems
  }
}

async function confirmDelete() {
  const id = pendingDelete.value?._id
  if (!id) {
    return
  }

  try {
    await removeItem(id)
    cancelDelete()
  } catch {
    // errorMessage is set by useListItems
  }
}
</script>

<template>
  <div>
    <div class="d-flex justify-end mb-4">
      <v-btn color="primary" :disabled="disabled || saving" prepend-icon="mdi-plus" @click="openCreate">
        {{ t('lists.addItem') }}
      </v-btn>
    </div>

    <v-alert v-if="errorMessage" type="error" class="mb-4" closable @click:close="errorMessage = ''">
      {{ errorMessage }}
    </v-alert>

    <v-data-table :headers="headers" :items="tableItems" :loading="saving">
      <template #item.active="{ item }">
        {{ item.active === false ? t('lists.inactive') : t('lists.active') }}
      </template>
      <template #item.actions="{ item }">
        <v-btn
          icon="mdi-pencil"
          variant="text"
          :aria-label="t('lists.editItem')"
          :disabled="disabled || saving"
          @click="openEdit(item)"
        />
        <v-btn
          icon="mdi-delete"
          variant="text"
          :aria-label="t('lists.deleteItem')"
          :disabled="disabled || saving"
          @click="askDelete(item)"
        />
      </template>
      <template #no-data>
        {{ t('lists.empty') }}
      </template>
    </v-data-table>

    <v-dialog v-model="formOpen" max-width="520">
      <v-card>
        <v-card-title>{{ dialogTitle }}</v-card-title>
        <v-card-text>
          <ListItemForm
            :creating="!editing"
            :item="editing"
            :disabled="disabled || saving"
            @submit="onSubmit"
            @cancel="closeForm"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteOpen" max-width="420">
      <v-card>
        <v-card-title>{{ t('lists.deleteItem') }}</v-card-title>
        <v-card-text>
          {{ t('lists.deleteConfirm', { code: pendingDelete?.code || '' }) }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="saving" @click="cancelDelete">{{ t('lists.cancel') }}</v-btn>
          <v-btn color="error" :disabled="saving" @click="confirmDelete">{{ t('lists.deleteItem') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
