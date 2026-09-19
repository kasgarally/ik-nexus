<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Create or edit an action status row
-->
<script setup>
import { inject, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { emptyLocalizedMap, NEXUS_LOCALES_KEY } from '../../i18n/createNexusI18n.js'
import { parseIsoDate, toIsoDate } from '../pickers/dateTime.js'
import NDatePicker from '../pickers/NDatePicker.vue'
import NFileUpload from '../files/NFileUpload.vue'
import NTranslatableTextarea from '../fields/NTranslatableTextarea.vue'

const props = defineProps({
  status: { type: Object, default: null },
  ownerType: { type: String, default: '' },
  saving: { type: Boolean, default: false },
  canAttachFiles: { type: Boolean, default: false },
})

const emit = defineEmits(['save', 'cancel'])
const { t } = useI18n()
const locales = inject(NEXUS_LOCALES_KEY, { data: ['en'], defaultData: 'en' })

const draft = reactive({
  asOf: toIsoDate(new Date()),
  description: emptyLocalizedMap(locales.data),
})

watch(
  () => props.status,
  (status) => {
    draft.asOf = toIsoDate(status?.asOf || new Date())
    draft.description = { ...(status?.description || emptyLocalizedMap(locales.data)) }
  },
  { immediate: true },
)

function onSave() {
  emit('save', {
    asOf: parseIsoDate(draft.asOf),
    description: draft.description,
  })
}
</script>

<template>
  <v-form @submit.prevent="onSave">
    <n-date-picker v-model="draft.asOf" :label="t('actions.asOf')" required class="mb-3" />
    <n-translatable-textarea
      v-model="draft.description"
      :label="t('actions.description')"
      required
      class="mb-3"
    />
    <n-file-upload
      v-if="canAttachFiles && status?._id && ownerType"
      :owner-type="`actionStatus.${ownerType}`"
      :owner-id="status._id"
      class="mb-3"
    />
    <div class="d-flex justify-end ga-2">
      <v-btn variant="text" @click="emit('cancel')">{{ t('actions.cancel') }}</v-btn>
      <v-btn type="submit" color="primary" :loading="saving">{{ t('actions.save') }}</v-btn>
    </div>
  </v-form>
</template>
