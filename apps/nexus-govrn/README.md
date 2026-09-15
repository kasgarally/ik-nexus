<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
GovRN Meteor app
-->
# nexus-govrn

Meteor 3 + Vue 3 product app. First boot is gated by `/onboarding` until `nexus_setup` exists. Local JSONC can seed that document plus `admin@localhost` so a `meteor reset` still has data.

## Contents

- [How to run](#how-to-run)
- [Settings](#settings)
- [Dev seed](#dev-seed)
- [Libraries used](#libraries-used)

## How to run

From the repository root:

```bash
pnpm install
cd apps/nexus-govrn
meteor npm install
meteor npm start
```

Open `http://localhost:3000`. With `public.devSeedAdmin: true`, a blank database is seeded and skips the wizard. Without that flag, first boot opens `/onboarding`.

## Settings

Author [`settings.jsonc`](settings.jsonc). `meteor npm start` (or `meteor npm run settings:build`) calls the shared [`scripts/build-settings.mjs`](../../scripts/build-settings.mjs) and writes `settings.json`. That generated file is gitignored. Other Meteor apps use the same script from their own folder:

```bash
node ../../scripts/build-settings.mjs
```

`Meteor.settings.public` is for flags (and later a license URL). Company fields do not live here.

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
