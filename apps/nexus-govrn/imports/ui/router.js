/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Vue Router routes
 */
import { createRouter, createWebHistory } from 'vue-router'
import Auth from './Auth.vue'
import Context from './Context.vue'
import Entry from './Entry.vue'
import FilesTest from './FilesTest.vue'
import ListsTest from './ListsTest.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Entry,
      meta: { layout: 'web' },
    },
    {
      path: '/signin',
      name: 'signin',
      component: Auth,
      meta: { layout: 'auth' },
    },
    {
      path: '/files-test',
      name: 'filesTest',
      component: FilesTest,
      meta: { layout: 'web' },
    },
    {
      path: '/lists-test',
      name: 'listsTest',
      component: ListsTest,
      meta: { layout: 'web' },
    },
    {
      path: '/workspace',
      name: 'workspace',
      components: {
        default: Entry,
        context: Context,
      },
      meta: { layout: 'web', context: true },
    },
  ],
})
