<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Accounts register — mounts NAccountsRegister
-->
<script setup>
import { useI18n } from 'vue-i18n'
import { NAccountsRegister } from '@nexus/ui'
import { useUserRole } from '../useUserRole.js'

const { t } = useI18n()
const canManage = useUserRole(['superadmin', 'admin'])
</script>

<template>
  <n-accounts-register v-if="canManage" />
  <p v-else class="app-muted">{{ t('settings.notAuthorized') }}</p>
</template>
