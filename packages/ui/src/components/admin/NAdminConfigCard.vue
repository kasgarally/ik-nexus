<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Context-pane card of admin-only list/setup links (display only)
-->
<script setup>
defineProps({
  title: { type: String, required: true },
  items: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <v-card class="app-context-card">
    <h2 class="app-section-title mb-3">{{ title }}</h2>
    <v-list nav density="compact" class="pa-0 bg-transparent">
      <v-list-item
        v-for="item in items"
        :key="item.key || item.title"
        :to="item.to"
        :prepend-icon="item.icon || 'mdi-format-list-bulleted'"
        :title="item.title"
        :subtitle="item.subtitle"
        append-icon="mdi-chevron-right"
      />
    </v-list>
  </v-card>
</template>
