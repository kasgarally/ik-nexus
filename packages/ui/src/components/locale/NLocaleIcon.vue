<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Circular icon language picker; current UI code on the face
-->
<script setup>
import { computed, inject, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  applyDocumentLocale,
  DEFAULT_STORAGE_KEY,
  localeDisplayName,
  NEXUS_LOCALES_KEY,
  NEXUS_LOCALE_STORAGE_KEY,
  setAppLocale,
} from '../../i18n/createNexusI18n.js'
import { defaultLocales } from '../../i18n/locales.js'

const { locale, t, te } = useI18n()
const storageKey = inject(NEXUS_LOCALE_STORAGE_KEY, DEFAULT_STORAGE_KEY)
const locales = inject(NEXUS_LOCALES_KEY, defaultLocales())

const visible = computed(() => locales.ui.length > 1)

const uiItems = computed(() =>
  locales.ui.map((code) => ({
    code,
    short: localeShortCode(code),
    label: localeDisplayName(code, t, te),
  })),
)

const currentCode = computed(() => localeShortCode(locale.value))

function localeShortCode(code) {
  const value = typeof code === 'string' ? code.trim() : ''
  const primary = value.split('-')[0] || value
  return primary.slice(0, 2).toUpperCase()
}

function setLocale(code) {
  setAppLocale(locale, code, storageKey, locales)
}

onMounted(() => {
  applyDocumentLocale(locale.value)
})
</script>

<template>
  <v-menu v-if="visible">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        :aria-label="t('locale.label')"
        :aria-haspopup="true"
      >
        <span class="n-locale-icon-code">{{ currentCode }}</span>
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        v-for="item in uiItems"
        :key="item.code"
        :title="item.label"
        :subtitle="item.short"
        :active="locale === item.code"
        @click="setLocale(item.code)"
      />
    </v-list>
  </v-menu>
</template>

<style scoped>
.n-locale-icon-code {
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 1;
}
</style>
