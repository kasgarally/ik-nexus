<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Wide first-run layout without a drawer
-->
<script setup>
import { computed } from 'vue'
import { LocaleSelect } from '@nexus/ui'
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
    <LocaleSelect class="me-2" />
    <v-btn icon="mdi-theme-light-dark" :aria-label="t('themeToggle')" @click="toggleTheme" />
  </v-app-bar>

  <v-main>
    <v-container class="py-8" style="max-width: 960px">
      <router-view />
    </v-container>
  </v-main>
</template>
