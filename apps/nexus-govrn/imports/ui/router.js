/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Vue Router: core app routes plus settings, Books, and ui/demo previews
 */
import { Meteor } from 'meteor/meteor'
import { createRouter, createWebHistory } from 'vue-router'
import { Setup } from '@nexus/setup'
import AccountSecurity from './AccountSecurity.vue'
import Auth from './Auth.vue'
import ForgotPassword from './ForgotPassword.vue'
import ResetPassword from './ResetPassword.vue'
import Onboarding from './Onboarding.vue'
import Entry from './Entry.vue'
import { bookRoutes } from '/imports/apps/Books/client/routes.js'
import { demoRoutes } from './demo/routes.js'
import { settingsRoutes } from './settings/routes.js'

export const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.name !== from.name) {
      return { top: 0 }
    }
    return undefined
  },
  routes: [
    {
      path: '/onboarding',
      name: 'onboarding',
      component: Onboarding,
      meta: { layout: 'setup' },
    },
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
      path: '/forgot-password',
      name: 'forgotPassword',
      component: ForgotPassword,
      meta: { layout: 'auth' },
    },
    {
      path: '/reset-password/:token',
      name: 'resetPassword',
      component: ResetPassword,
      meta: { layout: 'auth' },
    },
    {
      path: '/account',
      name: 'account',
      component: AccountSecurity,
      meta: { layout: 'web', requiresAuth: true },
    },
    ...settingsRoutes,
    ...bookRoutes,
    ...demoRoutes,
  ],
})

router.beforeEach(async (to) => {
  try {
    const { complete } = await Setup.isComplete()
    if (!complete && to.path !== '/onboarding') {
      return { path: '/onboarding' }
    }
    if (complete && to.path === '/onboarding') {
      return { path: '/' }
    }
  } catch {
    if (to.path !== '/onboarding') {
      return { path: '/onboarding' }
    }
  }

  const signedIn = Boolean(Meteor.userId())
  if (to.meta.requiresAuth && !signedIn) {
    return { path: '/signin', query: { next: to.fullPath } }
  }
  return true
})
