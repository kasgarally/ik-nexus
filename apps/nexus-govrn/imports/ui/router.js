/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Vue Router routes
 */
import { createRouter, createWebHistory } from 'vue-router'
import Auth from './Auth.vue'
import Context from './Context.vue'
import Entry from './Entry.vue'

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
