<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
@nexus/ui concepts: N prefix, inject, i18n, widgets
-->
# @nexus/ui

Shared Vue 3 widgets and i18n bootstrap. No `meteor/*` imports. No Google Translate client. The app supplies Vue / Vuetify / vue-i18n as peers and injects Meteor-backed functions after `registerWithMeteor`.

Back to [_Architecture.md](_Architecture.md). Package API: [`packages/ui/README.md`](../../packages/ui/README.md).

## Contents

- [N prefix](#n-prefix)
- [What this package does not own](#what-this-package-does-not-own)
- [Inject keys](#inject-keys)
- [i18n](#i18n)
- [Widget groups](#widget-groups)
- [How the app mounts it](#how-the-app-mounts-it)
- [What not to do](#what-not-to-do)
- [Source map](#source-map)

## N prefix

Every reusable Vue component under `packages/ui/src/components/` uses the NEXUS `N` prefix:

- File and export: `NFileUpload`
- Template: `<n-file-upload>`

That distinguishes NEXUS widgets from app-local components and Vuetify’s `v-*`. Internal building blocks (`NFileRow`, `NListItemForm`) use the same prefix. Composables stay `use…` (`useOwnerFiles`, `useListItems`).

## What this package does not own

Layouts, router, Vuetify theme, and product collections stay in the app. GridFS is [Files](files.md). Select items are [Lists](lists.md). First-run install is [Setup](setup.md). User DDP is [Accounts](accounts.md). After the app registers those packages, widgets call `Files.*` / `Lists.*` / `Setup.*` / accounts helpers.

## Inject keys

| Key | Provided by | Used by |
|-----|-------------|---------|
| `NEXUS_LOCALES_KEY` | `createNexusI18n` → `app.use(i18n)` | Translatable fields, list form |
| `NEXUS_TRANSLATE_KEY` | App `provide` → `Meteor.callAsync('locales.translate')` | Translate icon (optional) |
| `NEXUS_AUTH_KEY` | App `provide` → `@nexus/accounts` wrappers | `NSignIn`, reset, `NAccountSecurity` |
| `NEXUS_LOCALE_STORAGE_KEY` | `createNexusI18n` | `NLocaleSelect` / `NLocaleIcon` persistence |

If translate is not provided, the icon is hidden. If locales are missing, helpers fall back to English-only `defaultLocales()`.

## i18n

`createNexusI18n({ locales, storageKey, messages })` merges core `locale.*` / `files.*` / `lists.*` / `setup.*` / `settings.*` / `accounts.*` / `auth.*` strings and Vuetify `$vuetify` catalogs with the app’s packs. `fallbackLocale` is `defaultUi`. `NLocaleSelect` lists `locales.ui` and is hidden when that list has fewer than two codes. Arabic sets `dir="rtl"`.

Server code that only needs `normalizeLocales` must import `@nexus/ui/src/i18n/locales.js` (GovRN: `appLocales.js`), not the Vue barrel.

See [Locales](locales.md) for UI vs data.

## Widget groups

| Group | Components | Talks to |
|-------|------------|----------|
| Locale | `NLocaleSelect`, `NLocaleIcon` | vue-i18n + `localStorage` |
| Maps | `NTranslatableTextField`, `NTranslatableTextarea` | [Translatable fields](translatable-fields.md) |
| Lists | `NListSelect`, `NListItemsEditor`, `NListItemForm` | [Lists](lists.md) |
| Files | `NFileUpload`, `NFileReplace` | [Files](files.md) |
| Setup | `NSetupWizard` | [Setup](setup.md) |
| Accounts | `NSettingsWorkspace`, `NAccountsRegister`, `NAccountForm` | [Accounts](accounts.md) |
| Auth | `NSignIn`, `NForgotPassword`, `NResetPassword`, `NAccountSecurity` | [Auth](auth.md) |
| Chrome | `NModal`, `NRemoveIcon`, `NAdminConfigCard`, `NDatePicker`, `NTimePicker` | App only |

Colour and shape are not owned here. Set Vuetify `defaults` in the app (`vuetify.config.js`).

## How the app mounts it

GovRN [`imports/ui/main.js`](../../apps/nexus-govrn/imports/ui/main.js) registers packages, then `createApp` → `app.use(i18n)` → `provide(NEXUS_TRANSLATE_KEY)` and `provide(NEXUS_AUTH_KEY)` → `mount`. Rspack must compile package SFCs (`symlinks: false`). See [`PACKAGES.md`](../../PACKAGES.md).

## What not to do

- Do not import `meteor/*` inside `@nexus/ui`.
- Do not add unprefixed aliases for renamed components.
- Do not hard-code `color` / `rounded` on shared pickers.

## Source map

| Concern | Where |
|---------|--------|
| Public exports | [`packages/ui/src/index.js`](../../packages/ui/src/index.js) |
| i18n factory | [`packages/ui/src/i18n/createNexusI18n.js`](../../packages/ui/src/i18n/createNexusI18n.js) |
| Widgets | [`packages/ui/src/components/`](../../packages/ui/src/components/) |
