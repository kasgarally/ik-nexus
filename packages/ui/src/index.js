/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * @nexus/ui public exports
 */
export { default as FileReplace } from './components/files/FileReplace.vue'
export { default as FileUpload } from './components/files/FileUpload.vue'
export { useOwnerFiles } from './components/files/useOwnerFiles.js'
export { default as LocaleSelect } from './components/locale/LocaleSelect.vue'
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
