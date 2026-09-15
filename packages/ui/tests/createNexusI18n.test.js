/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Locale factory, storage, and document dir
 */
import { describe, expect, it, beforeEach } from 'vitest'
import {
  applyDocumentLocale,
  createNexusI18n,
  DEFAULT_STORAGE_KEY,
  persistLocale,
  readStoredLocale,
  setAppLocale,
  supportedLocales,
} from '../src/i18n/createNexusI18n.js'

describe('@nexus/ui createNexusI18n', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.lang = 'en'
    document.documentElement.dir = 'ltr'
  })

  it('lists English French and Arabic', () => {
    expect(supportedLocales.map((locale) => locale.code)).toEqual(['en', 'fr', 'ar'])
  })

  it('falls back to en when storage is empty or unknown', () => {
    expect(readStoredLocale()).toBe('en')
    localStorage.setItem(DEFAULT_STORAGE_KEY, 'de')
    expect(readStoredLocale()).toBe('en')
  })

  it('reads a stored locale when it is supported', () => {
    persistLocale('fr')
    expect(readStoredLocale()).toBe('fr')
  })

  it('sets lang and rtl dir for Arabic', () => {
    applyDocumentLocale('ar')
    expect(document.documentElement.lang).toBe('ar')
    expect(document.documentElement.dir).toBe('rtl')
  })

  it('sets ltr dir for French', () => {
    applyDocumentLocale('fr')
    expect(document.documentElement.lang).toBe('fr')
    expect(document.documentElement.dir).toBe('ltr')
  })

  it('ignores an unsupported code in setAppLocale', () => {
    const localeRef = { value: 'en' }
    setAppLocale(localeRef, 'de')
    expect(localeRef.value).toBe('en')
  })

  it('merges app messages and Vuetify catalogs', () => {
    persistLocale('en')
    const i18n = createNexusI18n({
      messages: {
        en: { filesTest: { title: 'Files test' } },
        fr: { filesTest: { title: 'Test fichiers' } },
        ar: { filesTest: { title: 'اختبار الملفات' } },
      },
    })
    expect(i18n.global.t('files.upload')).toBe('Upload files')
    expect(i18n.global.t('filesTest.title')).toBe('Files test')
    expect(i18n.global.getLocaleMessage('en').$vuetify).toBeTypeOf('object')
  })
})
