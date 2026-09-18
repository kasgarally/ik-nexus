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
