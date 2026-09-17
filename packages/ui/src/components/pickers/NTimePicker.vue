<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Text field that opens v-time-picker; v-model is HH:mm
-->
<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatIsoTimeForLocale, toIsoTime } from './dateTime.js'

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
  min: { type: String, default: undefined },
  max: { type: String, default: undefined },
  density: { type: String, default: undefined },
  // Omit these so the host app’s Vuetify defaults (VTimePicker) control look.
  color: { type: String, default: undefined },
  rounded: { type: [String, Number, Boolean], default: undefined },
  ampm: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])
const { t, locale } = useI18n()
const menuOpen = ref(false)

const isoValue = computed(() => toIsoTime(props.modelValue))
const displayValue = computed(() => formatIsoTimeForLocale(isoValue.value, locale.value))
const pickerFormat = computed(() => (props.ampm ? 'ampm' : '24hr'))
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

// Validate the stored HH:mm value, not the locale-formatted text in the field.
const fieldRules = computed(() =>
  props.rules.map((rule) => () => rule(isoValue.value)),
)

function onPick(value) {
  emit('update:modelValue', toIsoTime(value))
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
        prepend-inner-icon="mdi-clock-outline"
        :aria-label="label || t('pickers.chooseTime')"
        readonly
        autocomplete="off"
        @click:append-inner.stop="clear"
      />
    </template>
    <v-card>
      <v-time-picker
        v-bind="pickerLook"
        :model-value="isoValue || null"
        :format="pickerFormat"
        :min="min"
        :max="max"
        :title="label || t('pickers.time')"
        @update:model-value="onPick"
      />
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="menuOpen = false">
          {{ t('pickers.done') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>
