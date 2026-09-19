<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Mounts NResetPassword
-->
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { NResetPassword } from '@nexus/ui'

const route = useRoute()
const token = computed(() => String(route.params.token || ''))
</script>

<template>
  <n-reset-password :token="token" />
</template>
