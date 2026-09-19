<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Settings heading — page from the current route
-->
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { NSettingsHeading } from '@nexus/ui'
import { useUserRole } from '../useUserRole.js'

const route = useRoute()
const canManage = useUserRole(['superadmin', 'admin'])

const page = computed(() => {
  if (route.name === 'settingsAccount') {
    return 'account'
  }
  if (route.name === 'settingsAccounts') {
    return 'accounts'
  }
  if (route.name === 'settingsOrg') {
    return 'org'
  }
  return 'workspace'
})
</script>

<template>
  <n-settings-heading v-if="canManage" :page="page" />
</template>
