<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
First-run vertical stepper: company, address, branding, admin, review
-->
<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ICON_MAX_BYTES, LOGO_MAX_BYTES, MIN_PASSWORD_LENGTH, Setup } from '@nexus/setup'

const emit = defineEmits(['completed'])
const { t } = useI18n()

const step = ref(1)
const submitting = ref(false)
const errorMessage = ref('')
const logoError = ref('')
const iconError = ref('')

const form = ref(emptyForm())

const companyValid = computed(() => form.value.companyName.trim().length > 0)
const adminValid = computed(() => {
  const admin = form.value.admin
  return (
    admin.name.trim().length > 0 &&
    admin.email.trim().includes('@') &&
    admin.password.length >= MIN_PASSWORD_LENGTH &&
    admin.password === admin.confirm
  )
})

const reviewRows = computed(() => [
  { label: t('setup.companyName'), value: form.value.companyName },
  { label: t('setup.legalName'), value: form.value.legalName },
  { label: t('setup.website'), value: form.value.website },
  { label: t('setup.phone'), value: form.value.phone },
  { label: t('setup.email'), value: form.value.email },
  { label: t('setup.line1'), value: form.value.address.line1 },
  { label: t('setup.line2'), value: form.value.address.line2 },
  { label: t('setup.city'), value: form.value.address.city },
  { label: t('setup.region'), value: form.value.address.region },
  { label: t('setup.postalCode'), value: form.value.address.postalCode },
  { label: t('setup.country'), value: form.value.address.country },
  { label: t('setup.adminName'), value: form.value.admin.name },
  { label: t('setup.adminEmail'), value: form.value.admin.email },
])

function emptyForm() {
  return {
    companyName: '',
    legalName: '',
    website: '',
    phone: '',
    email: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      region: '',
      postalCode: '',
      country: '',
    },
    logoDataUrl: '',
    iconDataUrl: '',
    admin: {
      name: '',
      email: '',
      password: '',
      confirm: '',
    },
  }
}

function goNext() {
  if (step.value < 5) {
    step.value += 1
  }
}

function goBack() {
  if (step.value > 1) {
    step.value -= 1
  }
}

async function onLogoFiles(files) {
  logoError.value = ''
  const file = firstFile(files)
  if (!file) {
    form.value.logoDataUrl = ''
    return
  }
  try {
    form.value.logoDataUrl = await readImageDataUrl(file, LOGO_MAX_BYTES, t('setup.logoTooLarge'))
  } catch (error) {
    form.value.logoDataUrl = ''
    logoError.value = error.message || String(error)
  }
}

async function onIconFiles(files) {
  iconError.value = ''
  const file = firstFile(files)
  if (!file) {
    form.value.iconDataUrl = ''
    return
  }
  try {
    form.value.iconDataUrl = await readImageDataUrl(file, ICON_MAX_BYTES, t('setup.iconTooLarge'))
  } catch (error) {
    form.value.iconDataUrl = ''
    iconError.value = error.message || String(error)
  }
}

function firstFile(files) {
  if (!files) {
    return null
  }
  if (Array.isArray(files)) {
    return files[0] || null
  }
  return files
}

function readImageDataUrl(file, maxBytes, tooLargeMessage) {
  return new Promise((resolve, reject) => {
    if (!file.type || !file.type.startsWith('image/')) {
      reject(new Error(t('setup.imageType')))
      return
    }
    if (file.size > maxBytes) {
      reject(new Error(tooLargeMessage))
      return
    }

    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error || new Error(t('setup.imageType')))
    reader.readAsDataURL(file)
  })
}

async function submit() {
  errorMessage.value = ''
  if (!companyValid.value || !adminValid.value) {
    errorMessage.value = t('setup.fixSteps')
    return
  }

  submitting.value = true
  try {
    await Setup.complete({
      companyName: form.value.companyName,
      legalName: form.value.legalName,
      website: form.value.website,
      phone: form.value.phone,
      email: form.value.email,
      address: { ...form.value.address },
      logoDataUrl: form.value.logoDataUrl || undefined,
      iconDataUrl: form.value.iconDataUrl || undefined,
      admin: {
        name: form.value.admin.name,
        email: form.value.admin.email,
        password: form.value.admin.password,
      },
    })
    await Setup.loginWithPassword(form.value.admin.email, form.value.admin.password)
    emit('completed')
  } catch (error) {
    errorMessage.value = error.reason || error.message || String(error)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <v-card>
    <v-card-title class="text-h5">{{ t('setup.title') }}</v-card-title>
    <v-card-subtitle>{{ t('setup.subtitle') }}</v-card-subtitle>
    <v-card-text>
      <v-stepper-vertical v-model="step" hide-actions>
        <v-stepper-vertical-item :value="1" :title="t('setup.stepCompany')" :complete="step > 1">
          <v-text-field
            v-model="form.companyName"
            :label="t('setup.companyName')"
            :rules="[(value) => Boolean(value && value.trim()) || t('setup.companyNameRequired')]"
          />
          <v-text-field v-model="form.legalName" :label="t('setup.legalName')" />
          <v-text-field v-model="form.website" :label="t('setup.website')" />
          <v-text-field v-model="form.phone" :label="t('setup.phone')" />
          <v-text-field v-model="form.email" :label="t('setup.email')" type="email" />
          <div class="d-flex justify-end mt-4">
            <v-btn color="primary" :disabled="!companyValid" @click="goNext">
              {{ t('setup.next') }}
            </v-btn>
          </div>
        </v-stepper-vertical-item>

        <v-stepper-vertical-item :value="2" :title="t('setup.stepAddress')" :complete="step > 2">
          <v-text-field v-model="form.address.line1" :label="t('setup.line1')" />
          <v-text-field v-model="form.address.line2" :label="t('setup.line2')" />
          <v-text-field v-model="form.address.city" :label="t('setup.city')" />
          <v-text-field v-model="form.address.region" :label="t('setup.region')" />
          <v-text-field v-model="form.address.postalCode" :label="t('setup.postalCode')" />
          <v-text-field v-model="form.address.country" :label="t('setup.country')" />
          <div class="d-flex justify-space-between mt-4">
            <v-btn variant="text" @click="goBack">{{ t('setup.back') }}</v-btn>
            <v-btn color="primary" @click="goNext">{{ t('setup.next') }}</v-btn>
          </div>
        </v-stepper-vertical-item>

        <v-stepper-vertical-item :value="3" :title="t('setup.stepBranding')" :complete="step > 3">
          <v-file-input
            :label="t('setup.logo')"
            accept="image/*"
            prepend-icon="mdi-image"
            clearable
            @update:model-value="onLogoFiles"
          />
          <v-alert v-if="logoError" type="error" class="mb-4" density="compact">{{ logoError }}</v-alert>
          <v-img
            v-if="form.logoDataUrl"
            :src="form.logoDataUrl"
            max-height="96"
            max-width="240"
            class="mb-6"
          />
          <v-file-input
            :label="t('setup.icon')"
            accept="image/*"
            prepend-icon="mdi-application"
            clearable
            @update:model-value="onIconFiles"
          />
          <v-alert v-if="iconError" type="error" class="mb-4" density="compact">{{ iconError }}</v-alert>
          <v-avatar v-if="form.iconDataUrl" size="48" class="mb-4">
            <v-img :src="form.iconDataUrl" />
          </v-avatar>
          <div class="d-flex justify-space-between mt-4">
            <v-btn variant="text" @click="goBack">{{ t('setup.back') }}</v-btn>
            <v-btn color="primary" @click="goNext">{{ t('setup.next') }}</v-btn>
          </div>
        </v-stepper-vertical-item>

        <v-stepper-vertical-item :value="4" :title="t('setup.stepAdmin')" :complete="step > 4">
          <v-text-field
            v-model="form.admin.name"
            :label="t('setup.adminName')"
            :rules="[(value) => Boolean(value && value.trim()) || t('setup.adminNameRequired')]"
          />
          <v-text-field
            v-model="form.admin.email"
            :label="t('setup.adminEmail')"
            type="email"
            autocomplete="username"
            :rules="[(value) => (value && value.includes('@')) || t('setup.adminEmailRequired')]"
          />
          <v-text-field
            v-model="form.admin.password"
            :label="t('setup.adminPassword')"
            type="password"
            autocomplete="new-password"
            :rules="[(value) => (value && value.length >= MIN_PASSWORD_LENGTH) || t('setup.passwordMin')]"
          />
          <v-text-field
            v-model="form.admin.confirm"
            :label="t('setup.adminConfirm')"
            type="password"
            autocomplete="new-password"
            :rules="[(value) => value === form.admin.password || t('setup.passwordMismatch')]"
          />
          <div class="d-flex justify-space-between mt-4">
            <v-btn variant="text" @click="goBack">{{ t('setup.back') }}</v-btn>
            <v-btn color="primary" :disabled="!adminValid" @click="goNext">
              {{ t('setup.next') }}
            </v-btn>
          </div>
        </v-stepper-vertical-item>

        <v-stepper-vertical-item :value="5" :title="t('setup.stepReview')">
          <v-alert v-if="errorMessage" type="error" class="mb-4" closable @click:close="errorMessage = ''">
            {{ errorMessage }}
          </v-alert>
          <v-list density="compact">
            <v-list-item v-for="row in reviewRows" :key="row.label">
              <v-list-item-title>{{ row.label }}</v-list-item-title>
              <v-list-item-subtitle>{{ row.value || t('setup.empty') }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <div class="d-flex align-center ga-4 mt-4">
            <v-img
              v-if="form.logoDataUrl"
              :src="form.logoDataUrl"
              max-height="64"
              max-width="160"
            />
            <v-avatar v-if="form.iconDataUrl" size="40">
              <v-img :src="form.iconDataUrl" />
            </v-avatar>
          </div>
          <div class="d-flex justify-space-between mt-6">
            <v-btn variant="text" :disabled="submitting" @click="goBack">{{ t('setup.back') }}</v-btn>
            <v-btn color="primary" :loading="submitting" :disabled="!companyValid || !adminValid" @click="submit">
              {{ t('setup.submit') }}
            </v-btn>
          </div>
        </v-stepper-vertical-item>
      </v-stepper-vertical>
    </v-card-text>
  </v-card>
</template>
