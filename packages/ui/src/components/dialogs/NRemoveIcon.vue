<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Error delete icon plus a Vuetify confirm dialog
-->
<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  title: { type: String, default: '' },
  text: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  ariaLabel: { type: String, default: '' },
})

const emit = defineEmits(['confirm'])
const { t } = useI18n()
const confirmOpen = ref(false)

function openConfirm() {
  if (props.disabled) {
    return
  }
  confirmOpen.value = true
}

function cancel() {
  confirmOpen.value = false
}

function confirm() {
  confirmOpen.value = false
  emit('confirm')
}
</script>

<template>
  <span>
    <v-btn
      icon="mdi-delete-outline"
      variant="text"
      color="error"
      :disabled="disabled"
      :aria-label="ariaLabel || t('ui.remove.aria')"
      @click="openConfirm"
    />
    <v-dialog v-model="confirmOpen" max-width="420">
      <v-card>
        <v-card-title>{{ title || t('ui.remove.title') }}</v-card-title>
        <v-card-text>{{ text || t('ui.remove.text') }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="cancel">{{ t('ui.remove.cancel') }}</v-btn>
          <v-btn color="error" @click="confirm">{{ t('ui.remove.confirm') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </span>
</template>
