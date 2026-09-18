<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Books page heading — New book action
-->
<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { NModal } from '@nexus/ui'
import { useUserRole } from '/imports/ui/useUserRole.js'
import FrmBook from '../forms/FrmBook.vue'

const { t } = useI18n()
const router = useRouter()
const formOpen = ref(false)
const canCreate = useUserRole('books.create')

function onSaved(id) {
  formOpen.value = false
  if (id) {
    void router.push({ name: 'books', params: { id } })
  }
}
</script>

<template>
  <header class="app-page-heading">
    <div>
      <h1 class="app-page-title">{{ t('books.title') }}</h1>
      <p class="app-muted">{{ t('books.subtitle') }}</p>
    </div>
    <div class="app-actions">
      <v-btn
        v-if="canCreate"
        color="primary"
        prepend-icon="mdi-plus"
        @click="formOpen = true"
      >
        {{ t('books.new') }}
      </v-btn>
    </div>
    <n-modal v-model="formOpen" :title="t('books.add')">
      <frm-book v-if="formOpen" is-modal @close="formOpen = false" @saved="onSaved" />
    </n-modal>
  </header>
</template>
