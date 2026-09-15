<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Test page for the four file-upload variants
-->
<script setup>
import { DOCUMENT_MIME_TYPES, IMAGE_MIME_TYPES } from '@nexus/files'
import { FileReplace, FileUpload } from '@nexus/ui'
import { useI18n } from 'vue-i18n'
import {
  DEMO_MANY_DOC_ID,
  DEMO_MANY_IMAGES_ID,
  DEMO_ONE_AVATAR_ID,
  DEMO_ONE_DOC_ID,
} from '/imports/api/filesDemoParents.js'

const { t } = useI18n()
const documentAccept = DOCUMENT_MIME_TYPES.join(',')
const imageAccept = IMAGE_MIME_TYPES.join(',')
</script>

<template>
  <v-row>
    <v-col cols="12">
      <h1 class="text-h4 mb-2">{{ t('filesTest.title') }}</h1>
      <p class="text-medium-emphasis mb-6">{{ t('filesTest.body') }}</p>
    </v-col>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-title>{{ t('filesTest.oneDocTitle') }}</v-card-title>
        <v-card-text>
          <p class="text-medium-emphasis mb-4">{{ t('filesTest.oneDocHint') }}</p>
          <FileReplace
            owner-type="demo"
            :owner-id="DEMO_ONE_DOC_ID"
            variant="document"
            :accept="documentAccept"
          />
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-title>{{ t('filesTest.oneAvatarTitle') }}</v-card-title>
        <v-card-text>
          <p class="text-medium-emphasis mb-4">{{ t('filesTest.oneAvatarHint') }}</p>
          <FileReplace
            owner-type="demo"
            :owner-id="DEMO_ONE_AVATAR_ID"
            variant="avatar"
            :accept="imageAccept"
            shape="round"
            :width="128"
            :height="128"
          />
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-title>{{ t('filesTest.manyDocTitle') }}</v-card-title>
        <v-card-text>
          <p class="text-medium-emphasis mb-4">{{ t('filesTest.manyDocHint') }}</p>
          <FileUpload
            owner-type="demo"
            :owner-id="DEMO_MANY_DOC_ID"
            variant="document"
            :accept="documentAccept"
          />
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-title>{{ t('filesTest.manyImagesTitle') }}</v-card-title>
        <v-card-text>
          <p class="text-medium-emphasis mb-4">{{ t('filesTest.manyImagesHint') }}</p>
          <FileUpload
            owner-type="demo"
            :owner-id="DEMO_MANY_IMAGES_ID"
            variant="images"
            :accept="imageAccept"
            :thumbnail-width="140"
            :thumbnail-height="140"
          />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
