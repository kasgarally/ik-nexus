<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
GovRN Settings routes that mount @nexus/ui admin screens
-->
# Settings

Core admin UI for every Meteor app in this repo. Routes and thin wrappers live here under `imports/ui/settings/`. Widgets live in `@nexus/ui`. DDP lives in `@nexus/accounts`, `@nexus/org`, and `@nexus/setup`. This is not a cloneable sub-app.

## Contents

- [What belongs here](#what-belongs-here)

## What belongs here

- `routes.js` — named views (`/settings`, `/settings/accounts`, `/settings/accounts/:id`, `/settings/org`, `/settings/setup`)
- Thin screens that mount `NSettingsWorkspace`, `NAccountsRegister`, `NAccountForm`, `NOrgTreeEditor`, `NSetupForm`
- Vue `v-if` on `superadmin` / `admin` is display only
- Not account methods (those are `@nexus/accounts`)
- Not org methods (those are `@nexus/org`)
- Not setup methods (those are `@nexus/setup`)
- Not Meteor `settings.jsonc` (that is the app README Settings section)
