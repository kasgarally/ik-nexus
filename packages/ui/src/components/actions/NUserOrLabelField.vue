<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Combobox: Meteor user from accounts.directory or an external name
-->
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDirectoryUsers } from './useDirectoryUsers.js'

const props = defineProps({
  userId: { type: String, default: null },
  label: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:userId', 'update:label'])
const { t } = useI18n()
const { people } = useDirectoryUsers()

const selected = computed(() => {
  if (props.userId) {
    return people.value.find((person) => person.value === props.userId) || props.label
  }
  return props.label || null
})

function onPick(value) {
  if (value && typeof value === 'object' && value.value) {
    emit('update:userId', value.value)
    emit('update:label', value.title)
    return
  }
  if (typeof value === 'string' && value.trim()) {
    emit('update:userId', null)
    emit('update:label', value.trim())
    return
  }
  emit('update:userId', null)
  emit('update:label', '')
}
</script>

<template>
  <v-combobox
    :model-value="selected"
    :items="people"
    item-title="title"
    item-value="value"
    :label="t('actions.assignee')"
    :hint="t('actions.assigneeHint')"
    persistent-hint
    :disabled="disabled"
    clearable
    @update:model-value="onPick"
  />
</template>
