<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Company settings — mounts NSetupForm from @nexus/ui
-->
<script setup>
import { useI18n } from 'vue-i18n'
import { NSetupForm } from '@nexus/ui'
import { useUserRole } from '../useUserRole.js'

const { t } = useI18n()
const canManage = useUserRole(['superadmin', 'admin'])
</script>

<template>
  <n-setup-form v-if="canManage" />
  <p v-else class="app-muted">{{ t('settings.notAuthorized') }}</p>
</template>
