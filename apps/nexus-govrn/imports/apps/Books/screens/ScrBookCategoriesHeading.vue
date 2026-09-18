<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Book categories page heading
-->
<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <header class="app-page-heading">
    <div>
      <h1 class="app-page-title">{{ t('books.categoriesTitle') }}</h1>
      <p class="app-muted">{{ t('books.categoriesSubtitle') }}</p>
    </div>
    <div class="app-actions">
      <v-btn variant="outlined" prepend-icon="mdi-arrow-left" :to="{ name: 'books' }">
        {{ t('books.title') }}
      </v-btn>
    </div>
  </header>
</template>
