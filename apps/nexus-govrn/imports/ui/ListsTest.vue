<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Demo page for list editor and ListSelect
-->
<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ListItemsEditor, ListSelect } from '@nexus/ui'
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '/imports/api/demoAdmin.js'

const DEMO_CATEGORY_KEY = 'demo.category'
const DEMO_LIKELIHOOD_KEY = 'demo.likelihood'

const { t } = useI18n()
const category = ref(null)
const likelihood = ref(null)
</script>

<template>
  <v-row>
    <v-col cols="12">
      <h1 class="text-h4 mb-2">{{ t('listsTest.title') }}</h1>
      <p class="text-medium-emphasis mb-2">{{ t('listsTest.body') }}</p>
      <p class="text-medium-emphasis mb-6">
        {{ t('listsTest.credentials', { email: DEMO_ADMIN_EMAIL, password: DEMO_ADMIN_PASSWORD }) }}
      </p>
    </v-col>

    <v-col cols="12" md="6">
      <v-card>
        <v-card-title>{{ t('listsTest.setupCategory') }}</v-card-title>
        <v-card-text>
          <p class="text-medium-emphasis mb-4">{{ t('listsTest.setupHint') }}</p>
          <ListItemsEditor :list-key="DEMO_CATEGORY_KEY" />
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="6">
      <v-card>
        <v-card-title>{{ t('listsTest.setupLikelihood') }}</v-card-title>
        <v-card-text>
          <p class="text-medium-emphasis mb-4">{{ t('listsTest.setupHint') }}</p>
          <ListItemsEditor :list-key="DEMO_LIKELIHOOD_KEY" />
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12">
      <v-card>
        <v-card-title>{{ t('listsTest.captureTitle') }}</v-card-title>
        <v-card-text>
          <p class="text-medium-emphasis mb-4">{{ t('listsTest.captureHint') }}</p>
          <v-row>
            <v-col cols="12" md="6">
              <ListSelect
                v-model="category"
                :list-key="DEMO_CATEGORY_KEY"
                :label="t('listsTest.category')"
              />
            </v-col>
            <v-col cols="12" md="6">
              <ListSelect
                v-model="likelihood"
                :list-key="DEMO_LIKELIHOOD_KEY"
                :label="t('listsTest.likelihood')"
              />
            </v-col>
          </v-row>
          <p class="mt-2">
            {{ t('listsTest.selected', { category: category || '—', likelihood: likelihood || '—' }) }}
          </p>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
