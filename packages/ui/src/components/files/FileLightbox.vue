<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Full-screen image lightbox over the app
-->
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  files: { type: Array, default: () => [] },
  index: { type: Number, default: 0 },
  downloadUrlFor: { type: Function, required: true },
})

const emit = defineEmits(['update:modelValue', 'update:index'])
const { t } = useI18n()

const current = computed(() => props.files[props.index] || null)
const imageUrl = computed(() => (current.value ? props.downloadUrlFor(current.value._id) : ''))
const canGoPrevious = computed(() => props.index > 0)
const canGoNext = computed(() => props.index < props.files.length - 1)

function closeLightbox() {
  emit('update:modelValue', false)
}

function showPrevious() {
  if (canGoPrevious.value) {
    emit('update:index', props.index - 1)
  }
}

function showNext() {
  if (canGoNext.value) {
    emit('update:index', props.index + 1)
  }
}
</script>

<template>
  <v-overlay
    :model-value="modelValue"
    class="align-center justify-center"
    scrim="black"
    opacity="0.85"
    z-index="2400"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="file-lightbox d-flex flex-column align-center ga-4 pa-4">
      <div class="d-flex ga-2">
        <v-btn
          icon="mdi-chevron-left"
          variant="text"
          color="white"
          :disabled="!canGoPrevious"
          :aria-label="t('files.previous')"
          @click="showPrevious"
        />
        <v-btn
          icon="mdi-close"
          variant="text"
          color="white"
          :aria-label="t('files.close')"
          @click="closeLightbox"
        />
        <v-btn
          icon="mdi-chevron-right"
          variant="text"
          color="white"
          :disabled="!canGoNext"
          :aria-label="t('files.next')"
          @click="showNext"
        />
      </div>
      <v-img
        v-if="current"
        :src="imageUrl"
        :alt="current.name"
        max-width="90vw"
        max-height="80vh"
        contain
      />
      <p v-if="current" class="text-white">{{ current.name }}</p>
    </div>
  </v-overlay>
</template>
