<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Request a password-reset email
-->
<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { authErrorText, useNexusAuth } from '../../auth/inject.js'

const { t } = useI18n()
const auth = useNexusAuth()

const email = ref('')
const submitting = ref(false)
const errorMessage = ref('')
const sent = ref(false)

async function submit() {
  errorMessage.value = ''
  submitting.value = true
  try {
    await auth.forgotPassword(email.value.trim())
    sent.value = true
  } catch (error) {
    errorMessage.value = authErrorText(error)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <v-card class="auth-card" variant="outlined">
    <v-card-title class="text-h5">{{ t('auth.forgotTitle') }}</v-card-title>
    <v-card-text>
      <p class="text-medium-emphasis mb-4">{{ t('auth.forgotHint') }}</p>
      <v-alert
        v-if="errorMessage"
        type="error"
        class="mb-4"
        closable
        @click:close="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>
      <v-alert v-if="sent" type="success" class="mb-4">
        {{ t('auth.forgotSent') }}
      </v-alert>
      <v-text-field
        v-if="!sent"
        v-model="email"
        :label="t('auth.email')"
        type="email"
        autocomplete="username"
        variant="outlined"
      />
    </v-card-text>
    <v-card-actions class="px-4 pb-4 flex-column align-stretch">
      <v-btn v-if="!sent" color="primary" :loading="submitting" @click="submit">
        {{ t('auth.forgotSubmit') }}
      </v-btn>
      <v-btn variant="text" to="/signin">{{ t('auth.backToSignIn') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>
