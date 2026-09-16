<script setup>
import { ref } from 'vue'
const notice = ref(false)
</script>
<template>
  <header class="app-page-heading">
    <div><h1 class="app-page-title">Regulatory submissions</h1><p class="app-muted">Manage and monitor regulatory returns from authorised firms.</p></div>
    <div class="app-actions">
      <v-btn variant="outlined" prepend-icon="mdi-calendar-blank-outline" @click="notice = true">2026 reporting year</v-btn>
      <v-btn variant="outlined" color="primary" prepend-icon="mdi-download" @click="notice = true">Export</v-btn>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="notice = true">New submission</v-btn>
    </div>
    <v-snackbar v-model="notice">Static preview: connect this action to your Meteor application.<template #actions><v-btn variant="text" @click="notice = false">Close</v-btn></template></v-snackbar>
  </header>
</template>
