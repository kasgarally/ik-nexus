<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Language selector
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
    label: localeDisplayName(code, t, te),
  })),
)

const currentLabel = computed(() => {
  const match = uiItems.value.find((item) => item.code === locale.value)
  return match ? match.label : locale.value
})

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
        variant="text"
        prepend-icon="mdi-translate"
        :aria-label="t('locale.label')"
      >
        {{ currentLabel }}
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        v-for="item in uiItems"
        :key="item.code"
        :title="item.label"
        :active="locale === item.code"
        @click="setLocale(item.code)"
      />
    </v-list>
  </v-menu>
</template>
