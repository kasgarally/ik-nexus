<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Set a new password from an email token
-->
<script setup>
import { MIN_PASSWORD_LENGTH } from '@nexus/setup'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { authErrorText, useNexusAuth } from '../../auth/inject.js'

const props = defineProps({
  token: { type: String, required: true },
})
const { t } = useI18n()
const auth = useNexusAuth()

const password = ref('')
const confirm = ref('')
const submitting = ref(false)
const errorMessage = ref('')
const done = ref(false)

async function submit() {
  errorMessage.value = ''
  if (password.value.length < MIN_PASSWORD_LENGTH || password.value !== confirm.value) {
    errorMessage.value = t('auth.passwordMismatch')
    return
  }
  submitting.value = true
  try {
    await auth.resetPassword(String(props.token || ''), password.value)
    done.value = true
  } catch (error) {
    errorMessage.value = authErrorText(error)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <v-card class="auth-card" variant="outlined">
    <v-card-title class="text-h5">{{ t('auth.resetTitle') }}</v-card-title>
    <v-card-text>
      <v-alert
        v-if="errorMessage"
        type="error"
        class="mb-4"
        closable
        @click:close="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>
      <v-alert v-if="done" type="success" class="mb-4">
        {{ t('auth.resetDone') }}
      </v-alert>
      <template v-else>
        <v-text-field
          v-model="password"
          :label="t('auth.password')"
          type="password"
          autocomplete="new-password"
          variant="outlined"
        />
        <v-text-field
          v-model="confirm"
          :label="t('auth.confirm')"
          type="password"
          autocomplete="new-password"
          variant="outlined"
        />
      </template>
    </v-card-text>
    <v-card-actions class="px-4 pb-4 flex-column align-stretch">
      <v-btn v-if="!done" color="primary" :loading="submitting" @click="submit">
        {{ t('auth.resetSubmit') }}
      </v-btn>
      <v-btn variant="text" to="/signin">{{ t('auth.backToSignIn') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>
