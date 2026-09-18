<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Settings workspace — mounts NSettingsWorkspace
-->
<script setup>
import { useI18n } from 'vue-i18n'
import { NSettingsWorkspace } from '@nexus/ui'
import { useUserRole } from '../useUserRole.js'

const { t } = useI18n()
const canManage = useUserRole(['superadmin', 'admin'])
</script>

<template>
  <n-settings-workspace v-if="canManage" />
  <p v-else class="app-muted">{{ t('settings.notAuthorized') }}</p>
</template>
