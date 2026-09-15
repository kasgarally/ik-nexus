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
  NEXUS_LOCALE_STORAGE_KEY,
  setAppLocale,
  supportedLocales,
} from '../../i18n/createNexusI18n.js'

const { locale, t } = useI18n()
const storageKey = inject(NEXUS_LOCALE_STORAGE_KEY, DEFAULT_STORAGE_KEY)

const currentLabel = computed(() => {
  const match = supportedLocales.find((item) => item.code === locale.value)
  return match ? t(match.labelKey) : locale.value
})

function setLocale(code) {
  setAppLocale(locale, code, storageKey)
}

onMounted(() => {
  applyDocumentLocale(locale.value)
})
</script>

<template>
  <v-menu>
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
        v-for="item in supportedLocales"
        :key="item.code"
        :title="t(item.labelKey)"
        :active="locale === item.code"
        @click="setLocale(item.code)"
      />
    </v-list>
  </v-menu>
</template>
