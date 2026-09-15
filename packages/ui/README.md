<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Shared NEXUS UI package
-->
# @nexus/ui

Shared Vue 3 components and i18n bootstrap for NEXUS Meteor apps. Source is consumed today via a `file:` dependency. The same `@nexus/ui` import path will work after an npm publish.

## Contents

- [What this package owns](#what-this-package-owns)
- [Develop in this repo](#develop-in-this-repo)
- [Install in an app](#install-in-an-app)
- [Create the i18n instance](#create-the-i18n-instance)
- [Use LocaleSelect](#use-localeselect)
- [Docker](#docker)
- [Later: publish to npm](#later-publish-to-npm)

## What this package owns

- `LocaleSelect` — language menu (EN / FR / AR, RTL for Arabic)
- `createNexusI18n` — vue-i18n factory with core `locale.*` strings and Vuetify `$vuetify` catalogs
- Helpers: `setAppLocale`, `supportedLocales`, `applyDocumentLocale`, `readStoredLocale`, `persistLocale`

Layouts and Vuetify theme/defaults stay in each app.

## Develop in this repo

`@nexus/ui` is a pnpm workspace member (`packages/*` only). From the **repo root**:

```bash
pnpm install
```

That does not install or hoist Meteor apps. Do not add `apps/` to [`pnpm-workspace.yaml`](../../pnpm-workspace.yaml).

## Install in an app

```json
"@nexus/ui": "file:../../packages/ui"
```

Then `meteor npm install`. Point Rspack at the package source so `vue-loader` compiles the SFCs:

```js
resolve: {
  // file: installs @nexus/ui as a junction; keep the importer under node_modules
  // so vue / vue-i18n / vuetify resolve from the app.
  symlinks: false,
},
```

Do not alias `vuetify` to its package root — that breaks `vuetify/styles` and other subpaths.

## Create the i18n instance

```js
import { createNexusI18n } from '@nexus/ui'
import ar from './ar.js'
import en from './en.js'
import fr from './fr.js'

export const i18n = createNexusI18n({
  storageKey: 'your-app-locale',
  messages: { en, fr, ar },
})
```

`app.use(i18n)` also provides the storage key so `LocaleSelect` persists the choice. Keep Vuetify’s `createVueI18nAdapter({ i18n, useI18n })` in the app.

## Use LocaleSelect

```js
import { LocaleSelect } from '@nexus/ui'
```

```html
<LocaleSelect />
```

## Docker

The image copies `packages/` to `/packages` before `meteor npm ci`. From `/opt/src`, `file:../../packages/ui` is `/packages/ui`. See [docker/README.md](../../docker/README.md#shared-packages).

## Later: publish to npm

Keep the `@nexus/ui` import. Change the app dependency from `file:../../packages/ui` to a version. Optionally point `exports` at a built `dist` without changing callers.
