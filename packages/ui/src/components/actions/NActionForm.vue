<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Create or edit an action (maps, assignee, due date, completed)
-->
<script setup>
import { computed, inject, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { emptyLocalizedMap, NEXUS_LOCALES_KEY } from '../../i18n/createNexusI18n.js'
import { parseIsoDate, toIsoDate } from '../pickers/dateTime.js'
import NDatePicker from '../pickers/NDatePicker.vue'
import NTranslatableTextarea from '../fields/NTranslatableTextarea.vue'
import NTranslatableTextField from '../fields/NTranslatableTextField.vue'
import NUserOrLabelField from './NUserOrLabelField.vue'

const props = defineProps({
  action: { type: Object, default: null },
  canWrite: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['save', 'cancel'])
const { t } = useI18n()
const locales = inject(NEXUS_LOCALES_KEY, { data: ['en'], defaultData: 'en' })

const draft = reactive({
  title: emptyLocalizedMap(locales.data),
  description: emptyLocalizedMap(locales.data),
  byWhoUserId: null,
  byWhoLabel: '',
  byWhen: '',
  completed: false,
})

watch(
  () => props.action,
  (action) => {
    draft.title = { ...(action?.title || emptyLocalizedMap(locales.data)) }
    draft.description = { ...(action?.description || emptyLocalizedMap(locales.data)) }
    draft.byWhoUserId = action?.byWhoUserId || null
    draft.byWhoLabel = action?.byWhoLabel || ''
    draft.byWhen = toIsoDate(action?.byWhen)
    draft.completed = Boolean(action?.completed)
  },
  { immediate: true },
)

const showCompleted = computed(() => Boolean(props.action?._id) && props.canWrite)

function onSave() {
  const payload = {
    title: draft.title,
    description: draft.description,
    byWhoUserId: draft.byWhoUserId || null,
    byWhoLabel: draft.byWhoLabel || '',
    byWhen: parseIsoDate(draft.byWhen),
  }
  if (showCompleted.value) {
    payload.completed = draft.completed
  }
  emit('save', payload)
}
</script>

<template>
  <v-form @submit.prevent="onSave">
    <n-translatable-text-field
      v-model="draft.title"
      :label="t('actions.title')"
      required
      class="mb-3"
    />
    <n-translatable-textarea
      v-model="draft.description"
      :label="t('actions.description')"
      required
      class="mb-3"
    />
    <n-user-or-label-field
      v-model:user-id="draft.byWhoUserId"
      v-model:label="draft.byWhoLabel"
      :disabled="!canWrite && Boolean(action)"
      class="mb-3"
    />
    <n-date-picker
      v-model="draft.byWhen"
      :label="t('actions.byWhen')"
      required
      class="mb-3"
    />
    <v-checkbox
      v-if="showCompleted"
      v-model="draft.completed"
      :label="t('actions.completed')"
      hide-details
      class="mb-3"
    />
    <div class="d-flex justify-end ga-2">
      <v-btn variant="text" @click="emit('cancel')">{{ t('actions.cancel') }}</v-btn>
      <v-btn type="submit" color="primary" :loading="saving">{{ t('actions.save') }}</v-btn>
    </div>
  </v-form>
</template>
