<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Split sign-in layout: settings hero plus auth card
-->
<script setup>
import { Meteor } from 'meteor/meteor'
import { computed } from 'vue'
import { NLocaleIcon } from '@nexus/ui'
import { useI18n } from 'vue-i18n'
import { useTheme } from 'vuetify'
import { usePublicSetup } from '../usePublicSetup.js'

const theme = useTheme()
const { t } = useI18n()
const { companyName, iconDataUrl } = usePublicSetup()
const title = computed(() => companyName.value || t('brand'))
const heroImage = Meteor.settings?.public?.accounts?.heroImage || ''
const heroStyle = computed(() => heroBackgroundStyle(heroImage))

function toggleTheme() {
  theme.toggle()
}

function heroBackgroundStyle(raw) {
  const image = cssBackgroundImage(raw)
  if (!image) {
    return {
      backgroundImage: 'linear-gradient(160deg, #0f2c4c 0%, #1d6b8a 55%, #c5a46e 100%)',
    }
  }
  return {
    backgroundImage: `${image}, linear-gradient(160deg, #0f2c4c, #1d6b8a)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
}

function cssBackgroundImage(raw) {
  if (typeof raw !== 'string' || !raw.trim()) {
    return ''
  }
  const value = raw.trim()
  if (value.startsWith('/') && !value.startsWith('//')) {
    return `url("${value}")`
  }
  try {
    const parsed = new URL(value)
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return `url("${parsed.href}")`
    }
  } catch {
    return ''
  }
  return ''
}
</script>

<template>
  <v-app-bar flat>
    <v-avatar v-if="iconDataUrl" size="32" class="ms-2 me-2">
      <v-img :src="iconDataUrl" :alt="title" />
    </v-avatar>
    <v-app-bar-title>{{ title }}</v-app-bar-title>
    <v-spacer />
    <n-locale-icon />
    <v-btn icon="mdi-theme-light-dark" :aria-label="t('themeToggle')" @click="toggleTheme" />
  </v-app-bar>

  <v-main class="auth-main">
    <div class="auth-split">
      <div class="auth-hero" :style="heroStyle" role="img" :aria-label="t('auth.hero')" />
      <div class="auth-panel">
        <router-view />
      </div>
    </div>
  </v-main>
</template>

<style scoped>
.auth-main {
  min-height: 100%;
}
.auth-split {
  display: flex;
  min-height: calc(100vh - 64px);
}
.auth-hero {
  flex: 1 1 50%;
  min-height: 220px;
}
.auth-panel {
  flex: 0 0 min(480px, 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
}
@media (max-width: 960px) {
  .auth-split {
    flex-direction: column;
  }
  .auth-hero {
    flex: 0 0 28vh;
  }
  .auth-panel {
    flex: 1 1 auto;
    width: 100%;
  }
}
</style>
