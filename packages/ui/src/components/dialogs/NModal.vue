<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Vuetify dialog with title, close, and a default slot for forms
-->
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  maxWidth: { type: [Number, String], default: 720 },
  persistent: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

const isOpen = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  },
})

function open() {
  isOpen.value = true
}

function close() {
  isOpen.value = false
}

defineExpose({
  open,
  close,
})
</script>

<template>
  <v-dialog v-model="isOpen" :max-width="maxWidth" :persistent="persistent" scrollable>
    <template v-if="$slots.activator" #activator="{ props: activatorProps }">
      <slot name="activator" :props="activatorProps" />
    </template>
    <v-card>
      <v-card-title class="d-flex align-center">
        <span class="text-wrap">{{ title }}</span>
        <v-spacer />
        <v-btn
          icon="mdi-close"
          variant="text"
          :aria-label="t('ui.modal.close')"
          @click="close"
        />
      </v-card-title>
      <v-card-text>
        <slot :close="close" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
