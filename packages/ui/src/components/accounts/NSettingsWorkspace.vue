<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Settings landing cards for accounts and later destinations
-->
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  items: {
    type: Array,
    default: null,
  },
})

const { t } = useI18n()

const cards = computed(() => {
  if (Array.isArray(props.items) && props.items.length > 0) {
    return props.items
  }
  return [
    {
      key: 'accounts',
      title: t('settings.accountsTitle'),
      subtitle: t('settings.accountsSubtitle'),
      icon: 'mdi-account-group-outline',
      to: '/settings/accounts',
    },
    {
      key: 'org',
      title: t('settings.orgTitle'),
      subtitle: t('settings.orgSubtitle'),
      icon: 'mdi-sitemap-outline',
      to: '/settings/org',
    },
    {
      key: 'security',
      title: t('auth.securityTitle'),
      subtitle: t('auth.securityHint'),
      icon: 'mdi-shield-key-outline',
      to: '/account',
    },
  ]
})
</script>

<template>
  <div class="app-register">
    <v-row>
      <v-col v-for="card in cards" :key="card.key" cols="12" sm="6" md="4">
        <router-link class="text-decoration-none" :to="card.to">
          <v-card class="h-100">
            <v-card-text class="d-flex align-center ga-4">
              <v-avatar color="primary" variant="tonal" size="48">
                <v-icon :icon="card.icon || 'mdi-cog-outline'" />
              </v-avatar>
              <div>
                <div class="text-subtitle-1 font-weight-medium">{{ card.title }}</div>
                <div class="app-muted app-small">{{ card.subtitle }}</div>
              </div>
            </v-card-text>
          </v-card>
        </router-link>
      </v-col>
    </v-row>
  </div>
</template>
