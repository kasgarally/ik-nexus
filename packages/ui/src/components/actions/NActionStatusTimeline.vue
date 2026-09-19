<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Status journal for one action (newest first)
-->
<script setup>
import { computed, ref, toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { resolveLocalized } from '../../i18n/locales.js'
import { inject } from 'vue'
import { NEXUS_LOCALES_KEY } from '../../i18n/createNexusI18n.js'
import { formatIsoDateForLocale, toIsoDate } from '../pickers/dateTime.js'
import NFileUpload from '../files/NFileUpload.vue'
import NModal from '../dialogs/NModal.vue'
import NActionStatusForm from './NActionStatusForm.vue'
import { useActionStatuses } from './useActionStatuses.js'

const props = defineProps({
  actionId: { type: String, required: true },
  ownerType: { type: String, required: true },
  canWriteStatus: { type: Boolean, default: false },
})

const { t, locale } = useI18n()
const locales = inject(NEXUS_LOCALES_KEY, { data: ['en'], defaultData: 'en' })
const formOpen = ref(false)
const editing = ref(null)
const { items, saving, errorMessage, insertItem, updateItem, removeItem } = useActionStatuses({
  actionId: toRef(props, 'actionId'),
})

const dialogTitle = computed(() =>
  editing.value?._id ? t('actions.editStatus') : t('actions.addStatus'),
)

function statusLabel(status) {
  return resolveLocalized(status.description, locale.value, locales)
}

function openCreate() {
  editing.value = null
  formOpen.value = true
}

function openEdit(status) {
  editing.value = status
  formOpen.value = true
}

async function onSave(payload) {
  if (editing.value?._id) {
    await updateItem({ id: editing.value._id, ...payload })
  } else {
    await insertItem(payload)
  }
  formOpen.value = false
  editing.value = null
}

async function onRemove(status) {
  await removeItem(status._id)
}
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-2">
      <div class="text-subtitle-2">{{ t('actions.status') }}</div>
      <v-btn
        v-if="canWriteStatus"
        size="small"
        variant="text"
        @click="openCreate"
      >
        {{ t('actions.addStatus') }}
      </v-btn>
    </div>
    <v-alert v-if="errorMessage" type="error" density="compact" class="mb-2">
      {{ errorMessage }}
    </v-alert>
    <v-list v-if="items.length" density="compact">
      <v-list-item v-for="status in items" :key="status._id">
        <v-list-item-title>
          {{ formatIsoDateForLocale(toIsoDate(status.asOf), locale) }}
        </v-list-item-title>
        <v-list-item-subtitle>{{ statusLabel(status) }}</v-list-item-subtitle>
        <template #append>
          <v-btn
            v-if="canWriteStatus"
            icon="mdi-pencil"
            variant="text"
            size="small"
            @click="openEdit(status)"
          />
          <v-btn
            v-if="canWriteStatus"
            icon="mdi-delete"
            variant="text"
            size="small"
            @click="onRemove(status)"
          />
        </template>
        <n-file-upload
          class="mt-2"
          :owner-type="`actionStatus.${ownerType}`"
          :owner-id="status._id"
          :disabled="!canWriteStatus"
        />
      </v-list-item>
    </v-list>
    <n-modal v-model="formOpen" :title="dialogTitle">
      <n-action-status-form
        :status="editing"
        :owner-type="ownerType"
        :saving="saving"
        :can-attach-files="Boolean(editing?._id)"
        @save="onSave"
        @cancel="formOpen = false"
      />
    </n-modal>
  </div>
</template>
