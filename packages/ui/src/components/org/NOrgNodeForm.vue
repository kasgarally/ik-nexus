<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Fields for one nexus_org node (used inside a dialog)
-->
<script setup>
import { computed, inject, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Org } from '@nexus/org'
import { emptyLocalizedMap, NEXUS_LOCALES_KEY } from '../../i18n/createNexusI18n.js'
import { defaultLocales } from '../../i18n/locales.js'
import NTranslatableTextField from '../fields/NTranslatableTextField.vue'

const props = defineProps({
  creating: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
  item: { type: Object, default: null },
  parentId: { type: String, default: null },
  nodes: { type: Array, default: () => [] },
  blockedParentIds: { type: Array, default: () => [] },
})

const emit = defineEmits(['submit', 'cancel'])
const { t, locale } = useI18n()
const locales = inject(NEXUS_LOCALES_KEY, defaultLocales())

const draft = reactive(emptyDraft())

watch(
  () => [props.item, props.parentId],
  () => {
    applyItem(props.item, props.parentId)
  },
  { immediate: true },
)

const canSubmit = computed(() => {
  return Boolean(
    String(draft.type || '').trim() && String(draft.title[locales.defaultData] || '').trim(),
  )
})

const parentChoices = computed(() => {
  const blocked = new Set(props.blockedParentIds)
  return props.nodes
    .filter((node) => !blocked.has(node._id))
    .map((node) => ({
      title: Org.title(node, locale.value) || node.type,
      value: node._id,
    }))
})

function emptyDraft(parentId) {
  return {
    type: '',
    title: emptyLocalizedMap(locales.data),
    parentId: parentId || null,
    sortOrder: 0,
    active: true,
  }
}

function applyItem(item, parentId) {
  if (!item) {
    Object.assign(draft, emptyDraft(parentId))
    return
  }

  const title = emptyLocalizedMap(locales.data)
  for (const code of locales.data) {
    if (typeof item.title?.[code] === 'string') {
      title[code] = item.title[code]
    }
  }

  draft.type = item.type || ''
  draft.title = title
  draft.parentId = item.parentId || null
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
    type: draft.type.trim(),
    title,
    parentId: draft.parentId || null,
    sortOrder: Number(draft.sortOrder) || 0,
    active: Boolean(draft.active),
  })
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <n-translatable-text-field
      v-model="draft.title"
      :label="t('org.title')"
      :required="true"
      :disabled="disabled"
      autocomplete="off"
      class="mb-2"
    />
    <v-text-field
      v-model="draft.type"
      :label="t('org.type')"
      :hint="t('org.typeHint')"
      persistent-hint
      :disabled="disabled"
      autocomplete="off"
      class="mb-2"
    />
    <v-select
      v-model="draft.parentId"
      :items="parentChoices"
      :label="t('org.parent')"
      :disabled="disabled"
      clearable
      :placeholder="t('org.root')"
      class="mb-2"
    />
    <v-text-field
      v-model.number="draft.sortOrder"
      :label="t('org.sortOrder')"
      :disabled="disabled"
      type="number"
      class="mb-2"
    />
    <v-switch
      v-model="draft.active"
      :label="t('org.active')"
      :disabled="disabled"
      color="primary"
      class="mb-4"
    />
    <div class="d-flex justify-end ga-2">
      <v-btn variant="text" :disabled="disabled" type="button" @click="emit('cancel')">
        {{ t('org.cancel') }}
      </v-btn>
      <v-btn color="primary" :disabled="disabled || !canSubmit" type="submit">
        {{ t('org.save') }}
      </v-btn>
    </div>
  </form>
</template>
