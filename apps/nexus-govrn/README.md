<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
GovRN Meteor app
-->
# nexus-govrn

Meteor 3 + Vue 3 product app. First boot is gated by `/onboarding` until `nexus_setup` exists. Local JSONC can seed that document plus `admin@localhost` so a `meteor reset` still has data.

## Contents

- [How to run](#how-to-run)
  - [Stale process on port 3000](#stale-process-on-port-3000)
- [Settings](#settings)
  - [Locale settings](#locale-settings)
- [Accounts UI](#accounts-ui)
- [Dev seed](#dev-seed)
- [Libraries used](#libraries-used)
- [Developer guide](#developer-guide)

## How to run

From the repository root:

```bash
pnpm install
cd apps/nexus-govrn
meteor npm install
meteor npm start
```

Open `http://localhost:3000`. With `public.devSeedAdmin: true`, a blank database is seeded and skips the wizard. Without that flag, first boot opens `/onboarding`.

### Stale process on port 3000

`meteor npm start` leaves Node listening on 3000 if the terminal is closed, an agent task is aborted, or the process is otherwise orphaned. The next start then fails with `EADDRINUSE`.

Free the default Meteor port (stops only a **Node** / Meteor listener):

```bash
# from the repo root
pnpm run kill-port

# from this app
meteor npm run kill-port
```

Another port (Meteor’s local Mongo is often 3001):

```bash
pnpm run kill-port -- 3001
meteor npm run kill-port -- 3001
```

The script is [`scripts/kill-port.mjs`](../../scripts/kill-port.mjs). It does not kill a non-Node process that happens to bind the port.

## Settings

Author [`settings.jsonc`](settings.jsonc). `meteor npm start` (or `meteor npm run settings:build`) calls the shared [`scripts/build-settings.mjs`](../../scripts/build-settings.mjs) and writes `settings.json`. That generated file is gitignored. Other Meteor apps use the same script from their own folder:

```bash
node ../../scripts/build-settings.mjs
```

`Meteor.settings.public` is for flags (and later a license URL) plus the locale block below. Company fields do not live here.

### Locale settings

GovRN ships three UI languages and three data languages so the picker and the translatable field tabs are both visible:

```jsonc
"locales": {
  "defaultUi": "en",
  "ui": ["en", "fr", "ar"],
  "defaultData": "en",
  "data": ["en", "fr", "ar"]
}
```

All four keys are mandatory. `defaultData` must be `en` and `data` must include `en` (the minimum stored map is `{ en }`). `defaultUi` must be in `ui`, `defaultData` must be in `data`, and every `data` code must appear in `ui`. Invalid settings fail startup. With `data: ["en"]` only, translatable fields render a single control (no tabs, no translate) and `locales.translate` is refused.

- **UI** — `NLocaleSelect` and vue-i18n chrome. Hidden when `ui` has fewer than two codes. A stored locale that is not in `ui` falls back to `defaultUi`. Missing catalogs (for example `es`) stay on `defaultUi` English chrome until a pack is added.
- **Data** — keys stored on list titles and Books prose (`title`, `description`, `author`, `aboutAuthor`, `publisher`). Lists persist whatever is in `data`, including codes with no UI pack. Other Book fields stay scalars.

Books prose fields (`title`, `description`, `author`, `aboutAuthor`, `publisher`) use `NTranslatableTextField` / `NTranslatableTextarea`. Tabs and translate follow **data** locales, not the header picker. Click translate to fill empty locales; the chevron offers replace-all. `locales.translate` is a logged-in DDP method (Google Translate unofficial client on the server). Views resolve through `locales.data` only: `map[uiLocale]` when that code is in `data`, else `map[defaultData]`, else `''`. A leftover `title.fr` is ignored when `data` is `["en"]`. Legacy strings coerce to `{ [defaultData]: value }`.

## Accounts UI

`/settings` is core app UI in [`imports/ui/settings/`](imports/ui/settings/README.md), not a cloneable sub-app. Named views mount `@nexus/ui` widgets; DDP is `@nexus/accounts`.

## Dev seed

[`imports/api/demoSeedData.js`](imports/api/demoSeedData.js) holds the demo company, address, logo/icon data URLs, and `admin@localhost` credentials. Change that file when the seed payload should change; [`demoAdmin.js`](imports/api/demoAdmin.js) only applies it.

`public.devSeedAdmin: true` inserts `nexus_setup` (if missing) and the demo admin. Production must omit the key or set it `false`.

## Libraries used

- [Vue 3](https://v3.vuejs.org/)
- [Rspack](https://rspack.dev/)
- [Vue Router](https://next.router.vuejs.org/)
- [Meteor](https://www.meteor.com/)
- [Vue Meteor Tracker](https://github.com/meteor-vue/vue-meteor-tracker)
- [Vuetify](https://vuetifyjs.com/)

## Developer guide

How the app is assembled (locales, lists, fields, files, setup, accounts, applog): [`docs/architecture/_Architecture.md`](../../docs/architecture/_Architecture.md). Package wiring and `registerWithMeteor`: [`PACKAGES.md`](../../PACKAGES.md).
