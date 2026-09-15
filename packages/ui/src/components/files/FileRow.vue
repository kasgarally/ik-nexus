<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
One file: name, open in a new tab, remove
-->
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  file: { type: Object, required: true },
  downloadUrl: { type: String, required: true },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['remove'])
const { t } = useI18n()

const sizeLabel = computed(() => formatByteSize(props.file.size))

function formatByteSize(bytes) {
  if (!Number.isFinite(bytes)) {
    return ''
  }
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<template>
  <v-list-item :title="file.name" :subtitle="sizeLabel">
    <template #append>
      <v-btn
        :href="downloadUrl"
        target="_blank"
        rel="noopener"
        variant="text"
        :text="t('files.open')"
      />
      <v-btn
        variant="text"
        color="error"
        :disabled="disabled"
        :text="t('files.remove')"
        @click="emit('remove', file._id)"
      />
    </template>
  </v-list-item>
</template>
