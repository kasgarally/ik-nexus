<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Settings named-view heading for workspace, accounts, org, and company
-->
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  page: {
    type: String,
    default: 'workspace',
  },
})

const { t } = useI18n()

const isAccountsList = computed(() => props.page === 'accounts')
const isAccountDetail = computed(() => props.page === 'account')
const isOrg = computed(() => props.page === 'org')
const isSetup = computed(() => props.page === 'setup')
const title = computed(() => {
  if (isAccountsList.value || isAccountDetail.value) {
    return t('settings.accountsTitle')
  }
  if (isOrg.value) {
    return t('settings.orgTitle')
  }
  if (isSetup.value) {
    return t('settings.setupTitle')
  }
  return t('settings.title')
})
const subtitle = computed(() => {
  if (isAccountsList.value || isAccountDetail.value) {
    return t('settings.accountsSubtitle')
  }
  if (isOrg.value) {
    return t('settings.orgSubtitle')
  }
  if (isSetup.value) {
    return t('settings.setupSubtitle')
  }
  return t('settings.subtitle')
})
</script>

<template>
  <header class="app-page-heading">
    <div>
      <h1 class="app-page-title">{{ title }}</h1>
      <p class="app-muted">{{ subtitle }}</p>
    </div>
    <div class="app-actions">
      <v-btn
        v-if="isAccountsList"
        color="primary"
        prepend-icon="mdi-plus"
        to="/settings/accounts/new"
      >
        {{ t('accounts.new') }}
      </v-btn>
      <v-btn
        v-else-if="isAccountDetail"
        variant="outlined"
        prepend-icon="mdi-arrow-left"
        to="/settings/accounts"
      >
        {{ t('settings.accountsTitle') }}
      </v-btn>
      <v-btn
        v-else-if="isOrg || isSetup"
        variant="outlined"
        prepend-icon="mdi-arrow-left"
        to="/settings"
      >
        {{ t('settings.title') }}
      </v-btn>
      <v-btn
        v-else
        variant="outlined"
        prepend-icon="mdi-account-group-outline"
        to="/settings/accounts"
      >
        {{ t('settings.accountsTitle') }}
      </v-btn>
    </div>
  </header>
</template>
