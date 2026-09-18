<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
GovRN Settings routes that mount @nexus/ui account screens
-->
# Settings

Core admin UI for every Meteor app in this repo. Routes and thin wrappers live here under `imports/ui/settings/`. Widgets live in `@nexus/ui`. DDP lives in `@nexus/accounts`. This is not a cloneable sub-app.

## Contents

- [What belongs here](#what-belongs-here)

## What belongs here

- `routes.js` — named views (`/settings`, `/settings/accounts`, `/settings/accounts/:id`)
- Thin screens that mount `NSettingsWorkspace`, `NAccountsRegister`, `NAccountForm`
- Vue `v-if` on `superadmin` / `admin` is display only
- Not account methods (those are `@nexus/accounts`)
- Not Meteor `settings.jsonc` (that is the app README Settings section)
