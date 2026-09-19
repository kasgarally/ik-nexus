<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Fields for one nexus_lists item (used inside a dialog)
-->
<script setup>
import { computed, inject, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { emptyLocalizedMap, NEXUS_LOCALES_KEY } from '../../i18n/createNexusI18n.js'
import { defaultLocales } from '../../i18n/locales.js'
import NTranslatableTextField from '../fields/NTranslatableTextField.vue'

const props = defineProps({
  creating: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  item: { type: Object, default: null },
})

const emit = defineEmits(['submit', 'cancel'])
const { t } = useI18n()
const locales = inject(NEXUS_LOCALES_KEY, defaultLocales())

const draft = reactive(emptyDraft())

watch(
  () => props.item,
  (item) => {
    applyItem(item)
  },
  { immediate: true },
)

const canSubmit = computed(() => {
  return Boolean(draft.code.trim() && String(draft.title[locales.defaultData] || '').trim())
})

function emptyDraft() {
  return {
    code: '',
    title: emptyLocalizedMap(locales.data),
    sortOrder: 0,
    active: true,
  }
}

function applyItem(item) {
  if (!item) {
    Object.assign(draft, emptyDraft())
    return
  }

  const title = emptyLocalizedMap(locales.data)
  for (const code of locales.data) {
    if (typeof item.title?.[code] === 'string') {
      title[code] = item.title[code]
    }
  }

  draft.code = item.code || ''
  draft.title = title
  draft.sortOrder = Number.isFinite(item.sortOrder) ? item.sortOrder : 0
  draft.active = item.active !== false
}

function onSubmit() {
  if (!canSubmit.value || props.disabled) {
    return
  }

  const title = {}
  for (const code of locales.data) {
    title[code] = String(draft.title[code] || '').trim()
  }

  emit('submit', {
    code: draft.code.trim(),
    title,
    sortOrder: Number(draft.sortOrder) || 0,
    active: Boolean(draft.active),
  })
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <v-text-field
      v-model="draft.code"
      :label="t('lists.code')"
      :disabled="disabled || !creating"
      :rules="[(value) => Boolean(String(value || '').trim()) || t('lists.codeRequired')]"
      autocomplete="off"
      class="mb-2"
    />
    <n-translatable-text-field
      v-model="draft.title"
      :label="t('lists.title')"
      :required="true"
      :disabled="disabled"
      autocomplete="off"
      class="mb-2"
    />
    <v-text-field
      v-model.number="draft.sortOrder"
      :label="t('lists.sortOrder')"
      :disabled="disabled"
      type="number"
      class="mb-2"
    />
    <v-switch
      v-model="draft.active"
      :label="t('lists.active')"
      :disabled="disabled"
      color="primary"
      class="mb-4"
    />
    <div class="d-flex justify-end ga-2">
      <v-btn variant="text" :disabled="disabled" type="button" @click="emit('cancel')">
        {{ t('lists.cancel') }}
      </v-btn>
      <v-btn color="primary" :disabled="disabled || !canSubmit" type="submit">
        {{ t('lists.save') }}
      </v-btn>
    </div>
  </form>
</template>
