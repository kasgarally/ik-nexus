<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Fields for one nexus_lists item (used inside a dialog)
-->
<script setup>
import { computed, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  creating: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  item: { type: Object, default: null },
})

const emit = defineEmits(['submit', 'cancel'])
const { t } = useI18n()

const draft = reactive(emptyDraft())

watch(
  () => props.item,
  (item) => {
    applyItem(item)
  },
  { immediate: true },
)

const canSubmit = computed(() => {
  return Boolean(draft.code.trim() && draft.titleEn.trim())
})

function emptyDraft() {
  return {
    code: '',
    titleEn: '',
    titleFr: '',
    titleAr: '',
    sortOrder: 0,
    active: true,
  }
}

function applyItem(item) {
  if (!item) {
    Object.assign(draft, emptyDraft())
    return
  }

  draft.code = item.code || ''
  draft.titleEn = item.title?.en || ''
  draft.titleFr = item.title?.fr || ''
  draft.titleAr = item.title?.ar || ''
  draft.sortOrder = Number.isFinite(item.sortOrder) ? item.sortOrder : 0
  draft.active = item.active !== false
}

function onSubmit() {
  if (!canSubmit.value || props.disabled) {
    return
  }

  emit('submit', {
    code: draft.code.trim(),
    title: {
      en: draft.titleEn.trim(),
      fr: draft.titleFr.trim(),
      ar: draft.titleAr.trim(),
    },
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
    <v-text-field
      v-model="draft.titleEn"
      :label="t('lists.titleEn')"
      :disabled="disabled"
      :rules="[(value) => Boolean(String(value || '').trim()) || t('lists.titleEnRequired')]"
      autocomplete="off"
      class="mb-2"
    />
    <v-text-field
      v-model="draft.titleFr"
      :label="t('lists.titleFr')"
      :disabled="disabled"
      autocomplete="off"
      class="mb-2"
    />
    <v-text-field
      v-model="draft.titleAr"
      :label="t('lists.titleAr')"
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
