<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Create and update one book (metadata only; files live on the context pane)
-->
<script setup>
import { Meteor } from 'meteor/meteor'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  localeDisplayName,
  NDatePicker,
  NListSelect,
  NTranslatableTextarea,
  NTranslatableTextField,
} from '@nexus/ui'
import { appLocales, coerceLocalized, emptyLocalizedMap } from '/imports/api/appLocales.js'
import { BOOK_PROSE_FIELDS, Books } from '../collections/books.js'

const props = defineProps({
  bookId: { type: String, default: '' },
  isModal: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'saved'])
const { t, te } = useI18n()

function emptyBook() {
  const next = {
    publishedOn: '',
    language: '',
    isbn: '',
    category: null,
  }
  for (const name of BOOK_PROSE_FIELDS) {
    next[name] = emptyLocalizedMap(appLocales.data)
  }
  return next
}

const form = reactive(emptyBook())
const saving = ref(false)
const errorMessage = ref('')

const isUpdate = computed(() => Boolean(props.bookId))
const languageItems = computed(() =>
  appLocales.ui.map((code) => ({
    value: code,
    title: localeDisplayName(code, t, te),
  })),
)

function toIsoDate(value) {
  if (!value) {
    return ''
  }
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return date.toISOString().slice(0, 10)
}

function applyBook(book) {
  const next = emptyBook()
  if (book) {
    for (const name of BOOK_PROSE_FIELDS) {
      next[name] = coerceLocalized(book[name], appLocales)
    }
    next.publishedOn = toIsoDate(book.publishedOn)
    next.language = book.language || ''
    next.isbn = book.isbn || ''
    next.category = book.category || null
  }
  Object.assign(form, next)
}

async function loadBook() {
  if (!props.bookId) {
    applyBook(null)
    return
  }
  const book = await Books.findOneAsync(props.bookId)
  applyBook(book)
}

onMounted(() => {
  void loadBook()
})

watch(
  () => props.bookId,
  () => {
    void loadBook()
  },
)

function payload() {
  return {
    ...form,
    publishedOn: form.publishedOn || null,
    category: form.category || '',
  }
}

async function submit() {
  errorMessage.value = ''
  saving.value = true
  try {
    let id = props.bookId
    if (isUpdate.value) {
      await Meteor.callAsync('books.update', { id, ...payload() })
    } else {
      id = await Meteor.callAsync('books.insert', payload())
    }
    emit('saved', id)
    emit('close')
  } catch (error) {
    errorMessage.value = error.reason || error.message || t('books.saving')
  } finally {
    saving.value = false
  }
}

function cancel() {
  emit('close')
}
</script>

<template>
  <v-form @submit.prevent="submit">
    <v-alert v-if="errorMessage" type="error" class="mb-4" closable @click:close="errorMessage = ''">
      {{ errorMessage }}
    </v-alert>
    <n-translatable-text-field
      v-model="form.title"
      :label="t('books.titleLabel')"
      :required="true"
      class="mb-2"
    />
    <n-translatable-textarea
      v-model="form.description"
      :label="t('books.description')"
      rows="3"
      auto-grow
      class="mb-2"
    />
    <v-row>
      <v-col cols="12" md="6">
        <n-translatable-text-field v-model="form.author" :label="t('books.author')" />
      </v-col>
      <v-col cols="12" md="6">
        <n-translatable-text-field v-model="form.publisher" :label="t('books.publisher')" />
      </v-col>
    </v-row>
    <n-translatable-textarea
      v-model="form.aboutAuthor"
      :label="t('books.aboutAuthor')"
      rows="2"
      auto-grow
      class="mb-2"
    />
    <v-row>
      <v-col cols="12" md="4">
        <n-date-picker v-model="form.publishedOn" :label="t('books.publishedOn')" clearable />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="form.language"
          :items="languageItems"
          item-value="value"
          item-title="title"
          :label="t('books.language')"
          clearable
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field v-model="form.isbn" :label="t('books.isbn')" />
      </v-col>
    </v-row>
    <n-list-select v-model="form.category" list-key="books.category" :label="t('books.category')" class="mb-4" />
    <div class="d-flex justify-end ga-2">
      <v-btn v-if="isModal" variant="text" :disabled="saving" @click="cancel">
        {{ t('books.cancel') }}
      </v-btn>
      <v-btn type="submit" color="primary" :loading="saving">
        {{ t('books.save') }}
      </v-btn>
    </div>
  </v-form>
</template>
