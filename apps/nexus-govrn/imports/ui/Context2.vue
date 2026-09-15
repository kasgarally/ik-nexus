<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Demo context child panel
-->
<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <v-card>
    <v-card-title>{{ t('context2.title') }}</v-card-title>
    <v-card-text>{{ t('context2.body') }}</v-card-text>
  </v-card>
</template>
