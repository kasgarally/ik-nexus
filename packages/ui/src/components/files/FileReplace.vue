<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Single file replace: document field or clickable avatar
-->
<script setup>
import { computed, ref, toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { DOCUMENT_MIME_TYPES, IMAGE_MIME_TYPES } from '@nexus/files'
import FileRow from './FileRow.vue'
import { useOwnerFiles } from './useOwnerFiles.js'

const props = defineProps({
  ownerType: { type: String, required: true },
  ownerId: { type: String, required: true },
  variant: { type: String, default: 'document' },
  accept: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  label: { type: String, default: '' },
  shape: { type: String, default: 'round' },
  width: { type: Number, default: 96 },
  height: { type: Number, default: 96 },
})

const { t } = useI18n()
const selected = ref(null)
const hiddenPicker = ref(null)
const isAvatar = computed(() => props.variant === 'avatar')
const acceptTypes = computed(() => {
  if (props.accept) {
    return props.accept
  }
  return isAvatar.value ? IMAGE_MIME_TYPES.join(',') : DOCUMENT_MIME_TYPES.join(',')
})
const inputLabel = computed(() => props.label || t('files.replace'))
const previewStyle = computed(() => ({
  width: `${props.width}px`,
  height: `${props.height}px`,
  borderRadius: props.shape === 'square' ? '8px' : '50%',
}))

const {
  documents,
  uploading,
  errorMessage,
  replaceFile,
  removeFile,
  fileDownloadUrl,
} = useOwnerFiles({
  ownerType: toRef(props, 'ownerType'),
  ownerId: toRef(props, 'ownerId'),
})

const current = computed(() => documents.value[0] || null)

async function applyReplacement(file) {
  selected.value = null
  if (!file) {
    return
  }
  await replaceFile(file)
}

function onInputSelect(value) {
  const file = Array.isArray(value) ? value[0] : value
  return applyReplacement(file)
}

function openHiddenPicker() {
  if (props.disabled || uploading.value) {
    return
  }
  hiddenPicker.value?.click()
}

function onHiddenPickerChange(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  return applyReplacement(file)
}
</script>

<template>
  <div>
    <template v-if="isAvatar">
      <div class="d-flex justify-center mb-2">
        <button
          type="button"
          class="file-replace-avatar"
          :style="previewStyle"
          :disabled="disabled || uploading"
          :aria-label="inputLabel"
          @click="openHiddenPicker"
        >
          <v-img
            v-if="current"
            :src="fileDownloadUrl(current._id)"
            :alt="current.name"
            :width="width"
            :height="height"
            cover
          />
          <v-icon v-else size="36">mdi-camera-plus</v-icon>
        </button>
        <input
          ref="hiddenPicker"
          type="file"
          class="d-none"
          :accept="acceptTypes"
          :disabled="disabled || uploading"
          @change="onHiddenPickerChange"
        />
      </div>
    </template>
    <template v-else>
      <v-file-input
        v-model="selected"
        :label="inputLabel"
        :accept="acceptTypes"
        :disabled="disabled || uploading"
        :clearable="false"
        prepend-icon="mdi-paperclip"
        @update:model-value="onInputSelect"
      />
      <v-list v-if="current" lines="two">
        <FileRow
          :file="current"
          :download-url="fileDownloadUrl(current._id)"
          :disabled="disabled || uploading"
          @remove="removeFile"
        />
      </v-list>
      <p v-else class="text-medium-emphasis">{{ t('files.empty') }}</p>
    </template>
    <v-progress-linear v-if="uploading" indeterminate class="mb-2" />
    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-2">
      {{ errorMessage }}
    </v-alert>
  </div>
</template>

<style scoped>
.file-replace-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  overflow: hidden;
  border: 1px dashed currentColor;
  background: transparent;
  cursor: pointer;
  color: inherit;
}

.file-replace-avatar:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
