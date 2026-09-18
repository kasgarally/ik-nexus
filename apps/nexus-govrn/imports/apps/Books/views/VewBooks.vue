<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Books register — row click pushes /books/:id
-->
<script setup>
import { Meteor } from 'meteor/meteor'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { Lists } from '@nexus/lists'
import { useListItems } from '@nexus/ui'
import { Books } from '../collection.js'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const { items: categoryItems } = useListItems({ listKey: 'books.category' })

const rows = ref([])
const ready = ref(false)
let subscriptionHandle = null
let observer = null

const selectedId = computed(() =>
  typeof route.params.id === 'string' ? route.params.id : '',
)

function categoryLabel(code) {
  if (!code) {
    return ''
  }
  const item = categoryItems.value.find((row) => row.code === code)
  return Lists.title(item, locale.value) || code
}

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

async function refreshRows() {
  rows.value = await Books.find({}, { sort: { createdAt: -1 } }).fetchAsync()
}

function startWatching() {
  subscriptionHandle = Meteor.subscribe('books.list', {
    onReady() {
      ready.value = true
    },
  })
  const cursor = Books.find({}, { sort: { createdAt: -1 } })
  void refreshRows()
  observer = cursor.observe({
    added() {
      void refreshRows()
    },
    changed() {
      void refreshRows()
    },
    removed() {
      void refreshRows()
    },
  })
}

function selectBook(id) {
  if (selectedId.value === id) {
    return
  }
  void router.push({ name: 'books', params: { id } })
}

onMounted(() => {
  startWatching()
})

onUnmounted(() => {
  observer?.stop()
  subscriptionHandle?.stop()
})
</script>

<template>
  <div class="app-register">
    <v-card>
      <div
        class="app-table-scroll"
        tabindex="0"
        role="region"
        :aria-label="t('books.title')"
      >
        <table class="app-table">
          <thead>
            <tr>
              <th scope="col">{{ t('books.columns.title') }}</th>
              <th scope="col">{{ t('books.columns.author') }}</th>
              <th scope="col">{{ t('books.columns.category') }}</th>
              <th scope="col">{{ t('books.columns.publishedOn') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in rows"
              :key="row._id"
              :class="{ 'is-selected': selectedId === row._id }"
            >
              <td>
                <button
                  type="button"
                  class="app-link"
                  :aria-current="selectedId === row._id ? 'true' : undefined"
                  @click="selectBook(row._id)"
                >
                  {{ row.title }}
                </button>
              </td>
              <td>{{ row.author }}</td>
              <td>{{ categoryLabel(row.category) }}</td>
              <td>{{ formatPublishedOn(row.publishedOn) }}</td>
            </tr>
            <tr v-if="ready && !rows.length">
              <td colspan="4">{{ t('books.empty') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </v-card>
  </div>
</template>
