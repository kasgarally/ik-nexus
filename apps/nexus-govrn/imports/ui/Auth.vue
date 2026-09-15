<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Password sign-in for the local demo admin
-->
<script setup>
import { Meteor } from 'meteor/meteor'
import { Tracker } from 'meteor/tracker'
import { onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '/imports/api/demoAdmin.js'

const { t } = useI18n()
const router = useRouter()
const email = ref(DEMO_ADMIN_EMAIL)
const password = ref(DEMO_ADMIN_PASSWORD)
const errorMessage = ref('')
const submitting = ref(false)
const userId = ref(Meteor.userId())

const computation = Tracker.autorun(() => {
  userId.value = Meteor.userId()
})
onUnmounted(() => computation.stop())

function loginWithPassword(address, secret) {
  if (typeof Meteor.loginWithPasswordAsync === 'function') {
    return Meteor.loginWithPasswordAsync(address, secret)
  }

  return new Promise((resolve, reject) => {
    Meteor.loginWithPassword(address, secret, (error) => {
      if (error) {
        reject(error)
        return
      }
      resolve()
    })
  })
}

function logoutCurrentUser() {
  if (typeof Meteor.logoutAsync === 'function') {
    return Meteor.logoutAsync()
  }

  return new Promise((resolve, reject) => {
    Meteor.logout((error) => {
      if (error) {
        reject(error)
        return
      }
      resolve()
    })
  })
}

async function signIn() {
  errorMessage.value = ''
  submitting.value = true
  try {
    await loginWithPassword(email.value, password.value)
    await router.push('/lists-test')
  } catch (error) {
    errorMessage.value = error.reason || error.message || String(error)
  } finally {
    submitting.value = false
  }
}

async function signOut() {
  errorMessage.value = ''
  submitting.value = true
  try {
    await logoutCurrentUser()
  } catch (error) {
    errorMessage.value = error.reason || error.message || String(error)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <v-card>
    <v-card-title>{{ t('auth.title') }}</v-card-title>
    <v-card-text>
      <p class="text-medium-emphasis mb-4">{{ t('auth.demoHint') }}</p>
      <v-alert v-if="errorMessage" type="error" class="mb-4" closable @click:close="errorMessage = ''">
        {{ errorMessage }}
      </v-alert>
      <p v-if="userId" class="mb-4">{{ t('auth.signedIn', { email: DEMO_ADMIN_EMAIL }) }}</p>
      <template v-else>
        <v-text-field
          v-model="email"
          :label="t('auth.email')"
          type="email"
          autocomplete="username"
        />
        <v-text-field
          v-model="password"
          :label="t('auth.password')"
          type="password"
          autocomplete="current-password"
        />
      </template>
    </v-card-text>
    <v-card-actions>
      <v-btn v-if="userId" color="primary" :loading="submitting" @click="signOut">
        {{ t('auth.signOut') }}
      </v-btn>
      <v-btn v-else color="primary" :loading="submitting" @click="signIn">
        {{ t('auth.submit') }}
      </v-btn>
      <v-btn variant="text" to="/">{{ t('auth.back') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>
