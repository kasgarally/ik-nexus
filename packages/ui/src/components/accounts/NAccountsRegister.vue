<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Admin user register — row click goes to /settings/accounts/:id
-->
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAccountsUsers } from './useAccountsUsers.js'

const { t, tm } = useI18n()
const { users, ready, rolesFor } = useAccountsUsers()

const rows = computed(() =>
  users.value.map((user) => ({
    id: user._id,
    name: user.profile?.name || '',
    email: user.emails?.[0]?.address || '',
    suspended: Boolean(user.suspendedAt),
    roles: rolesFor(user._id),
  })),
)

function roleLabels(names) {
  const map = tm('accounts.role')
  return names
    .map((name) =>
      map && typeof map === 'object' && typeof map[name] === 'string'
        ? map[name]
        : name,
    )
    .join(', ')
}
</script>

<template>
  <div class="app-register">
    <v-card>
      <div
        class="app-table-scroll"
        tabindex="0"
        role="region"
        :aria-label="t('settings.accountsTitle')"
      >
        <table class="app-table">
          <thead>
            <tr>
              <th scope="col">{{ t('accounts.name') }}</th>
              <th scope="col">{{ t('accounts.email') }}</th>
              <th scope="col">{{ t('accounts.roles') }}</th>
              <th scope="col">{{ t('accounts.status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id">
              <td>
                <router-link class="app-link" :to="'/settings/accounts/' + row.id">
                  {{ row.name || row.email }}
                </router-link>
              </td>
              <td>{{ row.email }}</td>
              <td>{{ roleLabels(row.roles) }}</td>
              <td>
                <v-chip
                  size="small"
                  variant="tonal"
                  :color="row.suspended ? 'warning' : 'success'"
                >
                  {{ row.suspended ? t('accounts.suspended') : t('accounts.active') }}
                </v-chip>
              </td>
            </tr>
            <tr v-if="ready && !rows.length">
              <td colspan="4">{{ t('accounts.empty') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </v-card>
  </div>
</template>
