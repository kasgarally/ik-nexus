<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
User accounts, suspend, and role assignment
-->
# @nexus/accounts

Admin DDP for Meteor users: create, update, delete, set password, suspend, and replace roles. Uses `meteor/roles` (`roles` + `role-assignment`). Does not own a new roles collection.

Also owns gated self-register, reset-password URLs, optional TOTP wrappers, and OAuth `ServiceConfiguration` when the app injects credentials.

`superadmin` and `admin` have the same account-admin permissions. Full applog visibility is `superadmin` only (`@nexus/applog`). The platform catalog also includes `user` so invite-only products can grant it later without creating it at instantiate time.

This package must **not** import `meteor/*`. The app injects Meteor APIs.

## Contents

- [What this package owns](#what-this-package-owns)
- [Develop in this repo](#develop-in-this-repo)
- [Install in an app](#install-in-an-app)
- [registerWithMeteor](#registerwithmeteor)
- [Role catalogs](#role-catalogs)
- [DDP methods](#ddp-methods)
- [Publications](#publications)
- [Suspend](#suspend)
- [Self-register and OAuth](#self-register-and-oauth)
- [Password reset and 2FA](#password-reset-and-2fa)
- [What this package does not do](#what-this-package-does-not-do)

## What this package owns

- Methods `accounts.users.insert` / `update` / `remove` / `setPassword` / `setSuspended` and `accounts.roles.set`
- Guest methods `accounts.authOptions` and `accounts.selfRegister`
- Publications `accounts.users` and `accounts.roleAssignments` (admin callers only)
- In-memory `registerRoleCatalog` / `listRoleCatalog` / `allAssignableRoleNames` for sub-app role names
- `Accounts.config({ forbidClientAccountCreation: true })`
- Login rejection when `suspendedAt` is set on the user
- Reset-password URL + email templates; client wrappers for password, TOTP, Google, and Facebook

Users stay on `Meteor.users`. Platform roles stay `ADMIN_ROLES` from `@nexus/setup` plus catalog `user`.

## Develop in this repo

`@nexus/accounts` is a pnpm workspace member (`packages/*` only). From the **repo root**:

```bash
pnpm install
```

Do not run `pnpm` inside `apps/`.

## Install in an app

```json
"@nexus/accounts": "file:../../packages/accounts"
```

Then `meteor npm install` in that app. Do not use `workspace:*`.

## registerWithMeteor

Call once on the client and once on the server, after `@nexus/setup`:

```javascript
import { Accounts as NexusAccounts } from '@nexus/accounts'
import { Applog } from '@nexus/applog'
import { Accounts } from 'meteor/accounts-base'
import { check, Match } from 'meteor/check'
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/roles'
import { ServiceConfiguration } from 'meteor/service-configuration'

NexusAccounts.registerWithMeteor({
  Meteor,
  Accounts,
  Roles,
  check,
  Match,
  record: Applog.record,
  ServiceConfiguration,
})
```

Calling it twice throws. `ServiceConfiguration` is optional; without it, OAuth services are never upserted.

## Role catalogs

Each sub-app registers names the assign-roles UI may grant. Register from that sub-app folder (client and server entry). Settings shows those names as-is — no labels in `@nexus/ui`.

```javascript
NexusAccounts.registerRoleCatalog({
  key: 'books',
  roles: [
    { name: 'books.reader', group: 'books' },
    { name: 'books.create', group: 'books' },
  ],
})
```

Register on **client and server**. Startup creates those roles plus `superadmin` / `admin` / `user`.

## DDP methods

Admin methods: caller must be signed in and in `superadmin` or `admin`. Arguments are `check`ed; a client Mongo modifier is never applied.

| Method | Notes |
|--------|--------|
| `accounts.users.insert` | email, name, password; optional roles from catalogs |
| `accounts.users.update` | id, name, email |
| `accounts.users.remove` | not self; not the last superadmin |
| `accounts.users.setPassword` | admin-set password |
| `accounts.users.setSuspended` | not self; not the last superadmin |
| `accounts.roles.set` | replace roles; not the last superadmin |
| `accounts.authOptions` | public: `selfRegister`, configured providers, `heroImage`, `prefillDemo` |
| `accounts.selfRegister` | only when `public.accounts.selfRegister` is true; never grants `superadmin` / `admin` |

## Publications

`accounts.users` fields: `emails`, `profile.name`, `createdAt`, `suspendedAt` — never `services`. `accounts.roleAssignments` is the meteor-roles assignment collection.

## Suspend

`Meteor.users.suspendedAt` is a Date when suspended, otherwise `null`. `Accounts.validateLoginAttempt` rejects a suspended user.

## Self-register and OAuth

Read `Meteor.settings.public.accounts` (`selfRegister`, `selfRegisterRoles`, `heroImage`). Roles must be in a catalog and must not include `superadmin` or `admin`. Default is `["user"]`.

OAuth secrets stay in server-only `Meteor.settings.oauth` (`google.clientId` / `secret`, `facebook.appId` / `secret`). Empty pairs skip `ServiceConfiguration` and hide that button.

When self-register is off, `Accounts.onCreateUser` / `validateNewUser` reject **new** Google/Facebook users. Existing users who already linked OAuth can still sign in.

## Password reset and 2FA

`Accounts.urls.resetPassword` is `/reset-password/:token`. Without `MAIL_URL`, Meteor prints the reset email on the server console.

Client helpers (after `registerWithMeteor`): `loginWithPassword({ email, password, code })`, `forgotPassword`, `resetPassword`, `generate2faQr`, `enable2fa`, `disable2fa`, `has2fa`, `loginWithGoogle`, `loginWithFacebook`. The Vue app provides those through `NEXUS_AUTH_KEY`.

## What this package does not do

- Vue screens (those are `@nexus/ui`: `NSignIn`, `NResetPassword`, `NAccountSecurity`, `NSettingsWorkspace`, `NAccountsRegister`, `NAccountForm`)
- Applog read access (that is `@nexus/applog`, superadmin only)
- SMTP / SendGrid setup
