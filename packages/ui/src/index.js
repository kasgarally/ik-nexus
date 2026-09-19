/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * @nexus/ui public exports
 */
export { NEXUS_AUTH_KEY, safeNextPath, useNexusAuth } from './auth/inject.js'
export { default as NAccountSecurity } from './components/auth/NAccountSecurity.vue'
export { default as NForgotPassword } from './components/auth/NForgotPassword.vue'
export { default as NResetPassword } from './components/auth/NResetPassword.vue'
export { default as NSignIn } from './components/auth/NSignIn.vue'
export { default as NAccountForm } from './components/accounts/NAccountForm.vue'
export { default as NAccountsRegister } from './components/accounts/NAccountsRegister.vue'
export { default as NSettingsHeading } from './components/accounts/NSettingsHeading.vue'
export { default as NSettingsWorkspace } from './components/accounts/NSettingsWorkspace.vue'
export { useAccountsUsers } from './components/accounts/useAccountsUsers.js'
export { default as NAdminConfigCard } from './components/admin/NAdminConfigCard.vue'
export { default as NModal } from './components/dialogs/NModal.vue'
export { default as NRemoveIcon } from './components/dialogs/NRemoveIcon.vue'
export { default as NTranslatableTextarea } from './components/fields/NTranslatableTextarea.vue'
export { default as NTranslatableTextField } from './components/fields/NTranslatableTextField.vue'
export { default as NFileReplace } from './components/files/NFileReplace.vue'
export { default as NFileUpload } from './components/files/NFileUpload.vue'
export { useOwnerFiles } from './components/files/useOwnerFiles.js'
export { default as NListItemForm } from './components/lists/NListItemForm.vue'
export { default as NListItemsEditor } from './components/lists/NListItemsEditor.vue'
export { default as NListSelect } from './components/lists/NListSelect.vue'
export { useListItems } from './components/lists/useListItems.js'
export { default as NLocaleIcon } from './components/locale/NLocaleIcon.vue'
export { default as NLocaleSelect } from './components/locale/NLocaleSelect.vue'
export { default as NDatePicker } from './components/pickers/NDatePicker.vue'
export { default as NTimePicker } from './components/pickers/NTimePicker.vue'
export { default as NSetupWizard } from './components/setup/NSetupWizard.vue'
export {
  applyDocumentLocale,
  assertRequiredDataLocale,
  coerceLocalized,
  createNexusI18n,
  DEFAULT_STORAGE_KEY,
  emptyLocalizedMap,
  localeDisplayName,
  NEXUS_LOCALE_STORAGE_KEY,
  NEXUS_LOCALES_KEY,
  NEXUS_TRANSLATE_KEY,
  normalizeLocales,
  persistLocale,
  readStoredLocale,
  REQUIRED_DATA_LOCALE,
  resolveLocalized,
  setAppLocale,
  supportedLocales,
} from './i18n/createNexusI18n.js'
