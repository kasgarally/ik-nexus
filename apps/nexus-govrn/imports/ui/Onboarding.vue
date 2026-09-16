<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
First-run onboarding page
-->
<script setup>
import { NSetupWizard } from '@nexus/ui'
import { useRouter } from 'vue-router'

const router = useRouter()

function onCompleted() {
  void router.push('/')
}
</script>

<template>
  <n-setup-wizard @completed="onCompleted" />
</template>
