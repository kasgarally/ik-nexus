<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Language selector
-->
<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { applyDocumentLocale, setAppLocale, supportedLocales } from '../i18n/index.js'

const { locale, t } = useI18n()

const currentLabel = computed(() => {
  const match = supportedLocales.find((item) => item.code === locale.value)
  return match ? t(match.labelKey) : locale.value
})

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
        @click="setAppLocale(item.code)"
      />
    </v-list>
  </v-menu>
</template>
