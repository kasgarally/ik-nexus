<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Web app layout with optional context panel
-->
<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useDisplay, useTheme } from 'vuetify'
import LocaleSelect from '../components/LocaleSelect.vue'

const route = useRoute()
const theme = useTheme()
const { lgAndUp } = useDisplay()
const { t } = useI18n()
const drawer = ref(lgAndUp.value)

const hasContext = computed(() => {
  if (route.meta.context) {
    return true
  }

  return route.matched.some((record) => record.components && record.components.context)
})

function toggleTheme() {
  theme.toggle()
}
</script>

<template>
  <v-navigation-drawer v-model="drawer">
    <v-list nav>
      <v-list-item prepend-icon="mdi-home" :title="t('nav.home')" value="home" to="/" />
      <v-list-item
        prepend-icon="mdi-view-split-vertical"
        :title="t('nav.workspace')"
        value="workspace"
        to="/workspace"
      />
      <v-list-item prepend-icon="mdi-login" :title="t('nav.signin')" value="signin" to="/signin" />
    </v-list>
  </v-navigation-drawer>

  <v-app-bar>
    <v-app-bar-nav-icon @click="drawer = !drawer" />
    <v-app-bar-title>{{ t('brand') }}</v-app-bar-title>
    <v-spacer />
    <LocaleSelect class="me-2" />
    <v-btn icon="mdi-theme-light-dark" :aria-label="t('themeToggle')" @click="toggleTheme" />
  </v-app-bar>

  <v-main>
    <v-container fluid>
      <v-row>
        <v-col cols="12" :md="hasContext ? 8 : 12">
          <router-view />
        </v-col>
        <v-col v-if="hasContext" cols="12" md="4">
          <router-view name="context" />
        </v-col>
      </v-row>
    </v-container>
  </v-main>

  <v-footer app border>
    <span class="text-medium-emphasis">{{ t('footer') }}</span>
  </v-footer>
</template>
