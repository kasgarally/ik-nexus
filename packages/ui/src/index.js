/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * @nexus/ui public exports
 */
export { default as NModal } from './components/dialogs/NModal.vue'
export { default as NRemoveIcon } from './components/dialogs/NRemoveIcon.vue'
export { default as NFileReplace } from './components/files/NFileReplace.vue'
export { default as NFileUpload } from './components/files/NFileUpload.vue'
export { useOwnerFiles } from './components/files/useOwnerFiles.js'
export { default as NListItemForm } from './components/lists/NListItemForm.vue'
export { default as NListItemsEditor } from './components/lists/NListItemsEditor.vue'
export { default as NListSelect } from './components/lists/NListSelect.vue'
export { useListItems } from './components/lists/useListItems.js'
export { default as NLocaleSelect } from './components/locale/NLocaleSelect.vue'
export { default as NDatePicker } from './components/pickers/NDatePicker.vue'
export { default as NTimePicker } from './components/pickers/NTimePicker.vue'
export { default as NSetupWizard } from './components/setup/NSetupWizard.vue'
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
