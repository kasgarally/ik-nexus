<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
v-select of active list items for one listKey; value is code
-->
<script setup>
import { computed, toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { Lists } from '@nexus/lists'
import { useListItems } from './useListItems.js'

const props = defineProps({
  listKey: { type: String, required: true },
  modelValue: { type: String, default: null },
  label: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])
const { t, locale } = useI18n()
const { items } = useListItems({
  listKey: toRef(props, 'listKey'),
})

const inputLabel = computed(() => props.label || t('lists.select'))
const selectItems = computed(() =>
  items.value
    .filter((item) => item.active !== false)
    .map((item) => ({
      code: item.code,
      title: Lists.title(item, locale.value),
    })),
)
</script>

<template>
  <v-select
    :model-value="modelValue"
    :items="selectItems"
    item-value="code"
    item-title="title"
    :label="inputLabel"
    :disabled="disabled"
    clearable
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
