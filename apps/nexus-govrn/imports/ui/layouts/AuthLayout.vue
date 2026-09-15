<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Sign-in layout
-->
<script setup>
import { LocaleSelect } from '@nexus/ui'
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify'

const theme = useTheme()
const { t } = useI18n()

function toggleTheme() {
  theme.toggle()
}
</script>

<template>
  <v-app-bar flat>
    <v-app-bar-title>{{ t('brand') }}</v-app-bar-title>
    <v-spacer />
    <LocaleSelect class="me-2" />
    <v-btn icon="mdi-theme-light-dark" :aria-label="t('themeToggle')" @click="toggleTheme" />
  </v-app-bar>

  <v-main class="d-flex align-center justify-center">
    <v-container class="py-12" style="max-width: 480px">
      <router-view />
    </v-container>
  </v-main>
</template>
