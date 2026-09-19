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
  - [Accounts settings](#accounts-settings)
- [Accounts UI](#accounts-ui)
- [Demo UI](#demo-ui)
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

### Accounts settings

GovRN is invite-only. `public.accounts.selfRegister` stays `false`, so `/signin` hides signup and Google/Facebook. Admin-created users only.

```jsonc
"accounts": {
  "selfRegister": false,
  "selfRegisterRoles": ["user"],
  "heroImage": "https://images.unsplash.com/photo-1486406149926-2bddad0bc895?auto=format&fit=crop&w=1600&q=80"
}
```

`heroImage` is a CSS background the **browser** loads: a full Unsplash (or other `http(s)`) URL, or a file you drop in `public/` (for example `public/auth-hero.jpg` and `"heroImage": "/auth-hero.jpg"`). The Meteor server does not fetch that URL.

OAuth client id/secret stay in server-only `oauth.google` / `oauth.facebook`, never in `public`. Leave them empty until another product turns `selfRegister` on. `selfRegisterRoles` defaults to `["user"]` and must not include `superadmin` or `admin`.

Forgot-password emails use Meteor Accounts. Without `MAIL_URL`, the reset link is printed on the **server console**. Open `/reset-password/:token` from that URL. Optional TOTP is enrolled on `/account` by any signed-in user.

- **UI** — `NLocaleSelect` and vue-i18n chrome. Hidden when `ui` has fewer than two codes. A stored locale that is not in `ui` falls back to `defaultUi`. Missing catalogs (for example `es`) stay on `defaultUi` English chrome until a pack is added.
- **Data** — keys stored on list titles and Books prose (`title`, `description`, `author`, `aboutAuthor`, `publisher`). Lists persist whatever is in `data`, including codes with no UI pack. Other Book fields stay scalars.

Books prose fields (`title`, `description`, `author`, `aboutAuthor`, `publisher`) use `NTranslatableTextField` / `NTranslatableTextarea`. Tabs and translate follow **data** locales, not the header picker. Click translate to fill empty locales; the chevron offers replace-all. `locales.translate` is a logged-in DDP method (Google Translate unofficial client on the server). Views resolve through `locales.data` only: `map[uiLocale]` when that code is in `data`, else `map[defaultData]`, else `''`. A leftover `title.fr` is ignored when `data` is `["en"]`. Legacy strings coerce to `{ [defaultData]: value }`.

## Accounts UI

`/settings` is core app UI in [`imports/ui/settings/`](imports/ui/settings/README.md), not a cloneable sub-app. Named views mount `@nexus/ui` widgets; DDP is `@nexus/accounts`, `@nexus/org` (`/settings/org`), and `@nexus/setup` (`/settings/setup`).

`/signin`, `/forgot-password`, `/reset-password/:token`, and `/account` mount `NSignIn` / reset / `NAccountSecurity`. Helpers are provided from [`imports/ui/authProvide.js`](imports/ui/authProvide.js). Sign-in design: [`docs/architecture/auth.md`](../../docs/architecture/auth.md).

## Demo UI

Layout and widget previews (files, lists, submissions chrome, governance, invoice) live in [`imports/ui/demo/`](imports/ui/demo/README.md). They are not product sub-apps. Paths such as `/files-test` and `/submissions` are unchanged.

## Dev seed

[`imports/api/demoSeedData.js`](imports/api/demoSeedData.js) holds the demo company, address, logo/icon data URLs, `admin@localhost` credentials, extra demo users, and the dummy `nexus_org` tree. Change that file when the seed payload should change; [`demoAdmin.js`](imports/api/demoAdmin.js), [`demoUsers.js`](imports/api/demoUsers.js), and [`demoOrg.js`](imports/api/demoOrg.js) apply it. Org seed runs only when `nexus_org` is empty.

`public.devSeedAdmin: true` inserts `nexus_setup` (if missing) and the demo admin (`admin@localhost` / `admin`).

`public.devSeedUsers: true` inserts nine extra `@localhost` accounts after setup exists (local `meteor` and the Docker image both honor the flag). Password for all nine is `password`. Eight have the `user` role; `grace@localhost` also has `admin` (not `superadmin`) so you can compare admin vs superadmin. Restart the Meteor process (or recreate the Docker meteor container) after a first enable of the flag. Production must omit both keys or set them `false`.

## Libraries used

- [Vue 3](https://v3.vuejs.org/)
- [Rspack](https://rspack.dev/)
- [Vue Router](https://next.router.vuejs.org/)
- [Meteor](https://www.meteor.com/)
- [Vue Meteor Tracker](https://github.com/meteor-vue/vue-meteor-tracker)
- [Vuetify](https://vuetifyjs.com/)

## Developer guide

How the app is assembled (locales, lists, fields, files, setup, accounts, auth, org, actions, applog): [`docs/architecture/_Architecture.md`](../../docs/architecture/_Architecture.md). Package wiring and `registerWithMeteor`: [`PACKAGES.md`](../../PACKAGES.md).
