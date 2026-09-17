<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Text field that opens v-date-picker; v-model is YYYY-MM-DD
-->
<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatIsoDateForLocale, parseIsoDate, toIsoDate } from './dateTime.js'

const props = defineProps({
  modelValue: { type: [String, Date], default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  clearable: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  rules: { type: Array, default: () => [] },
  hideDetails: { type: [Boolean, String], default: 'auto' },
  id: { type: String, default: undefined },
  min: { type: [String, Date], default: undefined },
  max: { type: [String, Date], default: undefined },
  density: { type: String, default: undefined },
  // Omit these so the host app’s Vuetify defaults (VDatePicker) control look.
  color: { type: String, default: undefined },
  rounded: { type: [String, Number, Boolean], default: undefined },
})

const emit = defineEmits(['update:modelValue'])
const { t, locale } = useI18n()
const menuOpen = ref(false)

const isoValue = computed(() => toIsoDate(props.modelValue))
const pickerValue = computed(() => parseIsoDate(isoValue.value))
const displayValue = computed(() => formatIsoDateForLocale(isoValue.value, locale.value))
const minDate = computed(() => toIsoDate(props.min) || undefined)
const maxDate = computed(() => toIsoDate(props.max) || undefined)
const clearIcon = computed(() => (props.clearable && isoValue.value ? 'mdi-close' : undefined))
const pickerLook = computed(() => {
  const look = {}
  if (props.color != null) {
    look.color = props.color
  }
  if (props.rounded != null) {
    look.rounded = props.rounded
  }
  return look
})

// Validate the stored ISO value, not the locale-formatted text in the field.
const fieldRules = computed(() =>
  props.rules.map((rule) => () => rule(isoValue.value)),
)

function onPick(value) {
  emit('update:modelValue', toIsoDate(value))
  menuOpen.value = false
}

function clear() {
  emit('update:modelValue', '')
}
</script>

<template>
  <v-menu
    v-model="menuOpen"
    :close-on-content-click="false"
    :disabled="disabled"
    location="bottom start"
    offset="8"
  >
    <template #activator="{ props: menuProps }">
      <v-text-field
        v-bind="menuProps"
        :id="id"
        :model-value="displayValue"
        :label="label || undefined"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :rules="fieldRules"
        :hide-details="hideDetails"
        :density="density"
        :append-inner-icon="clearIcon"
        prepend-inner-icon="mdi-calendar"
        :aria-label="label || t('pickers.chooseDate')"
        readonly
        autocomplete="off"
        @click:append-inner.stop="clear"
      />
    </template>
    <v-date-picker
      v-bind="pickerLook"
      :model-value="pickerValue"
      :min="minDate"
      :max="maxDate"
      :title="label || t('pickers.date')"
      @update:model-value="onPick"
    />
  </v-menu>
</template>
