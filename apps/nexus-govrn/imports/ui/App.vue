<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Root layout switcher
-->
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { defaultLayout, layouts } from './layouts/index.js'

const route = useRoute()

const currentLayout = computed(() => {
  const name = route.meta.layout || defaultLayout
  return layouts[name] || layouts[defaultLayout]
})
</script>

<template>
  <v-app>
    <component :is="currentLayout" />
  </v-app>
</template>
