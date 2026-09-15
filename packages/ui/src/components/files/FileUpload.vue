<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Multiple files: document list or image grid with lightbox
-->
<script setup>
import { computed, ref, toRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { ALLOWED_MIME_TYPES, IMAGE_MIME_TYPES } from '@nexus/files'
import FileLightbox from './FileLightbox.vue'
import FileRow from './FileRow.vue'
import { useOwnerFiles } from './useOwnerFiles.js'

const props = defineProps({
  ownerType: { type: String, required: true },
  ownerId: { type: String, required: true },
  variant: { type: String, default: 'document' },
  accept: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  label: { type: String, default: '' },
  thumbnailWidth: { type: Number, default: 140 },
  thumbnailHeight: { type: Number, default: 140 },
})

const { t } = useI18n()
const selected = ref([])
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)
const isGallery = computed(() => props.variant === 'images')
const acceptTypes = computed(() => {
  if (props.accept) {
    return props.accept
  }
  return isGallery.value ? IMAGE_MIME_TYPES.join(',') : ALLOWED_MIME_TYPES.join(',')
})
const inputLabel = computed(() => props.label || t('files.upload'))
const thumbnailStyle = computed(() => ({
  width: `${props.thumbnailWidth}px`,
  height: `${props.thumbnailHeight}px`,
}))

const {
  documents,
  uploading,
  errorMessage,
  uploadFile,
  removeFile,
  fileDownloadUrl,
} = useOwnerFiles({
  ownerType: toRef(props, 'ownerType'),
  ownerId: toRef(props, 'ownerId'),
})

async function onSelect(value) {
  const files = Array.isArray(value) ? value : value ? [value] : []
  selected.value = []
  for (const file of files) {
    if (!file) {
      continue
    }
    await uploadFile(file)
  }
}

function openLightbox(index) {
  lightboxIndex.value = index
  lightboxOpen.value = true
}
</script>

<template>
  <div>
    <v-file-input
      v-model="selected"
      :label="inputLabel"
      :accept="acceptTypes"
      :disabled="disabled || uploading"
      :clearable="false"
      multiple
      prepend-icon="mdi-paperclip"
      @update:model-value="onSelect"
    />
    <v-progress-linear v-if="uploading" indeterminate class="mb-2" />
    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-2">
      {{ errorMessage }}
    </v-alert>
    <template v-if="isGallery">
      <div v-if="documents.length" class="d-flex flex-wrap ga-3">
        <div v-for="(file, index) in documents" :key="file._id" class="file-upload-tile">
          <button
            type="button"
            class="file-upload-thumb"
            :style="thumbnailStyle"
            :aria-label="file.name"
            @click="openLightbox(index)"
          >
            <v-img
              :src="fileDownloadUrl(file._id)"
              :alt="file.name"
              :width="thumbnailWidth"
              :height="thumbnailHeight"
              cover
            />
          </button>
          <v-btn
            size="small"
            variant="text"
            color="error"
            :disabled="disabled || uploading"
            :text="t('files.remove')"
            @click="removeFile(file._id)"
          />
        </div>
      </div>
      <p v-else class="text-medium-emphasis">{{ t('files.empty') }}</p>
      <FileLightbox
        v-model="lightboxOpen"
        v-model:index="lightboxIndex"
        :files="documents"
        :download-url-for="fileDownloadUrl"
      />
    </template>
    <template v-else>
      <v-list v-if="documents.length" lines="two">
        <FileRow
          v-for="file in documents"
          :key="file._id"
          :file="file"
          :download-url="fileDownloadUrl(file._id)"
          :disabled="disabled || uploading"
          @remove="removeFile"
        />
      </v-list>
      <p v-else class="text-medium-emphasis">{{ t('files.empty') }}</p>
    </template>
  </div>
</template>

<style scoped>
.file-upload-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.file-upload-thumb {
  padding: 0;
  overflow: hidden;
  border: 1px solid currentColor;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
}
</style>
