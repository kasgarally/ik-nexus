<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Account form — mounts NAccountForm with the route id
-->
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { NAccountForm } from '@nexus/ui'
import { useUserRole } from '/imports/ui/useUserRole.js'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const canManage = useUserRole(['superadmin', 'admin'])

const accountId = computed(() =>
  typeof route.params.id === 'string' ? route.params.id : '',
)

function onCreated(id) {
  void router.replace({ name: 'settingsAccount', params: { id } })
}

function onRemoved() {
  void router.push({ name: 'settingsAccounts' })
}
</script>

<template>
  <n-account-form
    v-if="canManage"
    :account-id="accountId"
    @created="onCreated"
    @removed="onRemoved"
  />
  <p v-else class="app-muted">{{ t('settings.notAuthorized') }}</p>
</template>
