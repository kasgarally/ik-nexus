<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Create or edit an account, reset password, suspend, assign roles
-->
<script setup>
import { Accounts, listRoleCatalog } from '@nexus/accounts'
import { MIN_PASSWORD_LENGTH } from '@nexus/setup'
import { computed, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import NRemoveIcon from '../dialogs/NRemoveIcon.vue'
import { useAccountsUsers } from './useAccountsUsers.js'

const props = defineProps({
  accountId: { type: String, default: '' },
})
const emit = defineEmits(['created', 'removed'])

const { t, tm } = useI18n()
const { users, ready, saving, errorMessage, rolesFor, run } = useAccountsUsers()

const isNew = computed(() => !props.accountId || props.accountId === 'new')
const userId = computed(() => (isNew.value ? '' : props.accountId))
const user = computed(() => users.value.find((row) => row._id === userId.value) || null)

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirm: '',
  roles: [],
})
const passwordForm = reactive({
  password: '',
  confirm: '',
})

const catalogs = computed(() => listRoleCatalog())

watch(
  [user, userId, ready],
  () => {
    if (isNew.value) {
      return
    }
    if (!user.value) {
      return
    }
    form.name = user.value.profile?.name || ''
    form.email = user.value.emails?.[0]?.address || ''
    form.roles = [...rolesFor(user.value._id)]
  },
  { immediate: true },
)

const passwordValid = computed(() => {
  if (isNew.value) {
    return (
      form.password.length >= MIN_PASSWORD_LENGTH && form.password === form.confirm
    )
  }
  return true
})

function catalogLabel(section, name) {
  const map = tm(`accounts.${section}`)
  if (map && typeof map === 'object' && typeof map[name] === 'string') {
    return map[name]
  }
  return name
}

function roleLabel(name) {
  return catalogLabel('role', name)
}

function groupLabel(group) {
  return catalogLabel('group', group)
}

function roleChecked(name) {
  return form.roles.includes(name)
}

function setRoleChecked(name, checked) {
  if (checked && !form.roles.includes(name)) {
    form.roles.push(name)
    return
  }
  if (!checked) {
    form.roles = form.roles.filter((role) => role !== name)
  }
}

async function saveProfile() {
  if (isNew.value) {
    if (!passwordValid.value) {
      return
    }
    const result = await run(() =>
      Accounts.insertUser({
        name: form.name,
        email: form.email,
        password: form.password,
        roles: form.roles,
      }),
    )
    if (result?.id) {
      emit('created', result.id)
    }
    return
  }
  await run(() =>
    Accounts.updateUser({
      id: userId.value,
      name: form.name,
      email: form.email,
    }),
  )
  await run(() =>
    Accounts.setRoles({
      id: userId.value,
      roles: form.roles,
    }),
  )
}

async function resetPassword() {
  if (passwordForm.password.length < MIN_PASSWORD_LENGTH) {
    return
  }
  if (passwordForm.password !== passwordForm.confirm) {
    return
  }
  await run(() =>
    Accounts.setPassword({
      id: userId.value,
      password: passwordForm.password,
    }),
  )
  passwordForm.password = ''
  passwordForm.confirm = ''
}

async function toggleSuspended() {
  await run(() =>
    Accounts.setSuspended({
      id: userId.value,
      suspended: !user.value?.suspendedAt,
    }),
  )
}

async function removeAccount() {
  await run(() => Accounts.removeUser({ id: userId.value }))
  emit('removed')
}
</script>

<template>
  <div class="app-register">
    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
      {{ errorMessage }}
    </v-alert>
    <v-card class="pa-6">
      <v-text-field
        v-model="form.name"
        :label="t('accounts.name')"
        autocomplete="name"
      />
      <v-text-field
        v-model="form.email"
        :label="t('accounts.email')"
        type="email"
        autocomplete="email"
      />
      <template v-if="isNew">
        <v-text-field
          v-model="form.password"
          :label="t('accounts.password')"
          type="password"
          autocomplete="new-password"
          :hint="t('accounts.passwordMin', { n: MIN_PASSWORD_LENGTH })"
          persistent-hint
        />
        <v-text-field
          v-model="form.confirm"
          :label="t('accounts.confirm')"
          type="password"
          autocomplete="new-password"
        />
      </template>
      <div class="mt-4">
        <h3 class="text-body-1 font-weight-medium mb-2">{{ t('accounts.roles') }}</h3>
        <div v-for="catalog in catalogs" :key="catalog.key" class="mb-4">
          <div class="app-muted app-small mb-2">{{ groupLabel(catalog.key) }}</div>
          <v-checkbox
            v-for="role in catalog.roles"
            :key="role.name"
            :model-value="roleChecked(role.name)"
            :label="roleLabel(role.name)"
            hide-details
            density="compact"
            @update:model-value="setRoleChecked(role.name, $event)"
          />
        </div>
      </div>
      <div class="app-actions mt-4">
        <v-btn color="primary" :loading="saving" @click="saveProfile">
          {{ isNew ? t('accounts.create') : t('accounts.save') }}
        </v-btn>
      </div>
    </v-card>
    <v-card v-if="!isNew && user" class="pa-6 mt-4">
      <h3 class="text-body-1 font-weight-medium mb-3">{{ t('accounts.resetPassword') }}</h3>
      <v-text-field
        v-model="passwordForm.password"
        :label="t('accounts.password')"
        type="password"
        autocomplete="new-password"
      />
      <v-text-field
        v-model="passwordForm.confirm"
        :label="t('accounts.confirm')"
        type="password"
        autocomplete="new-password"
      />
      <v-btn variant="outlined" :loading="saving" @click="resetPassword">
        {{ t('accounts.resetPassword') }}
      </v-btn>
    </v-card>
    <v-card v-if="!isNew && user" class="pa-6 mt-4">
      <div class="d-flex flex-wrap align-center justify-space-between ga-3">
        <div>
          <h3 class="text-body-1 font-weight-medium">{{ t('accounts.status') }}</h3>
          <p class="app-muted mb-0">
            {{ user.suspendedAt ? t('accounts.suspended') : t('accounts.active') }}
          </p>
        </div>
        <div class="app-actions">
          <v-btn variant="outlined" :loading="saving" @click="toggleSuspended">
            {{ user.suspendedAt ? t('accounts.unsuspend') : t('accounts.suspend') }}
          </v-btn>
          <n-remove-icon
            :title="t('accounts.removeTitle')"
            :text="t('accounts.removeConfirm', { name: form.name || form.email })"
            @confirm="removeAccount"
          />
        </div>
      </div>
    </v-card>
  </div>
</template>
