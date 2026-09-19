<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Password sign-in with optional TOTP, forgot-password, gated signup
-->
<script setup>
import { MIN_PASSWORD_LENGTH } from '@nexus/setup'
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { authErrorText, useNexusAuth } from '../../auth/inject.js'

const emit = defineEmits(['signed-in'])
const { t } = useI18n()
const auth = useNexusAuth()

const form = reactive({
  email: '',
  password: '',
  code: '',
  name: '',
  confirm: '',
})
const options = ref({
  selfRegister: false,
  providers: { google: false, facebook: false },
  prefillDemo: false,
})
const mode = ref('signin')
const askCode = ref(false)
const submitting = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  try {
    const next = await auth.authOptions()
    options.value = {
      selfRegister: Boolean(next?.selfRegister),
      providers: {
        google: Boolean(next?.providers?.google),
        facebook: Boolean(next?.providers?.facebook),
      },
      prefillDemo: Boolean(next?.prefillDemo),
    }
    if (options.value.prefillDemo && typeof auth.demoCredentials === 'function') {
      const demo = auth.demoCredentials() || {}
      form.email = demo.email || ''
      form.password = demo.password || ''
    }
  } catch (error) {
    errorMessage.value = authErrorText(error)
  }
})

function afterSignIn() {
  emit('signed-in')
}

async function submitSignIn() {
  errorMessage.value = ''
  submitting.value = true
  try {
    await auth.loginWithPassword({
      email: form.email.trim(),
      password: form.password,
      code: askCode.value ? form.code.trim() : '',
    })
    await afterSignIn()
  } catch (error) {
    if (error?.error === 'no-2fa-code') {
      askCode.value = true
      errorMessage.value = ''
      return
    }
    errorMessage.value = authErrorText(error)
  } finally {
    submitting.value = false
  }
}

async function submitSignUp() {
  errorMessage.value = ''
  if (form.password.length < MIN_PASSWORD_LENGTH || form.password !== form.confirm) {
    errorMessage.value = t('auth.passwordMismatch')
    return
  }
  submitting.value = true
  try {
    await auth.selfRegister({
      email: form.email.trim(),
      name: form.name.trim(),
      password: form.password,
    })
    await auth.loginWithPassword({
      email: form.email.trim(),
      password: form.password,
    })
    await afterSignIn()
  } catch (error) {
    errorMessage.value = authErrorText(error)
  } finally {
    submitting.value = false
  }
}

async function signInWith(provider) {
  errorMessage.value = ''
  submitting.value = true
  try {
    if (provider === 'google') {
      await auth.loginWithGoogle()
    } else {
      await auth.loginWithFacebook()
    }
    await afterSignIn()
  } catch (error) {
    errorMessage.value = authErrorText(error)
  } finally {
    submitting.value = false
  }
}

function showSignIn() {
  mode.value = 'signin'
  errorMessage.value = ''
}

function showSignUp() {
  mode.value = 'signup'
  askCode.value = false
  errorMessage.value = ''
}
</script>

<template>
  <v-card class="auth-card" variant="outlined">
    <v-card-title class="text-h5">
      {{ mode === 'signup' ? t('auth.signUpTitle') : t('auth.title') }}
    </v-card-title>
    <v-card-text>
      <p v-if="options.prefillDemo && mode === 'signin'" class="text-medium-emphasis mb-4">
        {{ t('auth.demoHint') }}
      </p>
      <v-alert
        v-if="errorMessage"
        type="error"
        class="mb-4"
        closable
        @click:close="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>
      <v-text-field
        v-if="mode === 'signup'"
        v-model="form.name"
        :label="t('auth.name')"
        autocomplete="name"
        variant="outlined"
      />
      <v-text-field
        v-model="form.email"
        :label="t('auth.email')"
        type="email"
        autocomplete="username"
        variant="outlined"
      />
      <v-text-field
        v-model="form.password"
        :label="t('auth.password')"
        type="password"
        :autocomplete="mode === 'signup' ? 'new-password' : 'current-password'"
        variant="outlined"
      />
      <v-text-field
        v-if="mode === 'signup'"
        v-model="form.confirm"
        :label="t('auth.confirm')"
        type="password"
        autocomplete="new-password"
        variant="outlined"
      />
      <v-text-field
        v-if="askCode && mode === 'signin'"
        v-model="form.code"
        :label="t('auth.totp')"
        :hint="t('auth.totpHint')"
        persistent-hint
        autocomplete="one-time-code"
        variant="outlined"
      />
      <div v-if="mode === 'signin'" class="d-flex justify-end mb-2">
        <v-btn variant="text" size="small" to="/forgot-password">
          {{ t('auth.forgot') }}
        </v-btn>
      </div>
    </v-card-text>
    <v-card-actions class="px-4 pb-4 flex-column align-stretch">
      <v-btn
        v-if="mode === 'signin'"
        color="primary"
        :loading="submitting"
        @click="submitSignIn"
      >
        {{ t('auth.submit') }}
      </v-btn>
      <v-btn
        v-else
        color="primary"
        :loading="submitting"
        @click="submitSignUp"
      >
        {{ t('auth.signUp') }}
      </v-btn>
      <template v-if="options.selfRegister && mode === 'signin'">
        <p v-if="options.providers.google || options.providers.facebook" class="text-center text-medium-emphasis my-2">
          {{ t('auth.or') }}
        </p>
        <v-btn
          v-if="options.providers.google"
          variant="outlined"
          prepend-icon="mdi-google"
          class="mb-2"
          :disabled="submitting"
          @click="signInWith('google')"
        >
          {{ t('auth.google') }}
        </v-btn>
        <v-btn
          v-if="options.providers.facebook"
          variant="outlined"
          prepend-icon="mdi-facebook"
          class="mb-2"
          :disabled="submitting"
          @click="signInWith('facebook')"
        >
          {{ t('auth.facebook') }}
        </v-btn>
        <v-btn variant="text" class="mt-2" @click="showSignUp">
          {{ t('auth.needAccount') }}
        </v-btn>
      </template>
      <v-btn v-if="mode === 'signup'" variant="text" class="mt-2" @click="showSignIn">
        {{ t('auth.haveAccount') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
