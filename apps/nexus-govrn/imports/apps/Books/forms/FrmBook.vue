<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Create and update one book (metadata only; files live on the context pane)
-->
<script setup>
import { Meteor } from 'meteor/meteor'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { NDatePicker, NListSelect } from '@nexus/ui'
import { Books } from '../collections/books.js'

const props = defineProps({
  bookId: { type: String, default: '' },
  isModal: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'saved'])
const { t } = useI18n()

function emptyBook() {
  return {
    title: '',
    description: '',
    author: '',
    aboutAuthor: '',
    publisher: '',
    publishedOn: '',
    language: '',
    isbn: '',
    category: null,
  }
}

const form = reactive(emptyBook())
const saving = ref(false)
const errorMessage = ref('')

const isUpdate = computed(() => Boolean(props.bookId))
const languageItems = computed(() => [
  { value: 'en', title: t('locale.en') },
  { value: 'fr', title: t('locale.fr') },
  { value: 'ar', title: t('locale.ar') },
])

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
  Object.assign(form, emptyBook(), book
    ? {
        title: book.title || '',
        description: book.description || '',
        author: book.author || '',
        aboutAuthor: book.aboutAuthor || '',
        publisher: book.publisher || '',
        publishedOn: toIsoDate(book.publishedOn),
        language: book.language || '',
        isbn: book.isbn || '',
        category: book.category || null,
      }
    : {})
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
    <v-text-field v-model="form.title" :label="t('books.titleLabel')" required class="mb-2" />
    <v-textarea v-model="form.description" :label="t('books.description')" rows="3" auto-grow class="mb-2" />
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field v-model="form.author" :label="t('books.author')" />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field v-model="form.publisher" :label="t('books.publisher')" />
      </v-col>
    </v-row>
    <v-textarea v-model="form.aboutAuthor" :label="t('books.aboutAuthor')" rows="2" auto-grow class="mb-2" />
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
