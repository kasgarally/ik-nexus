<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Admin editor for nexus_setup company, address, and branding
-->
<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ICON_MAX_BYTES, LOGO_MAX_BYTES } from '@nexus/setup'
import { firstFile, readImageDataUrl } from './readSetupImage.js'
import { useSetupCurrent } from './useSetupCurrent.js'

const { t } = useI18n()
const { document, ready, saving, errorMessage, update } = useSetupCurrent()

const form = ref(emptyForm())
const savedLogo = ref('')
const savedIcon = ref('')
const dirty = ref(false)
const filling = ref(false)
const saved = ref(false)
const logoError = ref('')
const iconError = ref('')

const companyValid = computed(() => form.value.companyName.trim().length > 0)

watch(
  [document, ready],
  () => {
    if (!ready.value || !document.value || dirty.value) {
      return
    }
    fillForm(document.value)
  },
  { immediate: true },
)

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
  }
}

function fillForm(row) {
  filling.value = true
  form.value = {
    companyName: row.companyName || '',
    legalName: row.legalName || '',
    website: row.website || '',
    phone: row.phone || '',
    email: row.email || '',
    address: {
      line1: row.address?.line1 || '',
      line2: row.address?.line2 || '',
      city: row.address?.city || '',
      region: row.address?.region || '',
      postalCode: row.address?.postalCode || '',
      country: row.address?.country || '',
    },
    logoDataUrl: row.logoDataUrl || '',
    iconDataUrl: row.iconDataUrl || '',
  }
  savedLogo.value = form.value.logoDataUrl
  savedIcon.value = form.value.iconDataUrl
  void nextTick(() => {
    filling.value = false
  })
}

function imageMessages(tooLargeKey) {
  return {
    imageType: t('setup.imageType'),
    tooLarge: t(tooLargeKey),
  }
}

function markDirty() {
  if (filling.value) {
    return
  }
  dirty.value = true
  saved.value = false
}

async function onLogoFiles(files) {
  logoError.value = ''
  markDirty()
  const file = firstFile(files)
  if (!file) {
    form.value.logoDataUrl = savedLogo.value
    return
  }
  try {
    form.value.logoDataUrl = await readImageDataUrl(file, LOGO_MAX_BYTES, imageMessages('setup.logoTooLarge'))
  } catch (error) {
    form.value.logoDataUrl = savedLogo.value
    logoError.value = error.message || String(error)
  }
}

async function onIconFiles(files) {
  iconError.value = ''
  markDirty()
  const file = firstFile(files)
  if (!file) {
    form.value.iconDataUrl = savedIcon.value
    return
  }
  try {
    form.value.iconDataUrl = await readImageDataUrl(file, ICON_MAX_BYTES, imageMessages('setup.iconTooLarge'))
  } catch (error) {
    form.value.iconDataUrl = savedIcon.value
    iconError.value = error.message || String(error)
  }
}

function clearLogo() {
  form.value.logoDataUrl = ''
  logoError.value = ''
  markDirty()
}

function clearIcon() {
  form.value.iconDataUrl = ''
  iconError.value = ''
  markDirty()
}

async function save() {
  saved.value = false
  if (!companyValid.value) {
    return
  }
  try {
    await update({
      companyName: form.value.companyName,
      legalName: form.value.legalName,
      website: form.value.website,
      phone: form.value.phone,
      email: form.value.email,
      address: { ...form.value.address },
      logoDataUrl: form.value.logoDataUrl || '',
      iconDataUrl: form.value.iconDataUrl || '',
    })
    dirty.value = false
    if (document.value) {
      fillForm(document.value)
    }
    saved.value = true
  } catch {
    // errorMessage is set by useSetupCurrent
  }
}
</script>

<template>
  <v-card>
    <v-card-title class="text-h5">{{ t('setup.editTitle') }}</v-card-title>
    <v-card-subtitle>{{ t('setup.editSubtitle') }}</v-card-subtitle>
    <v-card-text>
      <v-alert v-if="errorMessage" type="error" class="mb-4" closable @click:close="errorMessage = ''">
        {{ errorMessage }}
      </v-alert>
      <v-alert v-if="saved" type="success" class="mb-4" closable @click:close="saved = false">
        {{ t('setup.saved') }}
      </v-alert>
      <p v-if="!ready" class="app-muted">{{ t('setup.loading') }}</p>
      <div v-else>
        <v-text-field
          v-model="form.companyName"
          :label="t('setup.companyName')"
          :rules="[(value) => Boolean(value && value.trim()) || t('setup.companyNameRequired')]"
          @update:model-value="markDirty"
        />
        <v-text-field v-model="form.legalName" :label="t('setup.legalName')" @update:model-value="markDirty" />
        <v-text-field v-model="form.website" :label="t('setup.website')" @update:model-value="markDirty" />
        <v-text-field v-model="form.phone" :label="t('setup.phone')" @update:model-value="markDirty" />
        <v-text-field
          v-model="form.email"
          :label="t('setup.email')"
          type="email"
          @update:model-value="markDirty"
        />

        <h3 class="text-subtitle-1 mt-6 mb-2">{{ t('setup.stepAddress') }}</h3>
        <v-text-field v-model="form.address.line1" :label="t('setup.line1')" @update:model-value="markDirty" />
        <v-text-field v-model="form.address.line2" :label="t('setup.line2')" @update:model-value="markDirty" />
        <v-text-field v-model="form.address.city" :label="t('setup.city')" @update:model-value="markDirty" />
        <v-text-field v-model="form.address.region" :label="t('setup.region')" @update:model-value="markDirty" />
        <v-text-field
          v-model="form.address.postalCode"
          :label="t('setup.postalCode')"
          @update:model-value="markDirty"
        />
        <v-text-field v-model="form.address.country" :label="t('setup.country')" @update:model-value="markDirty" />

        <h3 class="text-subtitle-1 mt-6 mb-2">{{ t('setup.stepBranding') }}</h3>
        <v-file-input
          :label="t('setup.logo')"
          accept="image/*"
          prepend-icon="mdi-image"
          clearable
          @update:model-value="onLogoFiles"
        />
        <v-alert v-if="logoError" type="error" class="mb-4" density="compact">{{ logoError }}</v-alert>
        <div v-if="form.logoDataUrl" class="d-flex align-center ga-4 mb-6">
          <v-img :src="form.logoDataUrl" max-height="96" max-width="240" />
          <v-btn variant="text" @click="clearLogo">{{ t('setup.removeLogo') }}</v-btn>
        </div>
        <v-file-input
          :label="t('setup.icon')"
          accept="image/*"
          prepend-icon="mdi-application"
          clearable
          @update:model-value="onIconFiles"
        />
        <v-alert v-if="iconError" type="error" class="mb-4" density="compact">{{ iconError }}</v-alert>
        <div v-if="form.iconDataUrl" class="d-flex align-center ga-4 mb-4">
          <v-avatar size="48">
            <v-img :src="form.iconDataUrl" />
          </v-avatar>
          <v-btn variant="text" @click="clearIcon">{{ t('setup.removeIcon') }}</v-btn>
        </div>

        <div class="d-flex justify-end mt-6">
          <v-btn color="primary" :loading="saving" :disabled="!companyValid || saving" @click="save">
            {{ t('setup.save') }}
          </v-btn>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>
