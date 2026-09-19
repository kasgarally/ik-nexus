<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Organisation tree — mounts NOrgTreeEditor
-->
<script setup>
import { useI18n } from 'vue-i18n'
import { NOrgTreeEditor } from '@nexus/ui'
import { useUserRole } from '../useUserRole.js'

const { t } = useI18n()
const canManage = useUserRole(['superadmin', 'admin'])
</script>

<template>
  <n-org-tree-editor v-if="canManage" />
  <p v-else class="app-muted">{{ t('settings.notAuthorized') }}</p>
</template>
