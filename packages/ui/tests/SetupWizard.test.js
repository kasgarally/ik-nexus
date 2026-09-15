/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * First-run wizard submit path and field gates
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import en from '../src/i18n/locales/en.js'

const complete = vi.fn()
const loginWithPassword = vi.fn()

vi.mock('@nexus/setup', () => ({
  ICON_MAX_BYTES: 100 * 1024,
  LOGO_MAX_BYTES: 400 * 1024,
  MIN_PASSWORD_LENGTH: 8,
  Setup: {
    complete: (...args) => complete(...args),
    loginWithPassword: (...args) => loginWithPassword(...args),
  },
}))

const wizardSource = readFileSync(
  path.resolve('packages/ui/src/components/setup/SetupWizard.vue'),
  'utf8',
)

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en },
})

const vuetifyStubs = {
  VCard: { template: '<div><slot /></div>' },
  VCardTitle: { template: '<h2><slot /></h2>' },
  VCardSubtitle: { template: '<p><slot /></p>' },
  VCardText: { template: '<div><slot /></div>' },
  VStepperVertical: { template: '<div class="stepper"><slot /></div>' },
  VStepperVerticalItem: {
    props: ['value', 'title'],
    template: '<section :data-step="value"><slot /></section>',
  },
  VTextField: {
    props: ['modelValue', 'label'],
    emits: ['update:modelValue'],
    template:
      '<input :aria-label="label" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  },
  VFileInput: {
    name: 'VFileInput',
    props: ['label'],
    emits: ['update:modelValue'],
    template: '<input type="file" :aria-label="label" />',
  },
  VBtn: {
    props: ['disabled'],
    template: '<button type="button" :disabled="disabled"><slot /></button>',
  },
  VAlert: { template: '<div role="alert"><slot /></div>' },
  VImg: { props: ['src'], template: '<img :src="src" alt="" />' },
  VAvatar: { template: '<div><slot /></div>' },
  VList: { template: '<ul><slot /></ul>' },
  VListItem: { template: '<li><slot /></li>' },
  VListItemTitle: { template: '<span><slot /></span>' },
  VListItemSubtitle: { template: '<span><slot /></span>' },
}

async function mountWizard() {
  const { default: SetupWizard } = await import('../src/components/setup/SetupWizard.vue')
  return mount(SetupWizard, {
    attachTo: document.body,
    global: {
      plugins: [i18n],
      stubs: vuetifyStubs,
    },
  })
}

function buttonByText(wrapper, text) {
  return wrapper.findAll('button').find((button) => button.text() === text)
}

function nextOnStep(wrapper, step) {
  return wrapper
    .get(`[data-step="${step}"]`)
    .findAll('button')
    .find((button) => button.text() === 'Next')
}

async function fillValidWizard(wrapper) {
  await wrapper.get('[aria-label="Company name"]').setValue('Acme Holdings')
  await nextOnStep(wrapper, 1).trigger('click')
  await nextOnStep(wrapper, 2).trigger('click')
  await nextOnStep(wrapper, 3).trigger('click')
  await wrapper.get('[aria-label="Display name"]').setValue('Ada Lovelace')
  await wrapper.get('[aria-label="Admin email"]').setValue('ada@example.com')
  await wrapper.get('[aria-label="Password"]').setValue('longenough')
  await wrapper.get('[aria-label="Confirm password"]').setValue('longenough')
  await nextOnStep(wrapper, 4).trigger('click')
}

describe('@nexus/ui SetupWizard', () => {
  beforeEach(() => {
    complete.mockReset()
    loginWithPassword.mockReset()
    complete.mockResolvedValue({ ok: true })
    loginWithPassword.mockResolvedValue(undefined)
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('does not import meteor packages from the SFC', () => {
    expect(wizardSource).not.toMatch(/from ['"]meteor\//)
  })

  it('keeps Company Next disabled until a company name is entered', async () => {
    const wrapper = await mountWizard()
    expect(nextOnStep(wrapper, 1).attributes('disabled')).toBeDefined()
    await wrapper.get('[aria-label="Company name"]').setValue('Acme Holdings')
    expect(nextOnStep(wrapper, 1).attributes('disabled')).toBeUndefined()
  })

  it('keeps First admin Next disabled until the password is confirmed', async () => {
    const wrapper = await mountWizard()
    await wrapper.get('[aria-label="Company name"]').setValue('Acme Holdings')
    await nextOnStep(wrapper, 1).trigger('click')
    await nextOnStep(wrapper, 2).trigger('click')
    await nextOnStep(wrapper, 3).trigger('click')

    await wrapper.get('[aria-label="Display name"]').setValue('Ada Lovelace')
    await wrapper.get('[aria-label="Admin email"]').setValue('ada@example.com')
    await wrapper.get('[aria-label="Password"]').setValue('longenough')
    expect(nextOnStep(wrapper, 4).attributes('disabled')).toBeDefined()

    await wrapper.get('[aria-label="Confirm password"]').setValue('longenough')
    expect(nextOnStep(wrapper, 4).attributes('disabled')).toBeUndefined()
  })

  it('calls Setup.complete then loginWithPassword and emits completed', async () => {
    const wrapper = await mountWizard()
    await fillValidWizard(wrapper)
    await buttonByText(wrapper, 'Complete setup').trigger('click')
    await vi.waitFor(() => expect(complete).toHaveBeenCalled())

    expect(complete).toHaveBeenCalledWith(
      expect.objectContaining({
        companyName: 'Acme Holdings',
        admin: {
          name: 'Ada Lovelace',
          email: 'ada@example.com',
          password: 'longenough',
        },
      }),
    )
    expect(complete.mock.calls[0][0]).not.toHaveProperty('admin.confirm')
    expect(loginWithPassword).toHaveBeenCalledWith('ada@example.com', 'longenough')
    expect(wrapper.emitted('completed')).toHaveLength(1)
  })

  it('shows the method reason on the review step when complete fails', async () => {
    complete.mockRejectedValue({ reason: 'This application is already set up' })
    const wrapper = await mountWizard()
    await fillValidWizard(wrapper)
    await buttonByText(wrapper, 'Complete setup').trigger('click')
    await vi.waitFor(() => expect(wrapper.get('[role="alert"]').text()).toContain('already set up'))
    expect(loginWithPassword).not.toHaveBeenCalled()
    expect(wrapper.emitted('completed')).toBeUndefined()
  })

  it('rejects a non-image logo before submit', async () => {
    const wrapper = await mountWizard()
    await wrapper.get('[aria-label="Company name"]').setValue('Acme Holdings')
    await nextOnStep(wrapper, 1).trigger('click')
    await nextOnStep(wrapper, 2).trigger('click')

    await wrapper.findAllComponents({ name: 'VFileInput' })[0].vm.$emit('update:modelValue', {
      type: 'application/pdf',
      size: 12,
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.get('[role="alert"]').text()).toBe('Choose an image file')
  })
})
