<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Mounts NSignIn
-->
<script setup>
import { NSignIn, safeNextPath } from '@nexus/ui'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

function onSignedIn() {
  return router.push(safeNextPath(route.query.next))
}
</script>

<template>
  <n-sign-in @signed-in="onSignedIn" />
</template>
