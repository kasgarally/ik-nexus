<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Selected book in the WebLayout context pane
-->
<script setup>
import { Meteor } from 'meteor/meteor'
import { computed, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { IMAGE_MIME_TYPES } from '@nexus/files'
import { Lists } from '@nexus/lists'
import { NAdminConfigCard, NFileReplace, NModal, NRemoveIcon, useListItems, useOwnerFiles } from '@nexus/ui'
import { useUserRole } from '/imports/ui/useUserRole.js'
import { Books, localizedBookField } from '../collections/books.js'
import FrmBook from '../forms/FrmBook.vue'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const { items: categoryItems } = useListItems({ listKey: 'books.category' })

const bookId = computed(() =>
  typeof route.params.id === 'string' ? route.params.id : '',
)
const book = ref(null)
const formOpen = ref(false)
const removing = ref(false)
const canUpdate = useUserRole('books.update')
const canRemove = useUserRole('books.remove')
const canManageLists = useUserRole(['superadmin', 'admin'])

const configItems = computed(() => [
  {
    key: 'books.category',
    title: t('books.categories'),
    to: { name: 'bookCategories' },
    icon: 'mdi-format-list-bulleted',
  },
])

const imageAccept = IMAGE_MIME_TYPES.join(',')
let subscriptionHandle = null
let observer = null

const {
  documents: coverFiles,
  fileDownloadUrl: coverDownloadUrl,
} = useOwnerFiles({
  ownerType: 'bookCover',
  ownerId: bookId,
})
const {
  documents: pdfFiles,
  fileDownloadUrl: pdfDownloadUrl,
} = useOwnerFiles({
  ownerType: 'bookPdf',
  ownerId: bookId,
})

const cover = computed(() => coverFiles.value[0] || null)
const pdf = computed(() => pdfFiles.value[0] || null)

const displayTitle = computed(() => localizedBookField(book.value?.title, locale.value))
const displayAuthor = computed(() => localizedBookField(book.value?.author, locale.value))
const displayPublisher = computed(() => localizedBookField(book.value?.publisher, locale.value))
const displayDescription = computed(() => localizedBookField(book.value?.description, locale.value))
const displayAboutAuthor = computed(() => localizedBookField(book.value?.aboutAuthor, locale.value))

const categoryLabel = computed(() => {
  const code = book.value?.category
  if (!code) {
    return ''
  }
  const item = categoryItems.value.find((row) => row.code === code)
  return Lists.title(item, locale.value) || code
})

function formatPublishedOn(value) {
  if (!value) {
    return ''
  }
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return date.toISOString().slice(0, 10)
}

async function refreshBook(id) {
  if (!id) {
    book.value = null
    return
  }
  book.value = (await Books.findOneAsync(id)) || null
}

function stopWatching() {
  observer?.stop()
  observer = null
  subscriptionHandle?.stop()
  subscriptionHandle = null
}

function startWatching(id) {
  stopWatching()
  if (!id) {
    book.value = null
    return
  }

  subscriptionHandle = Meteor.subscribe('books.one', id)
  const cursor = Books.find({ _id: id })
  void refreshBook(id)
  observer = cursor.observe({
    added() {
      void refreshBook(id)
    },
    changed() {
      void refreshBook(id)
    },
    removed() {
      book.value = null
    },
  })
}

watch(
  bookId,
  (id) => {
    startWatching(id)
  },
  { immediate: true },
)

onUnmounted(() => {
  stopWatching()
})

async function removeBook() {
  if (!bookId.value) {
    return
  }
  removing.value = true
  try {
    await Meteor.callAsync('books.remove', { id: bookId.value })
    await router.push('/books')
  } finally {
    removing.value = false
  }
}
</script>

<template>
  <div class="d-flex flex-column ga-4">
    <v-card class="app-context-card">
      <template v-if="!bookId">
        <p class="app-muted">{{ t('books.select') }}</p>
      </template>
      <template v-else-if="!book">
        <p class="app-muted">{{ t('books.notFound') }}</p>
      </template>
      <template v-else>
      <div class="d-flex align-start justify-space-between mb-4">
        <h2 class="app-section-title">{{ displayTitle }}</h2>
        <div class="d-flex">
          <v-btn
            v-if="canUpdate"
            icon="mdi-pencil-outline"
            variant="text"
            :aria-label="t('books.editAria')"
            @click="formOpen = true"
          />
          <n-remove-icon
            v-if="canRemove"
            :title="t('books.removeTitle')"
            :text="t('books.removeConfirm', { title: displayTitle })"
            :disabled="removing"
            @confirm="removeBook"
          />
        </div>
      </div>

      <div class="d-flex justify-center mb-4">
        <n-file-replace
          v-if="canUpdate"
          owner-type="bookCover"
          :owner-id="book._id"
          variant="avatar"
          shape="square"
          :width="120"
          :height="160"
          :accept="imageAccept"
          :label="t('books.cover')"
        />
        <v-img
          v-else-if="cover"
          :src="coverDownloadUrl(cover._id)"
          :alt="cover.name"
          width="120"
          height="160"
          cover
        />
        <p v-else class="app-muted">{{ t('books.noCover') }}</p>
      </div>

      <dl class="app-detail-list">
        <template v-if="displayAuthor">
          <dt>{{ t('books.author') }}</dt>
          <dd>{{ displayAuthor }}</dd>
        </template>
        <template v-if="categoryLabel">
          <dt>{{ t('books.category') }}</dt>
          <dd>{{ categoryLabel }}</dd>
        </template>
        <template v-if="displayPublisher">
          <dt>{{ t('books.publisher') }}</dt>
          <dd>{{ displayPublisher }}</dd>
        </template>
        <template v-if="book.publishedOn">
          <dt>{{ t('books.publishedOn') }}</dt>
          <dd>{{ formatPublishedOn(book.publishedOn) }}</dd>
        </template>
        <template v-if="book.language">
          <dt>{{ t('books.language') }}</dt>
          <dd>{{ book.language }}</dd>
        </template>
        <template v-if="book.isbn">
          <dt>{{ t('books.isbn') }}</dt>
          <dd>{{ book.isbn }}</dd>
        </template>
      </dl>

      <p v-if="displayDescription" class="mt-4">{{ displayDescription }}</p>
      <p v-if="displayAboutAuthor" class="app-muted mt-4">{{ displayAboutAuthor }}</p>

      <div class="mt-6">
        <n-file-replace
          v-if="canUpdate"
          owner-type="bookPdf"
          :owner-id="book._id"
          variant="document"
          accept="application/pdf"
          :label="t('books.pdf')"
        />
        <v-btn
          v-else-if="pdf"
          block
          color="primary"
          :href="pdfDownloadUrl(pdf._id)"
          target="_blank"
          rel="noopener"
        >
          {{ t('books.openPdf') }}
        </v-btn>
        <p v-else class="app-muted">{{ t('books.noPdf') }}</p>
      </div>
      </template>

      <n-modal v-model="formOpen" :title="t('books.edit')">
        <frm-book
          v-if="formOpen && book"
          is-modal
          :book-id="book._id"
          @close="formOpen = false"
        />
      </n-modal>
    </v-card>
    <n-admin-config-card
      v-if="canManageLists"
      :title="t('books.config')"
      :items="configItems"
    />
  </div>
</template>

