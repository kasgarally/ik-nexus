<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Actions for one parent (ownerType + ownerId)
-->
<script setup>
import { computed, ref, toRef } from 'vue'
import { inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { NEXUS_LOCALES_KEY, resolveLocalized } from '../../i18n/createNexusI18n.js'
import { formatIsoDateForLocale, toIsoDate } from '../pickers/dateTime.js'
import NFileUpload from '../files/NFileUpload.vue'
import NModal from '../dialogs/NModal.vue'
import NActionForm from './NActionForm.vue'
import NActionStatusTimeline from './NActionStatusTimeline.vue'
import { useOwnerActions } from './useOwnerActions.js'

const props = defineProps({
  ownerType: { type: String, required: true },
  ownerId: { type: String, required: true },
  canWrite: { type: Boolean, default: false },
  currentUserId: { type: String, default: '' },
})

const { t, locale } = useI18n()
const locales = inject(NEXUS_LOCALES_KEY, { data: ['en'], defaultData: 'en' })
const formOpen = ref(false)
const editing = ref(null)
const expandedId = ref('')
const { items, saving, errorMessage, insertItem, updateItem, removeItem } = useOwnerActions({
  ownerType: toRef(props, 'ownerType'),
  ownerId: toRef(props, 'ownerId'),
})

const dialogTitle = computed(() => (editing.value?._id ? t('actions.edit') : t('actions.add')))

function actionTitle(action) {
  return resolveLocalized(action.title, locale.value, locales)
}

function isOverdue(action) {
  if (action.completed || !action.byWhen) {
    return false
  }
  const due = new Date(action.byWhen)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return due < today
}

function canWriteStatus(action) {
  return props.canWrite || (props.currentUserId && action.byWhoUserId === props.currentUserId)
}

function openCreate() {
  editing.value = null
  formOpen.value = true
}

function openEdit(action) {
  editing.value = action
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

async function onRemove(action) {
  await removeItem(action._id)
}
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-3">
      <v-btn v-if="canWrite" color="primary" @click="openCreate">{{ t('actions.add') }}</v-btn>
    </div>
    <v-alert v-if="errorMessage" type="error" density="compact" class="mb-2">
      {{ errorMessage }}
    </v-alert>
    <v-alert v-if="!items.length" type="info" variant="tonal" density="compact">
      {{ t('actions.empty') }}
    </v-alert>
    <v-expansion-panels v-if="items.length" v-model="expandedId" variant="accordion">
      <v-expansion-panel v-for="action in items" :key="action._id" :value="action._id">
        <v-expansion-panel-title>
          <div class="d-flex flex-column">
            <div>{{ actionTitle(action) }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ action.byWhoLabel }}
              ·
              {{ formatIsoDateForLocale(toIsoDate(action.byWhen), locale) }}
              <v-chip
                v-if="action.completed"
                size="x-small"
                class="ml-2"
                color="success"
              >
                {{ t('actions.completed') }}
              </v-chip>
              <v-chip
                v-else-if="isOverdue(action)"
                size="x-small"
                class="ml-2"
                color="warning"
              >
                {{ t('actions.overdue') }}
              </v-chip>
            </div>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="d-flex justify-end ga-2 mb-3">
            <v-btn
              v-if="canWrite"
              size="small"
              variant="text"
              @click="openEdit(action)"
            >
              {{ t('actions.edit') }}
            </v-btn>
            <v-btn
              v-if="canWrite"
              size="small"
              variant="text"
              color="error"
              @click="onRemove(action)"
            >
              {{ t('ui.remove.confirm') }}
            </v-btn>
          </div>
          <n-file-upload
            class="mb-4"
            :owner-type="`action.${ownerType}`"
            :owner-id="action._id"
            :disabled="!canWriteStatus(action)"
          />
          <n-action-status-timeline
            :action-id="action._id"
            :owner-type="ownerType"
            :can-write-status="canWriteStatus(action)"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
    <n-modal v-model="formOpen" :title="dialogTitle">
      <n-action-form
        :action="editing"
        :can-write="canWrite"
        :saving="saving"
        @save="onSave"
        @cancel="formOpen = false"
      />
    </n-modal>
  </div>
</template>
