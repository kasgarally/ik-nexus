/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * @nexus/ui public exports
 */
export { default as LocaleSelect } from './components/LocaleSelect.vue'
export {
  applyDocumentLocale,
  createNexusI18n,
  DEFAULT_STORAGE_KEY,
  NEXUS_LOCALE_STORAGE_KEY,
  persistLocale,
  readStoredLocale,
  setAppLocale,
  supportedLocales,
} from './i18n/createNexusI18n.js'
