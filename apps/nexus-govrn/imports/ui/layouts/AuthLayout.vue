<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Sign-in layout
-->
<script setup>
import { computed } from 'vue'
import { NLocaleSelect } from '@nexus/ui'
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify'
import { usePublicSetup } from '../usePublicSetup.js'

const theme = useTheme()
const { t } = useI18n()
const { companyName, iconDataUrl } = usePublicSetup()
const title = computed(() => companyName.value || t('brand'))

function toggleTheme() {
  theme.toggle()
}
</script>

<template>
  <v-app-bar flat>
    <v-avatar v-if="iconDataUrl" size="32" class="ms-2 me-2">
      <v-img :src="iconDataUrl" :alt="title" />
    </v-avatar>
    <v-app-bar-title>{{ title }}</v-app-bar-title>
    <v-spacer />
    <n-locale-select class="me-2" />
    <v-btn icon="mdi-theme-light-dark" :aria-label="t('themeToggle')" @click="toggleTheme" />
  </v-app-bar>

  <v-main class="d-flex align-center justify-center">
    <v-container class="py-12" style="max-width: 480px">
      <router-view />
    </v-container>
  </v-main>
</template>
