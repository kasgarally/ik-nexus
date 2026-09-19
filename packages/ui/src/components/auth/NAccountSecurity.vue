<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Enroll or disable optional TOTP for the signed-in user
-->
<script setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { authErrorText, useNexusAuth } from '../../auth/inject.js'

const { t } = useI18n()
const auth = useNexusAuth()

const enabled = ref(false)
const password = ref('')
const code = ref('')
const qrSrc = ref('')
const qrUri = ref('')
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

onMounted(async () => {
  await refreshStatus()
})

async function refreshStatus() {
  try {
    enabled.value = Boolean(await auth.has2fa())
  } catch (error) {
    errorMessage.value = authErrorText(error)
  }
}

function svgDataUrl(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

async function startEnroll() {
  errorMessage.value = ''
  successMessage.value = ''
  submitting.value = true
  try {
    const result = await auth.generate2faQr(password.value, t('auth.totpAppName'))
    qrSrc.value = result?.svg ? svgDataUrl(result.svg) : ''
    qrUri.value = result?.uri || ''
  } catch (error) {
    errorMessage.value = authErrorText(error)
  } finally {
    submitting.value = false
  }
}

async function confirmEnroll() {
  errorMessage.value = ''
  successMessage.value = ''
  submitting.value = true
  try {
    await auth.enable2fa(code.value.trim())
    qrSrc.value = ''
    qrUri.value = ''
    code.value = ''
    password.value = ''
    enabled.value = true
    successMessage.value = t('auth.enabled')
  } catch (error) {
    errorMessage.value = authErrorText(error)
  } finally {
    submitting.value = false
  }
}

async function disable() {
  errorMessage.value = ''
  successMessage.value = ''
  submitting.value = true
  try {
    await auth.disable2fa(code.value.trim())
    code.value = ''
    enabled.value = false
    successMessage.value = t('auth.disabled')
  } catch (error) {
    errorMessage.value = authErrorText(error)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <v-card class="auth-card" variant="outlined">
    <v-card-title class="text-h5">{{ t('auth.securityTitle') }}</v-card-title>
    <v-card-text>
      <p class="text-medium-emphasis mb-4">{{ t('auth.securityHint') }}</p>
      <v-alert
        v-if="errorMessage"
        type="error"
        class="mb-4"
        closable
        @click:close="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>
      <v-alert
        v-if="successMessage"
        type="success"
        class="mb-4"
        closable
        @click:close="successMessage = ''"
      >
        {{ successMessage }}
      </v-alert>
      <p class="mb-4">
        {{ enabled ? t('auth.enabled') : t('auth.notEnabled') }}
      </p>
      <template v-if="!enabled">
        <v-text-field
          v-model="password"
          :label="t('auth.currentPassword')"
          type="password"
          autocomplete="current-password"
          variant="outlined"
        />
        <v-btn
          class="mb-4"
          variant="outlined"
          :loading="submitting"
          :disabled="!password"
          @click="startEnroll"
        >
          {{ t('auth.generateQr') }}
        </v-btn>
        <div v-if="qrSrc" class="mb-4 text-center">
          <img :src="qrSrc" width="200" height="200" :alt="t('auth.qrHint')" />
          <p class="text-medium-emphasis mt-2">{{ t('auth.qrHint') }}</p>
          <p v-if="qrUri" class="text-caption text-break">{{ qrUri }}</p>
          <v-text-field
            v-model="code"
            :label="t('auth.totp')"
            autocomplete="one-time-code"
            variant="outlined"
          />
          <v-btn color="primary" :loading="submitting" :disabled="!code" @click="confirmEnroll">
            {{ t('auth.enable2fa') }}
          </v-btn>
        </div>
      </template>
      <template v-else>
        <v-text-field
          v-model="code"
          :label="t('auth.totp')"
          :hint="t('auth.disableHint')"
          persistent-hint
          autocomplete="one-time-code"
          variant="outlined"
        />
        <v-btn color="error" variant="outlined" :loading="submitting" :disabled="!code" @click="disable">
          {{ t('auth.disable2fa') }}
        </v-btn>
      </template>
    </v-card-text>
  </v-card>
</template>
