/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Lightbox shows a real img with viewport constraints
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { afterEach, describe, expect, it } from 'vitest'
import NFileLightbox from '../src/components/files/NFileLightbox.vue'

const lightboxSource = readFileSync(
  path.resolve('packages/ui/src/components/files/NFileLightbox.vue'),
  'utf8',
)

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {
      files: {
        previous: 'Previous image',
        close: 'Close',
        next: 'Next image',
      },
    },
  },
})

const vuetifyStubs = {
  VOverlay: {
    props: ['modelValue'],
    template: '<div class="v-overlay"><slot /></div>',
  },
  VBtn: {
    props: ['disabled', 'icon'],
    template:
      '<button type="button" :disabled="disabled" :aria-label="$attrs[\'aria-label\']"><slot /></button>',
  },
}

const gallery = [
  { _id: 'file-a', name: 'first.png' },
  { _id: 'file-b', name: 'second.png' },
]

function mountLightbox(props = {}) {
  return mount(NFileLightbox, {
    attachTo: document.body,
    props: {
      modelValue: true,
      files: gallery,
      index: 0,
      downloadUrlFor: (fileId) => `/nexus-files/${fileId}`,
      ...props,
    },
    global: {
      plugins: [i18n],
      stubs: vuetifyStubs,
    },
  })
}

describe('@nexus/ui NFileLightbox', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders a native img that uses the download URL', () => {
    mountLightbox()
    const image = document.querySelector('img.file-lightbox-image')
    expect(image).toBeTruthy()
    expect(image.getAttribute('src')).toBe('/nexus-files/file-a')
    expect(image.getAttribute('alt')).toBe('first.png')
  })

  it('constrains the image to 90vw by 80vh so the overlay cannot collapse', () => {
    mountLightbox()
    expect(document.querySelector('img.file-lightbox-image')).toBeTruthy()
    expect(lightboxSource).toContain('max-width: 90vw')
    expect(lightboxSource).toContain('max-height: 80vh')
    expect(lightboxSource).toContain('object-fit: contain')
    expect(lightboxSource).not.toContain('<v-img')
  })

  it('emits the previous next and close updates', async () => {
    const wrapper = mountLightbox({ index: 1 })
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(3)

    await buttons[0].trigger('click')
    expect(wrapper.emitted('update:index')?.[0]).toEqual([0])

    await buttons[2].trigger('click')
    expect(wrapper.emitted('update:index')).toHaveLength(1)

    await buttons[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('disables previous on the first image and next on the last', () => {
    const first = mountLightbox({ index: 0 })
    const firstButtons = first.findAll('button')
    expect(firstButtons[0].attributes('disabled')).toBeDefined()
    expect(firstButtons[2].attributes('disabled')).toBeUndefined()
    first.unmount()

    const last = mountLightbox({ index: 1 })
    const lastButtons = last.findAll('button')
    expect(lastButtons[0].attributes('disabled')).toBeUndefined()
    expect(lastButtons[2].attributes('disabled')).toBeDefined()
    last.unmount()
  })
})
