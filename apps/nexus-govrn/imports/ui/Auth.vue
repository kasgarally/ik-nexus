<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Demo sign-in content
-->
<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <v-card>
    <v-card-title>{{ t('auth.title') }}</v-card-title>
    <v-card-text>
      <v-text-field :label="t('auth.email')" type="email" autocomplete="username" />
      <v-text-field :label="t('auth.password')" type="password" autocomplete="current-password" />
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary">{{ t('auth.submit') }}</v-btn>
      <v-btn variant="text" to="/">{{ t('auth.back') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>
