<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
GovRN Settings routes that mount @nexus/ui account screens
-->
# Settings

Thin named-view routes for `/settings`. Widgets live in `@nexus/ui`. DDP lives in `@nexus/accounts`.

## Contents

- [What belongs here](#what-belongs-here)

## What belongs here

- `client/routes.js` — named views
- Thin `screens/` / `views/` that mount `NSettingsWorkspace`, `NAccountsRegister`, `NAccountForm`
- Vue `v-if` on `superadmin` / `admin` is display only
- Not account methods (those are `@nexus/accounts`)
