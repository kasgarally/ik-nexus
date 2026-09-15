<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Default landing view
-->
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const headers = computed(() => [
  { title: t('home.tableName'), key: 'name' },
  { title: t('home.tableStatus'), key: 'status' },
])
</script>

<template>
  <v-card class="mb-4">
    <v-card-title>{{ t('home.title') }}</v-card-title>
    <v-card-text>{{ t('home.body') }}</v-card-text>
    <v-card-actions>
      <v-btn color="primary" to="/workspace">{{ t('home.openWorkspace') }}</v-btn>
      <v-btn variant="outlined" to="/signin">{{ t('home.signin') }}</v-btn>
    </v-card-actions>
  </v-card>

  <v-card>
    <v-card-title>{{ t('home.vuetifyChrome') }}</v-card-title>
    <v-data-table :headers="headers" :items="[]" />
  </v-card>
</template>
